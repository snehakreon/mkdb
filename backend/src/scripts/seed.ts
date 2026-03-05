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

    // -- brands: make slug nullable and backfill --
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE brands ALTER COLUMN slug DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);
    await pool.query(
      `UPDATE brands SET slug = LOWER(REGEXP_REPLACE(brand_name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL`
    );

    // -- categories: make slug nullable and backfill --
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE categories ALTER COLUMN slug DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);
    await pool.query(
      `UPDATE categories SET slug = LOWER(REGEXP_REPLACE(category_name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL`
    );
    console.log("  slug columns fixed");

    // -- categories: add category_code if missing --
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='category_code') THEN
          ALTER TABLE categories ADD COLUMN category_code VARCHAR(20);
        END IF;
      END $$;
    `);
    await pool.query(
      `UPDATE categories SET category_code = 'CAT-' || UPPER(LEFT(REPLACE(category_name, ' ', ''), 3)) WHERE category_code IS NULL`
    );

    // -- brands: add brand_code if missing --
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='brand_code') THEN
          ALTER TABLE brands ADD COLUMN brand_code VARCHAR(20);
        END IF;
      END $$;
    `);
    await pool.query(
      `UPDATE brands SET brand_code = 'BRD-' || UPPER(LEFT(REPLACE(brand_name, ' ', ''), 3)) WHERE brand_code IS NULL`
    );

    // -- zone_pincodes: city and state are optional per schema --
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE zone_pincodes ALTER COLUMN city DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE zone_pincodes ALTER COLUMN state DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // -- Ensure buyers table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buyers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        gstin VARCHAR(15),
        pan VARCHAR(10),
        company_address TEXT,
        billing_address TEXT,
        company_type VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  buyers table OK");

    // -- Ensure projects table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(50) UNIQUE NOT NULL,
        project_type VARCHAR(50),
        delivery_address TEXT NOT NULL,
        delivery_pincode VARCHAR(10) NOT NULL,
        delivery_city VARCHAR(100),
        delivery_state VARCHAR(100),
        delivery_landmark TEXT,
        delivery_zone_id UUID REFERENCES zones(id),
        site_manager_name VARCHAR(100),
        site_manager_phone VARCHAR(15),
        estimated_budget DECIMAL(15, 2),
        start_date DATE,
        expected_completion_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  projects table OK");

    // -- Ensure dealers table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dealers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dealer_code VARCHAR(20) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        gstin VARCHAR(15) UNIQUE NOT NULL,
        pan VARCHAR(10) NOT NULL,
        bank_account_number VARCHAR(50),
        bank_ifsc VARCHAR(11),
        bank_name VARCHAR(100),
        bank_branch VARCHAR(100),
        credit_limit DECIMAL(15, 2) DEFAULT 0,
        available_credit DECIMAL(15, 2) DEFAULT 0,
        credit_payment_terms_days INT DEFAULT 0,
        approval_status VARCHAR(20) DEFAULT 'pending',
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        business_address TEXT,
        contact_phone VARCHAR(15),
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  dealers table OK");

    // -- Ensure orders table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        buyer_id UUID NOT NULL REFERENCES buyers(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        dealer_id UUID REFERENCES dealers(id),
        zone_id UUID NOT NULL REFERENCES zones(id),
        assigned_vendor_id UUID REFERENCES vendors(id),
        order_type VARCHAR(20) NOT NULL,
        order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
        subtotal DECIMAL(15, 2) NOT NULL,
        shipping_cost DECIMAL(10, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(15, 2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_mode VARCHAR(30),
        payment_reference VARCHAR(100),
        delivery_address TEXT NOT NULL,
        delivery_pincode VARCHAR(10) NOT NULL,
        delivery_contact_name VARCHAR(100),
        delivery_contact_phone VARCHAR(15),
        delivery_otp VARCHAR(6),
        expected_delivery_date DATE,
        actual_delivery_date DATE,
        buyer_notes TEXT,
        admin_notes TEXT,
        cancellation_reason TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  orders table OK");

    // -- Ensure order_items table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        tier_applied INT,
        discount_per_unit DECIMAL(10, 2) DEFAULT 0,
        line_total DECIMAL(15, 2) NOT NULL,
        cbm_per_unit DECIMAL(10, 5),
        total_cbm DECIMAL(10, 3),
        shipping_cost DECIMAL(10, 2) DEFAULT 0,
        fulfillment_status VARCHAR(20) DEFAULT 'pending',
        quantity_dispatched INT DEFAULT 0,
        quantity_delivered INT DEFAULT 0,
        quantity_back_order INT DEFAULT 0,
        product_name_snapshot VARCHAR(255),
        sku_code_snapshot VARCHAR(50),
        hsn_code_snapshot VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  order_items table OK");

    // -- Ensure zone_vendor_assignments table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zone_vendor_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        priority INT DEFAULT 1,
        assigned_by UUID REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deactivated_at TIMESTAMP,
        UNIQUE(zone_id)
      );
    `);
    console.log("  zone_vendor_assignments table OK");

    console.log("Migrations complete.");
  } catch (error: any) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
