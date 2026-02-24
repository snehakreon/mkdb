import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/zones
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT z.id, z.zone_code, z.zone_name, z.is_active, z.created_at,
             COALESCE(
               json_agg(zp.pincode ORDER BY zp.pincode) FILTER (WHERE zp.pincode IS NOT NULL),
               '[]'
             ) as pincodes
      FROM zones z
      LEFT JOIN zone_pincodes zp ON zp.zone_id = z.id
      GROUP BY z.id
      ORDER BY z.created_at DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Zone getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/zones/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT z.id, z.zone_code, z.zone_name, z.is_active, z.created_at,
             COALESCE(
               json_agg(zp.pincode ORDER BY zp.pincode) FILTER (WHERE zp.pincode IS NOT NULL),
               '[]'
             ) as pincodes
      FROM zones z
      LEFT JOIN zone_pincodes zp ON zp.zone_id = z.id
      WHERE z.id = $1
      GROUP BY z.id
    `, [id]);

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
  const client = await pool.connect();
  try {
    const { zone_code, zone_name, pincodes } = req.body;

    await client.query("BEGIN");

    const zoneResult = await client.query(
      `INSERT INTO zones (zone_code, zone_name, is_active)
       VALUES ($1, $2, true)
       RETURNING id, zone_code, zone_name, is_active, created_at`,
      [zone_code, zone_name]
    );

    const zone = zoneResult.rows[0];

    // Insert pincodes if provided
    if (pincodes && Array.isArray(pincodes) && pincodes.length > 0) {
      for (const pincode of pincodes) {
        const trimmed = pincode.trim();
        if (trimmed) {
          await client.query(
            `INSERT INTO zone_pincodes (zone_id, pincode) VALUES ($1, $2)`,
            [zone.id, trimmed]
          );
        }
      }
    }

    await client.query("COMMIT");

    res.status(201).json({ ...zone, pincodes: pincodes || [] });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Zone create error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Zone code or pincode already exists" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// PUT /api/zones/:id
export const update = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { zone_code, zone_name, is_active, pincodes } = req.body;

    await client.query("BEGIN");

    const zoneResult = await client.query(
      `UPDATE zones SET zone_code = COALESCE($1, zone_code),
                        zone_name = COALESCE($2, zone_name),
                        is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING id, zone_code, zone_name, is_active`,
      [zone_code, zone_name, is_active, id]
    );

    if (zoneResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Zone not found" });
    }

    // Replace pincodes if provided
    if (pincodes && Array.isArray(pincodes)) {
      await client.query("DELETE FROM zone_pincodes WHERE zone_id = $1", [id]);
      for (const pincode of pincodes) {
        const trimmed = pincode.trim();
        if (trimmed) {
          await client.query(
            `INSERT INTO zone_pincodes (zone_id, pincode) VALUES ($1, $2)`,
            [id, trimmed]
          );
        }
      }
    }

    await client.query("COMMIT");

    res.json({ ...zoneResult.rows[0], pincodes: pincodes || [] });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Zone update error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Zone code or pincode already exists" });
    }
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
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
