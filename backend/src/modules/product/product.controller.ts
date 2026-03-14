import { Request, Response } from "express";
import pool from "../../config/db";

const PRODUCT_FIELDS = `p.id, p.name, p.slug, p.sku, p.hsn_code, p.isin,
  p.category_id, p.brand_id, p.brand_collection, p.vendor_id,
  p.description, p.unit, p.price, p.mrp, p.stock_qty, p.min_order_qty,
  p.image_url, p.images, p.specifications,
  p.length_mm, p.breadth_mm, p.width_mm, p.thickness_mm, p.weight_kg,
  p.box_length_mm, p.box_breadth_mm, p.box_width_mm, p.box_weight_kg,
  p.colour, p.grade, p.material, p.calibration, p.certification,
  p.termite_resistance, p.warranty, p.country_of_origin,
  p.customer_care_details, p.tech_sheet_url,
  p.manufactured_by, p.packaged_by, p.lead_time_days,
  p.is_active, p.created_at`;

// GET /api/products
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Product getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/active — public endpoint for buyer storefront
export const getActive = async (req: Request, res: Response) => {
  try {
    const { category_id, brand_id, search, limit } = req.query;
    let query = `SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = true`;
    const params: any[] = [];
    let paramIdx = 1;

    if (category_id) {
      query += ` AND p.category_id = $${paramIdx++}`;
      params.push(category_id);
    }
    if (brand_id) {
      query += ` AND p.brand_id = $${paramIdx++}`;
      params.push(brand_id);
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR b.name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }
    query += ` ORDER BY p.created_at DESC`;
    if (limit) {
      query += ` LIMIT $${paramIdx++}`;
      params.push(parseInt(limit as string));
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Product getActive error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Product getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
export const create = async (req: Request, res: Response) => {
  try {
    const {
      name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection,
      vendor_id, description, unit, price, mrp, stock_qty, min_order_qty,
      image_url, images, specifications,
      length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
      box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
      colour, grade, material, calibration, certification,
      termite_resistance, warranty, country_of_origin,
      customer_care_details, tech_sheet_url,
      manufactured_by, packaged_by, lead_time_days
    } = req.body;

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const result = await pool.query(
      `INSERT INTO products (
        name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection,
        vendor_id, description, unit, price, mrp, stock_qty, min_order_qty,
        image_url, images, specifications,
        length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
        box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
        colour, grade, material, calibration, certification,
        termite_resistance, warranty, country_of_origin,
        customer_care_details, tech_sheet_url,
        manufactured_by, packaged_by, lead_time_days, is_active
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37,$38,$39,$40, true
      ) RETURNING *`,
      [
        name, autoSlug, sku || null, hsn_code || null, isin || null,
        category_id || null, brand_id || null, brand_collection || null,
        vendor_id || null, description || null, unit || "piece",
        price || 0, mrp || null, stock_qty || 0, min_order_qty || 1,
        image_url || null,
        images ? JSON.stringify(images) : "[]",
        specifications ? JSON.stringify(specifications) : "{}",
        length_mm || null, breadth_mm || null, width_mm || null,
        thickness_mm || null, weight_kg || null,
        box_length_mm || null, box_breadth_mm || null, box_width_mm || null,
        box_weight_kg || null,
        colour || null, grade || null, material || null,
        calibration || null, certification || null,
        termite_resistance || null, warranty || null,
        country_of_origin || "India",
        customer_care_details || null, tech_sheet_url || null,
        manufactured_by || null, packaged_by || null,
        lead_time_days || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Product create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Product SKU or slug already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection,
      vendor_id, description, unit, price, mrp, stock_qty, min_order_qty,
      image_url, images, specifications,
      length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
      box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
      colour, grade, material, calibration, certification,
      termite_resistance, warranty, country_of_origin,
      customer_care_details, tech_sheet_url,
      manufactured_by, packaged_by, lead_time_days, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        sku = COALESCE($3, sku),
        hsn_code = COALESCE($4, hsn_code),
        isin = COALESCE($5, isin),
        category_id = COALESCE($6, category_id),
        brand_id = COALESCE($7, brand_id),
        brand_collection = COALESCE($8, brand_collection),
        vendor_id = COALESCE($9, vendor_id),
        description = COALESCE($10, description),
        unit = COALESCE($11, unit),
        price = COALESCE($12, price),
        mrp = COALESCE($13, mrp),
        stock_qty = COALESCE($14, stock_qty),
        min_order_qty = COALESCE($15, min_order_qty),
        image_url = COALESCE($16, image_url),
        images = COALESCE($17, images),
        specifications = COALESCE($18, specifications),
        length_mm = COALESCE($19, length_mm),
        breadth_mm = COALESCE($20, breadth_mm),
        width_mm = COALESCE($21, width_mm),
        thickness_mm = COALESCE($22, thickness_mm),
        weight_kg = COALESCE($23, weight_kg),
        box_length_mm = COALESCE($24, box_length_mm),
        box_breadth_mm = COALESCE($25, box_breadth_mm),
        box_width_mm = COALESCE($26, box_width_mm),
        box_weight_kg = COALESCE($27, box_weight_kg),
        colour = COALESCE($28, colour),
        grade = COALESCE($29, grade),
        material = COALESCE($30, material),
        calibration = COALESCE($31, calibration),
        certification = COALESCE($32, certification),
        termite_resistance = COALESCE($33, termite_resistance),
        warranty = COALESCE($34, warranty),
        country_of_origin = COALESCE($35, country_of_origin),
        customer_care_details = COALESCE($36, customer_care_details),
        tech_sheet_url = COALESCE($37, tech_sheet_url),
        manufactured_by = COALESCE($38, manufactured_by),
        packaged_by = COALESCE($39, packaged_by),
        lead_time_days = COALESCE($40, lead_time_days),
        is_active = COALESCE($41, is_active),
        updated_at = NOW()
       WHERE id = $42
       RETURNING *`,
      [
        name, slug, sku, hsn_code, isin,
        category_id, brand_id, brand_collection,
        vendor_id, description, unit, price, mrp,
        stock_qty, min_order_qty, image_url,
        images ? JSON.stringify(images) : null,
        specifications ? JSON.stringify(specifications) : null,
        length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
        box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
        colour, grade, material, calibration, certification,
        termite_resistance, warranty, country_of_origin,
        customer_care_details, tech_sheet_url,
        manufactured_by, packaged_by, lead_time_days, is_active, id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Product update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id (soft delete)
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE products SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error: any) {
    console.error("Product delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
