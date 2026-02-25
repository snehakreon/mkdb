import bcrypt from "bcryptjs";
import pool from "../config/db";

async function seed() {
  console.log("Seeding database...");

  try {
    // Check if admin user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@platform.com"]
    );

    if (existing.rows.length > 0) {
      console.log("Admin user already exists, skipping...");
    } else {
      // Generate proper bcrypt hash for 'admin123'
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // Insert admin user
      const userResult = await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true, true)
         RETURNING id`,
        [
          "admin@platform.com",
          "9999999999",
          hashedPassword,
          "Platform",
          "Admin",
          "admin",
        ]
      );

      const userId = userResult.rows[0].id;

      // Assign super_admin role
      await pool.query(
        `INSERT INTO user_roles (user_id, role, is_active)
         VALUES ($1, $2, true)`,
        [userId, "super_admin"]
      );

      console.log("Admin user created successfully:");
      console.log("  Email: admin@platform.com");
      console.log("  Password: admin123");
      console.log("  Role: super_admin");
    }

    // Run migrations to add missing columns
    console.log("\nRunning migrations...");

    // -- users table: columns needed by auth controller --
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='failed_login_attempts') THEN
          ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='locked_until') THEN
          ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
          ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified') THEN
          ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
          ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
      END $$;
    `);
    console.log("  users table columns OK");

    // -- user_sessions table: ensure it exists with correct columns --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info JSONB,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_sessions' AND column_name='refresh_token') THEN
          ALTER TABLE user_sessions ADD COLUMN refresh_token VARCHAR(500);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_sessions' AND column_name='expires_at') THEN
          ALTER TABLE user_sessions ADD COLUMN expires_at TIMESTAMP;
        END IF;
      END $$;
    `);
    console.log("  user_sessions table OK");

    // -- user_roles table: ensure it exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        permissions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        assigned_by UUID REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  user_roles table OK");

    // -- categories: add slug if missing --
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='slug') THEN
          ALTER TABLE categories ADD COLUMN slug VARCHAR(100);
        END IF;
      END $$;
    `);
    await pool.query(
      `UPDATE categories SET slug = LOWER(REPLACE(category_name, ' ', '-')) WHERE slug IS NULL`
    );

    // -- brands: add slug if missing --
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='slug') THEN
          ALTER TABLE brands ADD COLUMN slug VARCHAR(100);
        END IF;
      END $$;
    `);
    await pool.query(
      `UPDATE brands SET slug = LOWER(REPLACE(brand_name, ' ', '-')) WHERE slug IS NULL`
    );

    console.log("Migrations complete.");
  } catch (error: any) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
