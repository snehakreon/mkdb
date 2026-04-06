"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
// GET /api/vendors
const getAll = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const params = [];
        let paramIdx = 1;
        let where = "";
        if (search) {
            where = ` WHERE (v.company_name ILIKE $${paramIdx} OR v.contact_name ILIKE $${paramIdx} OR v.email ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM vendors v${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT v.id, v.company_name, v.contact_name, v.email, v.phone, v.gstin,
              v.address, v.city, v.state, v.pincode, v.zone_id,
              z.name AS zone_name,
              v.is_verified, v.is_active, v.created_at
       FROM vendors v
       LEFT JOIN zones z ON v.zone_id = z.id
       ${where}
       ORDER BY v.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Vendor getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// GET /api/vendors/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`SELECT id, company_name, contact_name, email, phone, gstin,
              address, city, state, pincode, zone_id,
              is_verified, is_active, created_at
       FROM vendors WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Vendor getById error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getById = getById;
// POST /api/vendors
const create = async (req, res) => {
    try {
        const { company_name, contact_name, email, phone, gstin, address, city, state, pincode, zone_id, } = req.body;
        const result = await db_1.default.query(`INSERT INTO vendors (company_name, contact_name, email, phone, gstin,
                            address, city, state, pincode, zone_id, is_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true)
       RETURNING *`, [company_name, contact_name || null, email || null, phone || null, gstin || null,
            address || null, city || null, state || null, pincode || null, zone_id || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Vendor create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Vendor already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/vendors/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, contact_name, email, phone, gstin, address, city, state, pincode, zone_id, is_verified, is_active, } = req.body;
        const result = await db_1.default.query(`UPDATE vendors SET
        company_name = COALESCE($1, company_name),
        contact_name = COALESCE($2, contact_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        gstin = COALESCE($5, gstin),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        pincode = COALESCE($9, pincode),
        zone_id = $10,
        is_verified = COALESCE($11, is_verified),
        is_active = COALESCE($12, is_active),
        updated_at = NOW()
       WHERE id = $13
       RETURNING *`, [company_name, contact_name, email, phone, gstin,
            address, city, state, pincode, zone_id || null, is_verified, is_active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Vendor update error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// DELETE /api/vendors/:id
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE vendors SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.json({ message: "Vendor deleted" });
    }
    catch (error) {
        console.error("Vendor delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=vendor.controller.js.map