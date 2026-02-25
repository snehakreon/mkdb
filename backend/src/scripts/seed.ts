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

    // Run migration to add slug columns if missing
    console.log("\nRunning migrations...");

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'categories' AND column_name = 'slug'
        ) THEN
          ALTER TABLE categories ADD COLUMN slug VARCHAR(100);
        END IF;
      END $$;
    `);
    await pool.query(
      `UPDATE categories SET slug = LOWER(REPLACE(category_name, ' ', '-')) WHERE slug IS NULL`
    );

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'brands' AND column_name = 'slug'
        ) THEN
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
