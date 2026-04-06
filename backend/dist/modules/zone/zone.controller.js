"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/zones
const getAll = async (req, res) => {
    try {
        const { search } = req.query;
        const pag = (0, pagination_1.parsePagination)(req);
        let where = "";
        const params = [];
        let paramIdx = 1;
        if (search) {
            where = ` WHERE (name ILIKE $${paramIdx} OR code ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM zones${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT id, name, code, description, is_active, created_at FROM zones${where} ORDER BY name LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, pag.pageSize, pag.offset]);
        res.json((0, pagination_1.buildPaginatedResponse)(result.rows, total, pag));
    }
    catch (error) {
        console.error("Zone getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// GET /api/zones/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("SELECT id, name, code, description, is_active, created_at FROM zones WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Zone not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Zone getById error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getById = getById;
// POST /api/zones
const create = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        const result = await db_1.default.query(`INSERT INTO zones (name, code, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, code, description, is_active, created_at`, [name, code, description || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Zone create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Zone code already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/zones/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, is_active } = req.body;
        const result = await db_1.default.query(`UPDATE zones SET name = COALESCE($1, name),
                        code = COALESCE($2, code),
                        description = COALESCE($3, description),
                        is_active = COALESCE($4, is_active),
                        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, code, description, is_active`, [name, code, description, is_active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Zone not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Zone update error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Zone code already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// DELETE /api/zones/:id
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE zones SET is_active = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Zone not found" });
        }
        res.json({ message: "Zone deleted" });
    }
    catch (error) {
        console.error("Zone delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=zone.controller.js.map