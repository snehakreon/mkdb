import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/products
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.sku_code, p.product_name, p.category_id, p.brand_id,
              p.description, p.specifications, p.hsn_code,
              p.weight_kg, p.length_ft, p.width_ft, p.height_ft, p.cbm_per_unit,
              p.tech_sheet_url, p.is_active, p.created_at,
              c.category_name, b.brand_name
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

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.sku_code, p.product_name, p.category_id, p.brand_id,
              p.description, p.specifications, p.hsn_code,
              p.weight_kg, p.length_ft, p.width_ft, p.height_ft, p.cbm_per_unit,
              p.tech_sheet_url, p.is_active, p.created_at,
              c.category_name, b.brand_name
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
      sku_code, product_name, category_id, brand_id, description,
      specifications, hsn_code, weight_kg, length_ft, width_ft, height_ft,
      tech_sheet_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (sku_code, product_name, category_id, brand_id, description,
                             specifications, hsn_code, weight_kg, length_ft, width_ft, height_ft,
                             tech_sheet_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
       RETURNING id, sku_code, product_name, category_id, brand_id, description,
                 specifications, hsn_code, weight_kg, length_ft, width_ft, height_ft,
                 cbm_per_unit, tech_sheet_url, is_active, created_at`,
      [sku_code, product_name, category_id, brand_id || null, description || null,
       specifications ? JSON.stringify(specifications) : '{}', hsn_code || null,
       weight_kg || null, length_ft || null, width_ft || null, height_ft || null,
       tech_sheet_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Product create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Product SKU already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      sku_code, product_name, category_id, brand_id, description,
      specifications, hsn_code, weight_kg, length_ft, width_ft, height_ft,
      tech_sheet_url, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        sku_code = COALESCE($1, sku_code),
        product_name = COALESCE($2, product_name),
        category_id = COALESCE($3, category_id),
        brand_id = COALESCE($4, brand_id),
        description = COALESCE($5, description),
        specifications = COALESCE($6, specifications),
        hsn_code = COALESCE($7, hsn_code),
        weight_kg = COALESCE($8, weight_kg),
        length_ft = COALESCE($9, length_ft),
        width_ft = COALESCE($10, width_ft),
        height_ft = COALESCE($11, height_ft),
        tech_sheet_url = COALESCE($12, tech_sheet_url),
        is_active = COALESCE($13, is_active)
       WHERE id = $14
       RETURNING id, sku_code, product_name, category_id, brand_id, description,
                 specifications, hsn_code, weight_kg, length_ft, width_ft, height_ft,
                 cbm_per_unit, tech_sheet_url, is_active`,
      [sku_code, product_name, category_id, brand_id, description,
       specifications ? JSON.stringify(specifications) : null, hsn_code,
       weight_kg, length_ft, width_ft, height_ft, tech_sheet_url, is_active, id]
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
