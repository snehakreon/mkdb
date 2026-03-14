import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/categories
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, slug, description, parent_id, image_url, is_active, sort_order, created_at FROM categories ORDER BY name"
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Category getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/categories/active — public endpoint with product counts
export const getActive = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.image_url, c.sort_order,
              COUNT(p.id) FILTER (WHERE p.is_active = true) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Category getActive error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/categories
export const create = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parent_id } = req.body;
    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, parent_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, slug, description, parent_id, is_active, created_at`,
      [name, autoSlug, description || null, parent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Category create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/categories/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent_id, is_active } = req.body;
    const result = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name),
                             slug = COALESCE($2, slug),
                             description = COALESCE($3, description),
                             parent_id = COALESCE($4, parent_id),
                             is_active = COALESCE($5, is_active),
                             updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, slug, description, parent_id, is_active`,
      [name, slug, description, parent_id, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Category update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/categories/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE categories SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error: any) {
    console.error("Category delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
