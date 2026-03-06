import bcrypt from "bcryptjs";
import pool from "../config/db";

async function seed() {
  console.log("Seeding database...");

  try {
    // Generate proper bcrypt hash for 'admin123'
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if admin user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@platform.com"]
    );

    if (existing.rows.length > 0) {
      const userId = existing.rows[0].id;
      // Always reset password, ensure active/verified, and ensure role exists
      await pool.query(
        `UPDATE users SET password_hash = $1, is_active = true, is_verified = true,
         failed_login_attempts = 0, locked_until = NULL WHERE id = $2`,
        [hashedPassword, userId]
      );
      // Ensure role exists
      const roleCheck = await pool.query(
        `SELECT id FROM user_roles WHERE user_id = $1 AND role = 'super_admin'`,
        [userId]
      );
      if (roleCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'super_admin', true)`,
          [userId]
        );
      }
      console.log("Admin user updated (password reset to admin123)");
    } else {
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
    }
    console.log("  Email: admin@platform.com");
    console.log("  Password: admin123");
    console.log("  Role: super_admin");

    // Run migrations to add missing columns/tables
    console.log("\nRunning migrations...");

    // -- Enable UUID extension --
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // -- Ensure zones table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone_name VARCHAR(100) UNIQUE NOT NULL,
        zone_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Add description column if missing
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='zones' AND column_name='description') THEN
          ALTER TABLE zones ADD COLUMN description TEXT;
        END IF;
      END $$;
    `);
    console.log("  zones table OK");

    // -- Ensure zone_pincodes table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zone_pincodes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
        pincode VARCHAR(10) NOT NULL UNIQUE,
        city VARCHAR(100),
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  zone_pincodes table OK");

    // -- Ensure vendors table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        vendor_code VARCHAR(20) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        trading_name VARCHAR(255),
        gstin VARCHAR(15) UNIQUE NOT NULL,
        pan VARCHAR(10),
        business_type VARCHAR(50),
        bank_account_number VARCHAR(50),
        bank_ifsc VARCHAR(11),
        bank_name VARCHAR(100),
        bank_branch VARCHAR(100),
        registered_office_address TEXT,
        warehouse_address TEXT,
        warehouse_pincode VARCHAR(10),
        warehouse_city VARCHAR(100),
        warehouse_state VARCHAR(100),
        contact_person_name VARCHAR(100),
        contact_phone VARCHAR(15),
        contact_email VARCHAR(255),
        verification_status VARCHAR(20) DEFAULT 'pending',
        verification_notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  vendors table OK");

    // -- Ensure categories table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_name VARCHAR(100) UNIQUE NOT NULL,
        category_code VARCHAR(20),
        slug VARCHAR(100),
        parent_category_id UUID REFERENCES categories(id),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  categories table OK");

    // -- Ensure brands table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        brand_name VARCHAR(100) UNIQUE NOT NULL,
        brand_code VARCHAR(20),
        slug VARCHAR(100),
        logo_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  brands table OK");

    // -- Ensure products table exists --
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sku_code VARCHAR(50) UNIQUE NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id),
        brand_id UUID REFERENCES brands(id),
        description TEXT,
        specifications JSONB DEFAULT '{}',
        hsn_code VARCHAR(10),
        weight_kg DECIMAL(10, 2),
        length_ft DECIMAL(10, 2),
        width_ft DECIMAL(10, 2),
        height_ft DECIMAL(10, 3),
        cbm_per_unit DECIMAL(10, 5),
        tech_sheet_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  products table OK");

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

    // ========================================================================
    // ENSURE ALL COLUMNS EXIST (patch tables created from older schemas)
    // ========================================================================
    const addColIfMissing = async (table: string, col: string, type: string) => {
      await pool.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='${col}') THEN
            ALTER TABLE ${table} ADD COLUMN ${col} ${type};
          END IF;
        END $$;
      `);
    };

    // zones
    await addColIfMissing('zones', 'zone_code', 'VARCHAR(20)');
    await addColIfMissing('zones', 'description', 'TEXT');
    // categories
    await addColIfMissing('categories', 'category_code', 'VARCHAR(20)');
    // brands
    await addColIfMissing('brands', 'brand_code', 'VARCHAR(20)');
    // products
    await addColIfMissing('products', 'sku_code', 'VARCHAR(50)');
    await addColIfMissing('products', 'product_name', 'VARCHAR(255)');
    await addColIfMissing('products', 'category_id', 'UUID');
    await addColIfMissing('products', 'brand_id', 'UUID');
    await addColIfMissing('products', 'description', 'TEXT');
    await addColIfMissing('products', 'hsn_code', 'VARCHAR(10)');
    await addColIfMissing('products', 'weight_kg', 'DECIMAL(10,2)');
    await addColIfMissing('products', 'length_ft', 'DECIMAL(10,2)');
    await addColIfMissing('products', 'width_ft', 'DECIMAL(10,2)');
    await addColIfMissing('products', 'height_ft', 'DECIMAL(10,3)');
    await addColIfMissing('products', 'specifications', "JSONB DEFAULT '{}'");
    await addColIfMissing('products', 'is_active', 'BOOLEAN DEFAULT TRUE');
    // vendors
    await addColIfMissing('vendors', 'pan', 'VARCHAR(10)');
    await addColIfMissing('vendors', 'contact_person_name', 'VARCHAR(100)');
    // dealers
    await addColIfMissing('dealers', 'business_address', 'TEXT');
    await addColIfMissing('dealers', 'contact_phone', 'VARCHAR(15)');
    await addColIfMissing('dealers', 'contact_email', 'VARCHAR(255)');
    // buyers
    await addColIfMissing('buyers', 'company_type', 'VARCHAR(50)');
    // orders
    await addColIfMissing('orders', 'delivery_contact_name', 'VARCHAR(100)');
    await addColIfMissing('orders', 'delivery_contact_phone', 'VARCHAR(15)');
    await addColIfMissing('orders', 'buyer_notes', 'TEXT');
    // order_items
    await addColIfMissing('order_items', 'product_name_snapshot', 'VARCHAR(255)');
    await addColIfMissing('order_items', 'sku_code_snapshot', 'VARCHAR(50)');
    console.log("  all column migrations applied");

    // ========================================================================
    // DEMO DATA
    // ========================================================================
    console.log("\nSeeding demo data...");

    // -- Demo Zones --
    const zoneRows = await pool.query(`SELECT id FROM zones WHERE zone_code = 'ZONE-MUM'`);
    let zoneMumId: string, zoneDelId: string, zoneBanId: string;
    if (zoneRows.rows.length === 0) {
      const z1 = await pool.query(
        `INSERT INTO zones (zone_name, zone_code, is_active) VALUES ('Mumbai Metro', 'ZONE-MUM', true) RETURNING id`
      );
      const z2 = await pool.query(
        `INSERT INTO zones (zone_name, zone_code, is_active) VALUES ('Delhi NCR', 'ZONE-DEL', true) RETURNING id`
      );
      const z3 = await pool.query(
        `INSERT INTO zones (zone_name, zone_code, is_active) VALUES ('Bangalore Urban', 'ZONE-BAN', true) RETURNING id`
      );
      zoneMumId = z1.rows[0].id;
      zoneDelId = z2.rows[0].id;
      zoneBanId = z3.rows[0].id;

      // Add pincodes
      await pool.query(`INSERT INTO zone_pincodes (zone_id, pincode, city, state) VALUES ($1, '400001', 'Mumbai', 'Maharashtra') ON CONFLICT DO NOTHING`, [zoneMumId]);
      await pool.query(`INSERT INTO zone_pincodes (zone_id, pincode, city, state) VALUES ($1, '400002', 'Mumbai', 'Maharashtra') ON CONFLICT DO NOTHING`, [zoneMumId]);
      await pool.query(`INSERT INTO zone_pincodes (zone_id, pincode, city, state) VALUES ($1, '110001', 'New Delhi', 'Delhi') ON CONFLICT DO NOTHING`, [zoneDelId]);
      await pool.query(`INSERT INTO zone_pincodes (zone_id, pincode, city, state) VALUES ($1, '560001', 'Bangalore', 'Karnataka') ON CONFLICT DO NOTHING`, [zoneBanId]);
      console.log("  3 demo zones + pincodes added");
    } else {
      zoneMumId = zoneRows.rows[0].id;
      const z2 = await pool.query(`SELECT id FROM zones WHERE zone_code = 'ZONE-DEL'`);
      const z3 = await pool.query(`SELECT id FROM zones WHERE zone_code = 'ZONE-BAN'`);
      zoneDelId = z2.rows[0]?.id || zoneMumId;
      zoneBanId = z3.rows[0]?.id || zoneMumId;
      console.log("  demo zones already exist, skipping");
    }

    // -- Demo Categories --
    const catCheck = await pool.query(`SELECT id FROM categories WHERE category_code = 'CAT-PLY'`);
    let catPlyId: string, catCemId: string, catTilId: string;
    if (catCheck.rows.length === 0) {
      const c1 = await pool.query(`INSERT INTO categories (category_name, category_code, is_active) VALUES ('Plywood', 'CAT-PLY', true) RETURNING id`);
      const c2 = await pool.query(`INSERT INTO categories (category_name, category_code, is_active) VALUES ('Cement', 'CAT-CEM', true) RETURNING id`);
      const c3 = await pool.query(`INSERT INTO categories (category_name, category_code, is_active) VALUES ('Tiles', 'CAT-TIL', true) RETURNING id`);
      catPlyId = c1.rows[0].id; catCemId = c2.rows[0].id; catTilId = c3.rows[0].id;
      console.log("  3 demo categories added");
    } else {
      catPlyId = catCheck.rows[0].id;
      const c2 = await pool.query(`SELECT id FROM categories WHERE category_code = 'CAT-CEM'`);
      const c3 = await pool.query(`SELECT id FROM categories WHERE category_code = 'CAT-TIL'`);
      catCemId = c2.rows[0]?.id || catPlyId;
      catTilId = c3.rows[0]?.id || catPlyId;
      console.log("  demo categories already exist, skipping");
    }

    // -- Demo Brands --
    const brdCheck = await pool.query(`SELECT id FROM brands WHERE brand_code = 'BRD-CEN'`);
    let brdCenId: string, brdAccId: string, brdKajId: string;
    if (brdCheck.rows.length === 0) {
      const b1 = await pool.query(`INSERT INTO brands (brand_name, brand_code, is_active) VALUES ('Century Plyboards', 'BRD-CEN', true) RETURNING id`);
      const b2 = await pool.query(`INSERT INTO brands (brand_name, brand_code, is_active) VALUES ('ACC Cement', 'BRD-ACC', true) RETURNING id`);
      const b3 = await pool.query(`INSERT INTO brands (brand_name, brand_code, is_active) VALUES ('Kajaria Tiles', 'BRD-KAJ', true) RETURNING id`);
      brdCenId = b1.rows[0].id; brdAccId = b2.rows[0].id; brdKajId = b3.rows[0].id;
      console.log("  3 demo brands added");
    } else {
      brdCenId = brdCheck.rows[0].id;
      const b2 = await pool.query(`SELECT id FROM brands WHERE brand_code = 'BRD-ACC'`);
      const b3 = await pool.query(`SELECT id FROM brands WHERE brand_code = 'BRD-KAJ'`);
      brdAccId = b2.rows[0]?.id || brdCenId;
      brdKajId = b3.rows[0]?.id || brdCenId;
      console.log("  demo brands already exist, skipping");
    }

    // -- Demo Vendors --
    const venCheck = await pool.query(`SELECT id FROM vendors WHERE vendor_code = 'VND-001'`);
    let vendorId: string;
    if (venCheck.rows.length === 0) {
      const v1 = await pool.query(
        `INSERT INTO vendors (vendor_code, company_name, gstin, pan, contact_person_name, contact_phone, contact_email, verification_status, is_active)
         VALUES ('VND-001', 'Sharma Building Supplies', '27AAPCS1234F1ZV', 'AAPCS1234F', 'Rajesh Sharma', '9876543210', 'rajesh@sharmasupplies.com', 'verified', true) RETURNING id`
      );
      vendorId = v1.rows[0].id;
      await pool.query(
        `INSERT INTO vendors (vendor_code, company_name, gstin, pan, contact_person_name, contact_phone, contact_email, verification_status, is_active)
         VALUES ('VND-002', 'Metro Hardware Distributors', '07BBPPM5678G2ZQ', 'BBPPM5678G', 'Amit Patel', '9876543211', 'amit@metrohardware.com', 'verified', true)`
      );
      console.log("  2 demo vendors added");
    } else {
      vendorId = venCheck.rows[0].id;
      console.log("  demo vendors already exist, skipping");
    }

    // -- Demo Products --
    const prodCheck = await pool.query(`SELECT id FROM products WHERE sku_code = 'PLY-CEN-18MM-BWP'`);
    let prod1Id: string, prod2Id: string, prod3Id: string;
    if (prodCheck.rows.length === 0) {
      const p1 = await pool.query(
        `INSERT INTO products (sku_code, product_name, category_id, brand_id, description, hsn_code, weight_kg, length_ft, width_ft, height_ft, specifications, is_active)
         VALUES ('PLY-CEN-18MM-BWP', 'Century 18mm BWP Plywood', $1, $2, 'Premium boiling water proof plywood, IS:710 grade', '4412', 28.5, 8, 4, 0.059, '{"thickness":"18mm","grade":"BWP","standard":"IS:710"}', true) RETURNING id`,
        [catPlyId, brdCenId]
      );
      const p2 = await pool.query(
        `INSERT INTO products (sku_code, product_name, category_id, brand_id, description, hsn_code, weight_kg, length_ft, width_ft, height_ft, specifications, is_active)
         VALUES ('CEM-ACC-53GRD', 'ACC 53 Grade OPC Cement', $1, $2, 'High strength ordinary portland cement, 53 grade', '2523', 50, 0, 0, 0, '{"grade":"53","type":"OPC","bag_size":"50kg"}', true) RETURNING id`,
        [catCemId, brdAccId]
      );
      const p3 = await pool.query(
        `INSERT INTO products (sku_code, product_name, category_id, brand_id, description, hsn_code, weight_kg, length_ft, width_ft, height_ft, specifications, is_active)
         VALUES ('TIL-KAJ-60X60-GL', 'Kajaria 60x60 Glazed Floor Tile', $1, $2, 'Premium glazed vitrified tile, anti-skid', '6907', 18, 2, 2, 0.033, '{"size":"60x60cm","finish":"glazed","type":"vitrified"}', true) RETURNING id`,
        [catTilId, brdKajId]
      );
      prod1Id = p1.rows[0].id; prod2Id = p2.rows[0].id; prod3Id = p3.rows[0].id;
      console.log("  3 demo products added");
    } else {
      prod1Id = prodCheck.rows[0].id;
      const p2 = await pool.query(`SELECT id FROM products WHERE sku_code = 'CEM-ACC-53GRD'`);
      const p3 = await pool.query(`SELECT id FROM products WHERE sku_code = 'TIL-KAJ-60X60-GL'`);
      prod2Id = p2.rows[0]?.id || prod1Id;
      prod3Id = p3.rows[0]?.id || prod1Id;
      console.log("  demo products already exist, skipping");
    }

    // -- Demo Dealers --
    const dlrCheck = await pool.query(`SELECT id FROM dealers WHERE dealer_code = 'DLR-001'`);
    let dealer1Id: string;
    if (dlrCheck.rows.length === 0) {
      // Create dealer user accounts
      const dlrHash = await bcrypt.hash("dealer123", 10);
      const du1 = await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ('dealer1@materialking.com', '9800000001', $1, 'Suresh', 'Gupta', 'dealer', true, true) RETURNING id`, [dlrHash]
      );
      const du2 = await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ('dealer2@materialking.com', '9800000002', $1, 'Priya', 'Mehta', 'dealer', true, true) RETURNING id`, [dlrHash]
      );

      const d1 = await pool.query(
        `INSERT INTO dealers (user_id, dealer_code, company_name, gstin, pan, credit_limit, available_credit, credit_payment_terms_days, approval_status, business_address, contact_phone, contact_email)
         VALUES ($1, 'DLR-001', 'Gupta Building Materials', '27AADCG1234H1ZV', 'AADCG1234H', 1500000, 1200000, 30, 'approved', '45 Commercial St, Andheri West, Mumbai 400058', '9800000001', 'dealer1@materialking.com') RETURNING id`,
        [du1.rows[0].id]
      );
      await pool.query(
        `INSERT INTO dealers (user_id, dealer_code, company_name, gstin, pan, credit_limit, available_credit, credit_payment_terms_days, approval_status, business_address, contact_phone, contact_email)
         VALUES ($1, 'DLR-002', 'Mehta Trading Co.', '07BBPPM9876G1ZQ', 'BBPPM9876G', 2000000, 1800000, 45, 'approved', '12 Industrial Area, Phase 2, Gurgaon 122001', '9800000002', 'dealer2@materialking.com')`,
        [du2.rows[0].id]
      );
      dealer1Id = d1.rows[0].id;
      console.log("  2 demo dealers added");
    } else {
      dealer1Id = dlrCheck.rows[0].id;
      console.log("  demo dealers already exist, skipping");
    }

    // -- Demo Buyers --
    const buyCheck = await pool.query(`SELECT id FROM buyers LIMIT 1`);
    let buyer1Id: string, project1Id: string;
    if (buyCheck.rows.length === 0) {
      const buyHash = await bcrypt.hash("buyer123", 10);
      const bu1 = await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ('buyer1@example.com', '9700000001', $1, 'Vikram', 'Singh', 'buyer', true, true) RETURNING id`, [buyHash]
      );
      const bu2 = await pool.query(
        `INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ('buyer2@example.com', '9700000002', $1, 'Anita', 'Desai', 'buyer', true, true) RETURNING id`, [buyHash]
      );

      const by1 = await pool.query(
        `INSERT INTO buyers (user_id, company_name, gstin, company_type, is_active)
         VALUES ($1, 'Singh Constructions Pvt Ltd', '27AABCS5678F1ZV', 'private_limited', true) RETURNING id`,
        [bu1.rows[0].id]
      );
      await pool.query(
        `INSERT INTO buyers (user_id, company_name, gstin, company_type, is_active)
         VALUES ($1, 'Desai Builders & Developers', '29AABCD1234G1ZQ', 'partnership', true) RETURNING id`,
        [bu2.rows[0].id]
      );
      buyer1Id = by1.rows[0].id;

      // Add projects for buyer1
      const pj1 = await pool.query(
        `INSERT INTO projects (buyer_id, project_name, project_code, delivery_address, delivery_pincode, delivery_city, delivery_state, site_manager_name, site_manager_phone, is_active)
         VALUES ($1, 'Greenfield Residency Tower A', 'PROJ-GRT-001', '101 Greenfield Complex, Powai, Mumbai', '400001', 'Mumbai', 'Maharashtra', 'Rakesh Kumar', '9600000001', true) RETURNING id`,
        [buyer1Id]
      );
      await pool.query(
        `INSERT INTO projects (buyer_id, project_name, project_code, delivery_address, delivery_pincode, delivery_city, delivery_state, site_manager_name, site_manager_phone, is_active)
         VALUES ($1, 'Marina Bay Commercial Hub', 'PROJ-MBC-002', '55 Business Park, Bandra Kurla Complex, Mumbai', '400002', 'Mumbai', 'Maharashtra', 'Deepak Joshi', '9600000002', true)`,
        [buyer1Id]
      );
      project1Id = pj1.rows[0].id;
      console.log("  2 demo buyers + 2 projects added");
    } else {
      buyer1Id = buyCheck.rows[0].id;
      const pjCheck = await pool.query(`SELECT id FROM projects WHERE buyer_id = $1 LIMIT 1`, [buyer1Id]);
      project1Id = pjCheck.rows[0]?.id;
      console.log("  demo buyers already exist, skipping");
    }

    // -- Demo Orders --
    const ordCheck = await pool.query(`SELECT id FROM orders WHERE order_number = 'ORD-2026-0001'`);
    if (ordCheck.rows.length === 0 && project1Id) {
      const o1 = await pool.query(
        `INSERT INTO orders (order_number, buyer_id, project_id, zone_id, order_type, order_status, payment_status, subtotal, shipping_cost, tax_amount, discount_amount, total_amount, delivery_address, delivery_pincode, delivery_contact_name, delivery_contact_phone, expected_delivery_date, buyer_notes)
         VALUES ('ORD-2026-0001', $1, $2, $3, 'direct', 'confirmed', 'pending', 85000, 2500, 15300, 0, 102800, '101 Greenfield Complex, Powai, Mumbai', '400001', 'Rakesh Kumar', '9600000001', NOW() + INTERVAL '7 days', 'Please deliver before 10 AM') RETURNING id`,
        [buyer1Id, project1Id, zoneMumId]
      );
      // Add order items
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total, product_name_snapshot, sku_code_snapshot)
         VALUES ($1, $2, 20, 3500, 70000, 'Century 18mm BWP Plywood', 'PLY-CEN-18MM-BWP')`,
        [o1.rows[0].id, prod1Id]
      );
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total, product_name_snapshot, sku_code_snapshot)
         VALUES ($1, $2, 30, 500, 15000, 'ACC 53 Grade OPC Cement', 'CEM-ACC-53GRD')`,
        [o1.rows[0].id, prod2Id]
      );

      // Order 2 - dealer order
      const o2 = await pool.query(
        `INSERT INTO orders (order_number, buyer_id, project_id, dealer_id, zone_id, order_type, order_status, payment_status, subtotal, shipping_cost, tax_amount, discount_amount, total_amount, delivery_address, delivery_pincode, delivery_contact_name, delivery_contact_phone, expected_delivery_date)
         VALUES ('ORD-2026-0002', $1, $2, $3, $4, 'dealer', 'pending', 'pending', 144000, 3500, 25920, 5000, 168420, '101 Greenfield Complex, Powai, Mumbai', '400001', 'Rakesh Kumar', '9600000001', NOW() + INTERVAL '14 days') RETURNING id`,
        [buyer1Id, project1Id, dealer1Id, zoneMumId]
      );
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total, product_name_snapshot, sku_code_snapshot)
         VALUES ($1, $2, 100, 1200, 120000, 'Kajaria 60x60 Glazed Floor Tile', 'TIL-KAJ-60X60-GL')`,
        [o2.rows[0].id, prod3Id]
      );
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total, product_name_snapshot, sku_code_snapshot)
         VALUES ($1, $2, 48, 500, 24000, 'ACC 53 Grade OPC Cement', 'CEM-ACC-53GRD')`,
        [o2.rows[0].id, prod2Id]
      );
      console.log("  2 demo orders + 4 order items added");
    } else {
      console.log("  demo orders already exist, skipping");
    }

    console.log("\nDemo data seeding complete.");
    console.log("Migrations complete.");
  } catch (error: any) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
