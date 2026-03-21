import { Request, Response } from "express";
import pool from "../../config/db";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/zones
export const getAll = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const pag = parsePagination(req);
    let where = "";
    const params: any[] = [];
    let paramIdx = 1;

    if (search) {
      where = ` WHERE (name ILIKE $${paramIdx} OR code ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM zones${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, name, code, description, is_active, created_at FROM zones${where} ORDER BY name LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
  } catch (error: any) {
    console.error("Zone getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/zones/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, code, description, is_active, created_at FROM zones WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Zone not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Zone getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/zones
export const create = async (req: Request, res: Response) => {
  try {
    const { name, code, description } = req.body;
    const result = await pool.query(
      `INSERT INTO zones (name, code, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, code, description, is_active, created_at`,
      [name, code, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Zone create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Zone code already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/zones/:id
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE zones SET name = COALESCE($1, name),
                        code = COALESCE($2, code),
                        description = COALESCE($3, description),
                        is_active = COALESCE($4, is_active),
                        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, code, description, is_active`,
      [name, code, description, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Zone not found" });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Zone update error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Zone code already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/zones/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE zones SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Zone not found" });
    }
    res.json({ message: "Zone deleted" });
  } catch (error: any) {
    console.error("Zone delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
