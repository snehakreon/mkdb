import { Request, Response } from "express";
import pool from "../../config/db";
import { parsePagination, buildPaginatedResponse } from "../../utils/pagination";

// GET /api/categories
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

    const countResult = await pool.query(`SELECT COUNT(*) FROM categories${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, name, slug, description, parent_id, image_url, is_active, sort_order, created_at FROM categories${where} ORDER BY name LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, pag.pageSize, pag.offset]
    );
    res.json(buildPaginatedResponse(result.rows, total, pag));
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

// POST /api/categories/reorganize — merge duplicates & restructure into 7 parents
export const reorganize = async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // The 7 merged parent categories
    const merges = [
      { target: "tiles", targetName: "Tiles & Flooring", sort: 1, absorb: [] as string[] },
      { target: "paints", targetName: "Paints & Coatings", sort: 2, absorb: [] as string[] },
      { target: "sanitaryware", targetName: "Sanitaryware & Bath", sort: 3, absorb: ["kitchen"] },
      { target: "hardware", targetName: "Hardware & Plumbing", sort: 4, absorb: ["plumbing"] },
      { target: "boards", targetName: "Plywood & Boards", sort: 5, absorb: [] as string[] },
      { target: "electrical", targetName: "Electrical & Lighting", sort: 6, absorb: ["lighting"] },
      { target: "cement", targetName: "Cement & Aggregates", sort: 7, absorb: [] as string[] },
    ];

    const targetSlugs = merges.map((m) => m.target);

    for (const m of merges) {
      const targetRow = await client.query("SELECT id FROM categories WHERE slug = $1", [m.target]);
      if (targetRow.rows.length === 0) continue;
      const targetId = targetRow.rows[0].id;

      // Rename the target parent
      await client.query(
        "UPDATE categories SET name = $1, sort_order = $2 WHERE id = $3",
        [m.targetName, m.sort, targetId]
      );

      // Absorb merged categories: move subcategories & products, then deactivate
      for (const absorbSlug of m.absorb) {
        const absorbRow = await client.query("SELECT id FROM categories WHERE slug = $1", [absorbSlug]);
        if (absorbRow.rows.length === 0) continue;
        const absorbId = absorbRow.rows[0].id;

        await client.query("UPDATE categories SET parent_id = $1 WHERE parent_id = $2", [targetId, absorbId]);
        await client.query("UPDATE products SET category_id = $1 WHERE category_id = $2", [targetId, absorbId]);
        await client.query("UPDATE categories SET is_active = false WHERE id = $1", [absorbId]);
      }
    }

    // Deactivate any other top-level categories not in our 7 targets (duplicates added via admin)
    // Move their products/subcategories to the best matching target
    const allTopLevel = await client.query(
      "SELECT id, slug, name FROM categories WHERE parent_id IS NULL AND is_active = true"
    );
    for (const row of allTopLevel.rows) {
      if (targetSlugs.includes(row.slug)) continue;

      const nameLower = row.name.toLowerCase();
      let bestTarget: number | null = null;

      for (const m of merges) {
        const keywords = m.targetName.toLowerCase().split(/[\s&]+/).filter((k: string) => k.length > 3);
        if (keywords.some((kw: string) => nameLower.includes(kw))) {
          const tr = await client.query("SELECT id FROM categories WHERE slug = $1", [m.target]);
          if (tr.rows.length > 0) bestTarget = tr.rows[0].id;
          break;
        }
      }

      if (bestTarget) {
        await client.query("UPDATE categories SET parent_id = $1 WHERE parent_id = $2", [bestTarget, row.id]);
        await client.query("UPDATE products SET category_id = $1 WHERE category_id = $2", [bestTarget, row.id]);
      }
      await client.query("UPDATE categories SET is_active = false WHERE id = $1", [row.id]);
    }

    await client.query("COMMIT");
    res.json({ message: "Categories reorganized successfully", structure: merges.map((m) => m.targetName) });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Category reorganize error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
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
