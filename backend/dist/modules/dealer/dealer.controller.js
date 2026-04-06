"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/dealers
const getAll = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const params = [];
        let paramIdx = 1;
        let where = "";
        if (search) {
            where = ` WHERE (company_name ILIKE $${paramIdx} OR contact_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM dealers${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM dealers${where}
       ORDER BY created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Dealer getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// GET /api/dealers/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_active, created_at
       FROM dealers WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dealer not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Dealer getById error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getById = getById;
// POST /api/dealers
const create = async (req, res) => {
    try {
        const { company_name, contact_name, email, phone, gstin, address, city, state, pincode, } = req.body;
        const result = await db_1.default.query(`INSERT INTO dealers (company_name, contact_name, email, phone, gstin,
                            address, city, state, pincode, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`, [company_name, contact_name || null, email || null, phone || null, gstin || null,
            address || null, city || null, state || null, pincode || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Dealer create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Dealer already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/dealers/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, contact_name, email, phone, gstin, address, city, state, pincode, is_active, } = req.body;
        const result = await db_1.default.query(`UPDATE dealers SET
        company_name = COALESCE($1, company_name),
        contact_name = COALESCE($2, contact_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        gstin = COALESCE($5, gstin),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        pincode = COALESCE($9, pincode),
        is_active = COALESCE($10, is_active),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`, [company_name, contact_name, email, phone, gstin,
            address, city, state, pincode, is_active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dealer not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Dealer update error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// DELETE /api/dealers/:id (soft delete)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE dealers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Dealer not found" });
        }
        res.json({ message: "Dealer deactivated" });
    }
    catch (error) {
        console.error("Dealer delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=dealer.controller.js.map