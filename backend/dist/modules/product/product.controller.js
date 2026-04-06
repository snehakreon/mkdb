"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.getInventorySummary = exports.getLowStock = exports.update = exports.create = exports.getById = exports.getFilters = exports.getActive = exports.getAll = void 0;
const db_1 = __importDefault(require("../../config/db"));
const pagination_1 = require("../../utils/pagination");
const PRODUCT_FIELDS = `p.id, p.name, p.slug, p.sku, p.hsn_code, p.isin,
  p.category_id, p.brand_id, p.brand_collection, p.vendor_id,
  p.description, p.unit, p.price, p.mrp, p.stock_qty, p.min_order_qty,
  p.image_url, p.images, p.specifications,
  p.length_mm, p.breadth_mm, p.width_mm, p.thickness_mm, p.weight_kg,
  p.box_length_mm, p.box_breadth_mm, p.box_width_mm, p.box_weight_kg,
  p.colour, p.grade, p.material, p.calibration, p.certification,
  p.termite_resistance, p.warranty, p.country_of_origin,
  p.customer_care_details, p.tech_sheet_url,
  p.manufactured_by, p.packaged_by, p.lead_time_days,
  p.is_active, p.created_at`;
// GET /api/products
const getAll = async (req, res) => {
    try {
        const { page, limit, offset, search } = (0, pagination_1.getPaginationParams)(req);
        const params = [];
        let paramIdx = 1;
        let where = "";
        if (search) {
            where = ` WHERE (p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx} OR b.name ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        const countResult = await db_1.default.query(`SELECT COUNT(*) FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id${where}`, params);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id${where}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Product getAll error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAll = getAll;
// GET /api/products/active — public endpoint for buyer storefront
const getActive = async (req, res) => {
    try {
        const { category_id, brand_id, search, limit, min_price, max_price, sort } = req.query;
        let query = `SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = true`;
        const params = [];
        let paramIdx = 1;
        if (category_id) {
            // Support filtering by parent category (include subcategory products)
            query += ` AND (p.category_id = $${paramIdx} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${paramIdx}))`;
            params.push(category_id);
            paramIdx++;
        }
        if (brand_id) {
            query += ` AND p.brand_id = $${paramIdx++}`;
            params.push(brand_id);
        }
        if (min_price) {
            query += ` AND p.price >= $${paramIdx++}`;
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            query += ` AND p.price <= $${paramIdx++}`;
            params.push(parseFloat(max_price));
        }
        if (search) {
            query += ` AND (p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR b.name ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        // Sorting
        if (sort === "price_asc") {
            query += ` ORDER BY p.price ASC`;
        }
        else if (sort === "price_desc") {
            query += ` ORDER BY p.price DESC`;
        }
        else if (sort === "name_asc") {
            query += ` ORDER BY p.name ASC`;
        }
        else {
            query += ` ORDER BY p.created_at DESC`;
        }
        // Count total before pagination
        const countQuery = query.replace(/SELECT .+? FROM/, "SELECT COUNT(*) FROM");
        const countResult = await db_1.default.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);
        // Pagination
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const pageOffset = (page - 1) * pageLimit;
        query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
        params.push(pageLimit, pageOffset);
        const result = await db_1.default.query(query, params);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit: pageLimit, offset: pageOffset }));
    }
    catch (error) {
        console.error("Product getActive error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getActive = getActive;
// GET /api/products/filters — dynamic filter options for storefront
const getFilters = async (req, res) => {
    try {
        const { category_id } = req.query;
        let catFilter = "";
        const params = [];
        if (category_id) {
            catFilter = ` AND (p.category_id = $1 OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $1))`;
            params.push(category_id);
        }
        // Get brands with product counts for this category
        const brandsResult = await db_1.default.query(`SELECT b.id, b.name, COUNT(p.id) AS product_count
       FROM brands b
       JOIN products p ON p.brand_id = b.id AND p.is_active = true${catFilter}
       WHERE b.is_active = true
       GROUP BY b.id, b.name
       ORDER BY b.name`, params);
        // Get price range
        const priceResult = await db_1.default.query(`SELECT MIN(p.price)::numeric AS min_price, MAX(p.price)::numeric AS max_price
       FROM products p
       WHERE p.is_active = true${catFilter}`, params);
        // Get subcategories if a parent category is selected
        let subcategories = [];
        if (category_id) {
            const subsResult = await db_1.default.query(`SELECT c.id, c.name, c.slug, COUNT(p.id) FILTER (WHERE p.is_active = true) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         WHERE c.parent_id = $1 AND c.is_active = true
         GROUP BY c.id
         ORDER BY c.sort_order, c.name`, [category_id]);
            subcategories = subsResult.rows;
        }
        res.json({
            brands: brandsResult.rows,
            price_range: priceResult.rows[0] || { min_price: 0, max_price: 0 },
            subcategories,
        });
    }
    catch (error) {
        console.error("Product getFilters error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getFilters = getFilters;
// GET /api/products/:id
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query(`SELECT ${PRODUCT_FIELDS},
              c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Product getById error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getById = getById;
// POST /api/products
const create = async (req, res) => {
    try {
        const { name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection, vendor_id, description, unit, price, mrp, stock_qty, min_order_qty, image_url, images, specifications, length_mm, breadth_mm, width_mm, thickness_mm, weight_kg, box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg, colour, grade, material, calibration, certification, termite_resistance, warranty, country_of_origin, customer_care_details, tech_sheet_url, manufactured_by, packaged_by, lead_time_days } = req.body;
        const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const result = await db_1.default.query(`INSERT INTO products (
        name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection,
        vendor_id, description, unit, price, mrp, stock_qty, min_order_qty,
        image_url, images, specifications,
        length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
        box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
        colour, grade, material, calibration, certification,
        termite_resistance, warranty, country_of_origin,
        customer_care_details, tech_sheet_url,
        manufactured_by, packaged_by, lead_time_days, is_active
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37,$38,$39,$40, true
      ) RETURNING *`, [
            name, autoSlug, sku || null, hsn_code || null, isin || null,
            category_id || null, brand_id || null, brand_collection || null,
            vendor_id || null, description || null, unit || "piece",
            price || 0, mrp || null, stock_qty || 0, min_order_qty || 1,
            image_url || null,
            images ? JSON.stringify(images) : "[]",
            specifications ? JSON.stringify(specifications) : "{}",
            length_mm || null, breadth_mm || null, width_mm || null,
            thickness_mm || null, weight_kg || null,
            box_length_mm || null, box_breadth_mm || null, box_width_mm || null,
            box_weight_kg || null,
            colour || null, grade || null, material || null,
            calibration || null, certification || null,
            termite_resistance || null, warranty || null,
            country_of_origin || "India",
            customer_care_details || null, tech_sheet_url || null,
            manufactured_by || null, packaged_by || null,
            lead_time_days || null
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Product create error:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "Product SKU or slug already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.create = create;
// PUT /api/products/:id
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, sku, hsn_code, isin, category_id, brand_id, brand_collection, vendor_id, description, unit, price, mrp, stock_qty, min_order_qty, image_url, images, specifications, length_mm, breadth_mm, width_mm, thickness_mm, weight_kg, box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg, colour, grade, material, calibration, certification, termite_resistance, warranty, country_of_origin, customer_care_details, tech_sheet_url, manufactured_by, packaged_by, lead_time_days, is_active } = req.body;
        const result = await db_1.default.query(`UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        sku = COALESCE($3, sku),
        hsn_code = COALESCE($4, hsn_code),
        isin = COALESCE($5, isin),
        category_id = COALESCE($6, category_id),
        brand_id = COALESCE($7, brand_id),
        brand_collection = COALESCE($8, brand_collection),
        vendor_id = COALESCE($9, vendor_id),
        description = COALESCE($10, description),
        unit = COALESCE($11, unit),
        price = COALESCE($12, price),
        mrp = COALESCE($13, mrp),
        stock_qty = COALESCE($14, stock_qty),
        min_order_qty = COALESCE($15, min_order_qty),
        image_url = COALESCE($16, image_url),
        images = COALESCE($17, images),
        specifications = COALESCE($18, specifications),
        length_mm = COALESCE($19, length_mm),
        breadth_mm = COALESCE($20, breadth_mm),
        width_mm = COALESCE($21, width_mm),
        thickness_mm = COALESCE($22, thickness_mm),
        weight_kg = COALESCE($23, weight_kg),
        box_length_mm = COALESCE($24, box_length_mm),
        box_breadth_mm = COALESCE($25, box_breadth_mm),
        box_width_mm = COALESCE($26, box_width_mm),
        box_weight_kg = COALESCE($27, box_weight_kg),
        colour = COALESCE($28, colour),
        grade = COALESCE($29, grade),
        material = COALESCE($30, material),
        calibration = COALESCE($31, calibration),
        certification = COALESCE($32, certification),
        termite_resistance = COALESCE($33, termite_resistance),
        warranty = COALESCE($34, warranty),
        country_of_origin = COALESCE($35, country_of_origin),
        customer_care_details = COALESCE($36, customer_care_details),
        tech_sheet_url = COALESCE($37, tech_sheet_url),
        manufactured_by = COALESCE($38, manufactured_by),
        packaged_by = COALESCE($39, packaged_by),
        lead_time_days = COALESCE($40, lead_time_days),
        is_active = COALESCE($41, is_active),
        updated_at = NOW()
       WHERE id = $42
       RETURNING *`, [
            name, slug, sku, hsn_code, isin,
            category_id, brand_id, brand_collection,
            vendor_id, description, unit, price, mrp,
            stock_qty, min_order_qty, image_url,
            images ? JSON.stringify(images) : null,
            specifications ? JSON.stringify(specifications) : null,
            length_mm, breadth_mm, width_mm, thickness_mm, weight_kg,
            box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg,
            colour, grade, material, calibration, certification,
            termite_resistance, warranty, country_of_origin,
            customer_care_details, tech_sheet_url,
            manufactured_by, packaged_by, lead_time_days, is_active, id
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Product update error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.update = update;
// GET /api/products/low-stock
const getLowStock = async (req, res) => {
    try {
        const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
        const threshold = parseInt(req.query.threshold) || 10;
        const countResult = await db_1.default.query("SELECT COUNT(*) FROM products WHERE stock_qty <= $1 AND is_active = true", [threshold]);
        const total = parseInt(countResult.rows[0].count);
        const result = await db_1.default.query(`SELECT ${PRODUCT_FIELDS}, c.name AS category_name, b.name AS brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.stock_qty <= $1 AND p.is_active = true
       ORDER BY p.stock_qty ASC
       LIMIT $2 OFFSET $3`, [threshold, limit, offset]);
        res.json((0, pagination_1.paginatedResponse)(result.rows, total, { page, limit, offset }));
    }
    catch (error) {
        console.error("Product getLowStock error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getLowStock = getLowStock;
// GET /api/products/inventory-summary
const getInventorySummary = async (_req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_products,
        SUM(stock_qty) AS total_stock,
        SUM(CASE WHEN stock_qty <= 0 THEN 1 ELSE 0 END) AS out_of_stock,
        SUM(CASE WHEN stock_qty > 0 AND stock_qty <= 10 THEN 1 ELSE 0 END) AS low_stock
      FROM products
    `);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Product getInventorySummary error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getInventorySummary = getInventorySummary;
// DELETE /api/products/:id (soft delete)
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query("UPDATE products SET is_active = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted" });
    }
    catch (error) {
        console.error("Product delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.remove = remove;
//# sourceMappingURL=product.controller.js.map