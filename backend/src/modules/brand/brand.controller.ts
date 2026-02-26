import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/brands
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, brand_name, brand_code, is_active, created_at FROM brands ORDER BY brand_name"
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Brand getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/brands
export const create = async (req: Request, res: Response) => {
  try {
    const { brand_name, brand_code } = req.body;
    const result = await pool.query(
      `INSERT INTO brands (brand_name, brand_code, is_active)
       VALUES ($1, $2, true)
       RETURNING id, brand_name, brand_code, is_active, created_at`,
      [brand_name, brand_code.toUpperCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Brand create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Brand already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/brands/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { brand_name, brand_code, is_active } = req.body;
    const result = await pool.query(
      `UPDATE brands SET brand_name = COALESCE($1, brand_name),
                         brand_code = COALESCE($2, brand_code),
                         is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING id, brand_name, brand_code, is_active`,
      [brand_name, brand_code ? brand_code.toUpperCase() : null, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Brand update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/brands/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE brands SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted" });
  } catch (error: any) {
    console.error("Brand delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
