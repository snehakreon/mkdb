import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/categories
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, category_name, category_code, is_active, created_at FROM categories ORDER BY category_name"
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Category getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/categories
export const create = async (req: Request, res: Response) => {
  try {
    const { category_name, category_code } = req.body;
    const slug = category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      `INSERT INTO categories (category_name, category_code, slug, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, category_name, category_code, is_active, created_at`,
      [category_name, category_code.toUpperCase(), slug]
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
    const { category_name, category_code, is_active } = req.body;
    const result = await pool.query(
      `UPDATE categories SET category_name = COALESCE($1, category_name),
                             category_code = COALESCE($2, category_code),
                             is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING id, category_name, category_code, is_active`,
      [category_name, category_code ? category_code.toUpperCase() : null, is_active, id]
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
