"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.reorganize = exports.update = exports.create = exports.getActive = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/categories
const getAll = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const conditions = [];
        const params = [];
        let paramIdx = 1;
        if (search) {
            conditions.push(`(c.name ILIKE $${paramIdx} OR c.slug ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM categories c ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT id, name, slug, description, parent_id, image_url, is_active, sort_order, created_at
       FROM categories c ${whereClause}
       ORDER BY name
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Category getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// GET /api/categories/active — public endpoint with product counts
const getActive = async (_req, res) => {
    try {
        const result = await db_1.default.query(`SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.image_url, c.sort_order,
              COUNT(p.id) FILTER (WHERE p.is_active = true) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Category getActive error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getActive = getActive;
// POST /api/categories
const create = async (req, res) => {
    try {
        const { name, slug, description, parent_id } = req.body;
        const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const result = await db_1.default.query(`INSERT INTO categories (name, slug, description, parent_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, slug, description, parent_id, is_active, created_at`, [name, autoSlug, description || null, parent_id || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Category create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Category already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/categories/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, parent_id, is_active } = req.body;
        const result = await db_1.default.query(`UPDATE categories SET name = COALESCE($1, name),
                             slug = COALESCE($2, slug),
                             description = COALESCE($3, description),
                             parent_id = COALESCE($4, parent_id),
                             is_active = COALESCE($5, is_active),
                             updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, slug, description, parent_id, is_active`, [name, slug, description, parent_id, is_active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Category update error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// POST /api/categories/reorganize — merge duplicates & restructure into 7 parents
const reorganize = async (_req, res) => {
    const client = await db_1.default.connect();
    try {
        await client.query("BEGIN");
        // The 7 merged parent categories
        const merges = [
            { target: "tiles", targetName: "Tiles & Flooring", sort: 1, absorb: [] },
            { target: "paints", targetName: "Paints & Coatings", sort: 2, absorb: [] },
            { target: "sanitaryware", targetName: "Sanitaryware & Bath", sort: 3, absorb: ["kitchen"] },
            { target: "hardware", targetName: "Hardware & Plumbing", sort: 4, absorb: ["plumbing"] },
            { target: "boards", targetName: "Plywood & Boards", sort: 5, absorb: [] },
            { target: "electrical", targetName: "Electrical & Lighting", sort: 6, absorb: ["lighting"] },
            { target: "cement", targetName: "Cement & Aggregates", sort: 7, absorb: [] },
        ];
        const targetSlugs = merges.map((m) => m.target);
        for (const m of merges) {
            const targetRow = await client.query("SELECT id FROM categories WHERE slug = $1", [m.target]);
            if (targetRow.rows.length === 0)
                continue;
            const targetId = targetRow.rows[0].id;
            // Rename the target parent
            await client.query("UPDATE categories SET name = $1, sort_order = $2 WHERE id = $3", [m.targetName, m.sort, targetId]);
            // Absorb merged categories: move subcategories & products, then deactivate
            for (const absorbSlug of m.absorb) {
                const absorbRow = await client.query("SELECT id FROM categories WHERE slug = $1", [absorbSlug]);
                if (absorbRow.rows.length === 0)
                    continue;
                const absorbId = absorbRow.rows[0].id;
                await client.query("UPDATE categories SET parent_id = $1 WHERE parent_id = $2", [targetId, absorbId]);
                await client.query("UPDATE products SET category_id = $1 WHERE category_id = $2", [targetId, absorbId]);
                await client.query("UPDATE categories SET is_active = false WHERE id = $1", [absorbId]);
            }
        }
        // Deactivate any other top-level categories not in our 7 targets (duplicates added via admin)
        // Move their products/subcategories to the best matching target
        const allTopLevel = await client.query("SELECT id, slug, name FROM categories WHERE parent_id IS NULL AND is_active = true");
        for (const row of allTopLevel.rows) {
            if (targetSlugs.includes(row.slug))
                continue;
            const nameLower = row.name.toLowerCase();
            let bestTarget = null;
            for (const m of merges) {
                const keywords = m.targetName.toLowerCase().split(/[\s&]+/).filter((k) => k.length > 3);
                if (keywords.some((kw) => nameLower.includes(kw))) {
                    const tr = await client.query("SELECT id FROM categories WHERE slug = $1", [m.target]);
                    if (tr.rows.length > 0)
                        bestTarget = tr.rows[0].id;
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
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Category reorganize error:", error);
        res.status(500).json({ message: error.message });
    }
    finally {
        client.release();
    }
};
exports.reorganize = reorganize;
// DELETE /api/categories/:id
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE categories SET is_active = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category deleted" });
    }
    catch (error) {
        console.error("Category delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=category.controller.js.map