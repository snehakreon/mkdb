import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/products
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.slug, p.sku, p.category_id, p.brand_id, p.vendor_id,
              p.description, p.unit, p.price, p.mrp, p.stock_qty, p.min_order_qty,
              p.image_url, p.images, p.specifications, p.is_active, p.created_at,
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

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.name, p.slug, p.sku, p.category_id, p.brand_id, p.vendor_id,
              p.description, p.unit, p.price, p.mrp, p.stock_qty, p.min_order_qty,
              p.image_url, p.images, p.specifications, p.is_active, p.created_at,
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
      name, slug, sku, category_id, brand_id, vendor_id, description,
      unit, price, mrp, stock_qty, min_order_qty, image_url, images, specifications
    } = req.body;

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const result = await pool.query(
      `INSERT INTO products (name, slug, sku, category_id, brand_id, vendor_id, description,
                             unit, price, mrp, stock_qty, min_order_qty, image_url, images,
                             specifications, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
       RETURNING *`,
      [name, autoSlug, sku || null, category_id || null, brand_id || null, vendor_id || null,
       description || null, unit || 'piece', price || 0, mrp || null,
       stock_qty || 0, min_order_qty || 1, image_url || null,
       images ? JSON.stringify(images) : '[]',
       specifications ? JSON.stringify(specifications) : '{}']
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
      name, slug, sku, category_id, brand_id, vendor_id, description,
      unit, price, mrp, stock_qty, min_order_qty, image_url, images,
      specifications, is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        sku = COALESCE($3, sku),
        category_id = COALESCE($4, category_id),
        brand_id = COALESCE($5, brand_id),
        vendor_id = COALESCE($6, vendor_id),
        description = COALESCE($7, description),
        unit = COALESCE($8, unit),
        price = COALESCE($9, price),
        mrp = COALESCE($10, mrp),
        stock_qty = COALESCE($11, stock_qty),
        min_order_qty = COALESCE($12, min_order_qty),
        image_url = COALESCE($13, image_url),
        images = COALESCE($14, images),
        specifications = COALESCE($15, specifications),
        is_active = COALESCE($16, is_active),
        updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [name, slug, sku, category_id, brand_id, vendor_id, description,
       unit, price, mrp, stock_qty, min_order_qty, image_url,
       images ? JSON.stringify(images) : null,
       specifications ? JSON.stringify(specifications) : null,
       is_active, id]
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
