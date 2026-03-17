import { Request, Response } from "express";
import pool from "../../config/db";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/brands
export const getAll = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const pag = parsePagination(req);
    let where = "";
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      where = ` WHERE name ILIKE $${paramIdx}`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM brands${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, name, slug, logo_url, description, is_active, created_at FROM brands${where} ORDER BY name LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Brand getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/brands
export const create = async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body;
    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await pool.query(
      `INSERT INTO brands (name, slug, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, slug, description, is_active, created_at`,
      [name, autoSlug, description || null]
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
    const { name, slug, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE brands SET name = COALESCE($1, name),
                         slug = COALESCE($2, slug),
                         description = COALESCE($3, description),
                         is_active = COALESCE($4, is_active),
                         updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, slug, description, is_active`,
      [name, slug, description, is_active, id]
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
