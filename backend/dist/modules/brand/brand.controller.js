"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/brands
const getAll = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const params = [];
        let paramIdx = 1;
        let where = "";
        if (search) {
            where = ` WHERE name ILIKE $${paramIdx++}`;
            params.push(`%${search}%`);
        }
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM brands${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT id, name, slug, logo_url, description, is_active, created_at
       FROM brands${where}
       ORDER BY name
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Brand getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// POST /api/brands
const create = async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const result = await db_1.default.query(`INSERT INTO brands (name, slug, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, slug, description, is_active, created_at`, [name, autoSlug, description || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Brand create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Brand already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/brands/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, is_active } = req.body;
        const result = await db_1.default.query(`UPDATE brands SET name = COALESCE($1, name),
                         slug = COALESCE($2, slug),
                         description = COALESCE($3, description),
                         is_active = COALESCE($4, is_active),
                         updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, slug, description, is_active`, [name, slug, description, is_active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Brand update error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// DELETE /api/brands/:id
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE brands SET is_active = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.json({ message: "Brand deleted" });
    }
    catch (error) {
        console.error("Brand delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=brand.controller.js.map