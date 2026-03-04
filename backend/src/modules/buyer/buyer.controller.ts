import { Request, Response } from "express";
import pool from "../../config/db";

// GET /api/buyers — list all buyers (for order dropdowns)
export const getAll = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.company_name, b.gstin, b.company_type, b.is_active, b.created_at,
              u.first_name, u.last_name, u.email, u.phone
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.company_name`
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Buyer getAll error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/buyers/:id/projects — list projects for a buyer
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, project_name, project_code, delivery_address, delivery_pincode,
              delivery_city, delivery_state, site_manager_name, site_manager_phone,
              delivery_zone_id, is_active
       FROM projects
       WHERE buyer_id = $1 AND is_active = true
       ORDER BY project_name`,
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Buyer getProjects error:", error);
    res.status(500).json({ message: error.message });
  }
};
