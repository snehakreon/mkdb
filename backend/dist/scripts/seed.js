"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
async function seed() {
    console.log("Seeding database...\n");
    try {
        // ========================================================================
        // ADMIN USER
        // ========================================================================
        const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
        const existing = await db_1.default.query("SELECT id FROM users WHERE email = $1", ["admin@platform.com"]);
        if (existing.rows.length > 0) {
            const userId = existing.rows[0].id;
            await db_1.default.query(`UPDATE users SET password_hash = $1, is_active = true, is_verified = true,
         failed_login_attempts = 0, locked_until = NULL WHERE id = $2`, [hashedPassword, userId]);
            const roleCheck = await db_1.default.query(`SELECT id FROM user_roles WHERE user_id = $1 AND role = 'super_admin'`, [userId]);
            if (roleCheck.rows.length === 0) {
                await db_1.default.query(`INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'super_admin', true)`, [userId]);
            }
            console.log("Admin user updated (password reset to admin123)");
        }
        else {
            const userResult = await db_1.default.query(`INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true, true) RETURNING id`, ["admin@platform.com", "9999999999", hashedPassword, "Platform", "Admin", "admin"]);
            await db_1.default.query(`INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'super_admin', true)`, [userResult.rows[0].id]);
            console.log("Admin user created");
        }
        console.log("  Email: admin@platform.com | Password: admin123\n");
        // ========================================================================
        // BRANDS (20)
        // ========================================================================
        console.log("Seeding brands...");
        const brandsData = [
            { name: "Asian Paints", slug: "asian-paints" },
            { name: "Berger Paints", slug: "berger-paints" },
            { name: "Kajaria Ceramics", slug: "kajaria-ceramics" },
            { name: "Somany Ceramics", slug: "somany-ceramics" },
            { name: "Johnson Tiles", slug: "johnson-tiles" },
            { name: "Hindware", slug: "hindware" },
            { name: "Jaquar", slug: "jaquar" },
            { name: "Parryware", slug: "parryware" },
            { name: "Century Plyboards", slug: "century-plyboards" },
            { name: "Greenply", slug: "greenply" },
            { name: "Havells", slug: "havells" },
            { name: "Anchor by Panasonic", slug: "anchor-panasonic" },
            { name: "Astral Pipes", slug: "astral-pipes" },
            { name: "Supreme Pipes", slug: "supreme-pipes" },
            { name: "Hettich", slug: "hettich" },
            { name: "Godrej Locks", slug: "godrej-locks" },
            { name: "UltraTech Cement", slug: "ultratech-cement" },
            { name: "ACC Cement", slug: "acc-cement" },
            { name: "Philips Lighting", slug: "philips-lighting" },
            { name: "Hafele", slug: "hafele" },
        ];
        const brandMap = {};
        for (const b of brandsData) {
            const exists = await db_1.default.query("SELECT id FROM brands WHERE slug = $1", [b.slug]);
            if (exists.rows.length > 0) {
                brandMap[b.slug] = exists.rows[0].id;
            }
            else {
                const r = await db_1.default.query("INSERT INTO brands (name, slug, is_active) VALUES ($1, $2, true) RETURNING id", [b.name, b.slug]);
                brandMap[b.slug] = r.rows[0].id;
            }
        }
        console.log(`  ${Object.keys(brandMap).length} brands ready`);
        // ========================================================================
        // CATEGORIES (10 parent + subcategories)
        // ========================================================================
        console.log("Seeding categories...");
        const parentCategories = [
            { name: "Tiles & Flooring", slug: "tiles", sort: 1 },
            { name: "Paints & Coatings", slug: "paints", sort: 2 },
            { name: "Sanitaryware & Bath", slug: "sanitaryware", sort: 3 },
            { name: "Hardware & Plumbing", slug: "hardware", sort: 4 },
            { name: "Plywood & Boards", slug: "boards", sort: 5 },
            { name: "Electrical & Lighting", slug: "electrical", sort: 6 },
            { name: "Cement & Aggregates", slug: "cement", sort: 7 },
        ];
        const catMap = {};
        for (const c of parentCategories) {
            const exists = await db_1.default.query("SELECT id FROM categories WHERE slug = $1", [c.slug]);
            if (exists.rows.length > 0) {
                catMap[c.slug] = exists.rows[0].id;
            }
            else {
                const r = await db_1.default.query("INSERT INTO categories (name, slug, is_active, sort_order) VALUES ($1, $2, true, $3) RETURNING id", [c.name, c.slug, c.sort]);
                catMap[c.slug] = r.rows[0].id;
            }
        }
        const subcategories = [
            // Tiles & Flooring
            { name: "Floor Tiles", slug: "floor-tiles", parent: "tiles" },
            { name: "Wall Tiles", slug: "wall-tiles", parent: "tiles" },
            { name: "Vitrified Tiles", slug: "vitrified-tiles", parent: "tiles" },
            { name: "Outdoor Tiles", slug: "outdoor-tiles", parent: "tiles" },
            // Paints & Coatings
            { name: "Interior Paints", slug: "interior-paints", parent: "paints" },
            { name: "Exterior Paints", slug: "exterior-paints", parent: "paints" },
            { name: "Wood Finishes", slug: "wood-finishes", parent: "paints" },
            { name: "Primers & Putty", slug: "primers-putty", parent: "paints" },
            // Sanitaryware & Bath (includes former Kitchen & Bath)
            { name: "Wash Basins", slug: "wash-basins", parent: "sanitaryware" },
            { name: "Toilets & WC", slug: "toilets-wc", parent: "sanitaryware" },
            { name: "Faucets & Taps", slug: "faucets-taps", parent: "sanitaryware" },
            { name: "Shower Systems", slug: "shower-systems", parent: "sanitaryware" },
            { name: "Kitchen Sinks", slug: "kitchen-sinks", parent: "sanitaryware" },
            { name: "Kitchen Faucets", slug: "kitchen-faucets", parent: "sanitaryware" },
            { name: "Kitchen Accessories", slug: "kitchen-accessories", parent: "sanitaryware" },
            { name: "Chimneys & Hobs", slug: "chimneys-hobs", parent: "sanitaryware" },
            // Hardware & Plumbing (includes former Plumbing)
            { name: "Door Handles", slug: "door-handles", parent: "hardware" },
            { name: "Locks & Latches", slug: "locks-latches", parent: "hardware" },
            { name: "Hinges", slug: "hinges", parent: "hardware" },
            { name: "Drawer Slides", slug: "drawer-slides", parent: "hardware" },
            { name: "CPVC Pipes", slug: "cpvc-pipes", parent: "hardware" },
            { name: "PVC Pipes", slug: "pvc-pipes", parent: "hardware" },
            { name: "Pipe Fittings", slug: "pipe-fittings", parent: "hardware" },
            { name: "Water Tanks", slug: "water-tanks", parent: "hardware" },
            // Plywood & Boards
            { name: "BWP Plywood", slug: "bwp-plywood", parent: "boards" },
            { name: "MR Grade Plywood", slug: "mr-plywood", parent: "boards" },
            { name: "Block Board", slug: "block-board", parent: "boards" },
            { name: "MDF Board", slug: "mdf-board", parent: "boards" },
            // Electrical & Lighting (includes former Lighting)
            { name: "Switches & Sockets", slug: "switches-sockets", parent: "electrical" },
            { name: "MCBs & Distribution", slug: "mcbs-distribution", parent: "electrical" },
            { name: "Wires & Cables", slug: "wires-cables", parent: "electrical" },
            { name: "Fans", slug: "fans", parent: "electrical" },
            { name: "LED Bulbs", slug: "led-bulbs", parent: "electrical" },
            { name: "Panel Lights", slug: "panel-lights", parent: "electrical" },
            { name: "Downlighters", slug: "downlighters", parent: "electrical" },
            { name: "Outdoor Lights", slug: "outdoor-lights", parent: "electrical" },
            { name: "Decorative Lights", slug: "decorative-lights", parent: "electrical" },
            // Cement & Aggregates
            { name: "OPC Cement", slug: "opc-cement", parent: "cement" },
            { name: "PPC Cement", slug: "ppc-cement", parent: "cement" },
            { name: "White Cement", slug: "white-cement", parent: "cement" },
            { name: "Ready Mix Concrete", slug: "ready-mix", parent: "cement" },
        ];
        for (const s of subcategories) {
            const exists = await db_1.default.query("SELECT id FROM categories WHERE slug = $1", [s.slug]);
            if (exists.rows.length > 0) {
                catMap[s.slug] = exists.rows[0].id;
            }
            else {
                const r = await db_1.default.query("INSERT INTO categories (name, slug, parent_id, is_active, sort_order) VALUES ($1, $2, $3, true, 0) RETURNING id", [s.name, s.slug, catMap[s.parent]]);
                catMap[s.slug] = r.rows[0].id;
            }
        }
        console.log(`  ${parentCategories.length} parent + ${subcategories.length} subcategories ready`);
        // ========================================================================
        // PRODUCTS (50+)
        // ========================================================================
        console.log("Seeding products...");
        const productsData = [
            // TILES (10)
            { name: "Kajaria 60x60 Glazed Vitrified Floor Tile - Beige", slug: "kajaria-60x60-gvt-beige", sku: "TIL-KAJ-001", category: "floor-tiles", brand: "kajaria-ceramics", price: 55, mrp: 72, unit: "sqft", stock: 5000, min_order: 100, description: "Premium glazed vitrified tile with anti-skid finish, perfect for living rooms and bedrooms.", grade: "A", material: "Vitrified" },
            { name: "Kajaria 80x80 Polished Vitrified Tile - Marble White", slug: "kajaria-80x80-pvt-marble", sku: "TIL-KAJ-002", category: "vitrified-tiles", brand: "kajaria-ceramics", price: 85, mrp: 110, unit: "sqft", stock: 3000, min_order: 50, description: "Large format polished vitrified tile with marble effect finish.", grade: "A", material: "Vitrified" },
            { name: "Somany 30x60 Ceramic Wall Tile - White Glossy", slug: "somany-30x60-wall-white", sku: "TIL-SOM-001", category: "wall-tiles", brand: "somany-ceramics", price: 32, mrp: 45, unit: "sqft", stock: 8000, min_order: 100, description: "Glossy white ceramic wall tile, ideal for kitchens and bathrooms.", grade: "A", material: "Ceramic" },
            { name: "Somany 60x60 Matt Finish Floor Tile - Grey", slug: "somany-60x60-matt-grey", sku: "TIL-SOM-002", category: "floor-tiles", brand: "somany-ceramics", price: 48, mrp: 62, unit: "sqft", stock: 6000, min_order: 100, description: "Matt finish anti-skid floor tile, suitable for high traffic areas.", grade: "A", material: "Vitrified" },
            { name: "Johnson 30x30 Heavy Duty Outdoor Tile", slug: "johnson-30x30-outdoor", sku: "TIL-JON-001", category: "outdoor-tiles", brand: "johnson-tiles", price: 38, mrp: 52, unit: "sqft", stock: 4000, min_order: 100, description: "Extra tough outdoor tile with high abrasion resistance, ideal for parking and driveways.", grade: "A", material: "Ceramic" },
            { name: "Johnson 60x120 Slab Tile - Statuario", slug: "johnson-60x120-statuario", sku: "TIL-JON-002", category: "vitrified-tiles", brand: "johnson-tiles", price: 120, mrp: 155, unit: "sqft", stock: 2000, min_order: 50, description: "Large format slab tile with premium Statuario marble finish.", grade: "Premium", material: "Vitrified" },
            { name: "Kajaria 30x45 Kitchen Wall Tile - Floral", slug: "kajaria-30x45-kitchen-floral", sku: "TIL-KAJ-003", category: "wall-tiles", brand: "kajaria-ceramics", price: 28, mrp: 38, unit: "sqft", stock: 7000, min_order: 100, description: "Decorative kitchen wall tile with floral pattern. Stain resistant glaze.", grade: "A", material: "Ceramic" },
            { name: "Somany 40x40 Parking Tile - Terracotta", slug: "somany-40x40-parking", sku: "TIL-SOM-003", category: "outdoor-tiles", brand: "somany-ceramics", price: 35, mrp: 48, unit: "sqft", stock: 5000, min_order: 200, description: "Heavy duty parking tile with textured anti-skid surface.", grade: "A", material: "Ceramic" },
            { name: "Johnson 60x60 Wood-Look Vitrified Tile", slug: "johnson-60x60-wood-look", sku: "TIL-JON-003", category: "floor-tiles", brand: "johnson-tiles", price: 72, mrp: 95, unit: "sqft", stock: 3500, min_order: 50, description: "Natural wood grain finish vitrified tile. Combines the beauty of wood with tile durability.", grade: "A", material: "Vitrified" },
            { name: "Kajaria 20x120 Wooden Plank Tile", slug: "kajaria-20x120-plank", sku: "TIL-KAJ-004", category: "floor-tiles", brand: "kajaria-ceramics", price: 95, mrp: 125, unit: "sqft", stock: 2500, min_order: 50, description: "Long plank format tile with realistic wood grain pattern.", grade: "Premium", material: "Vitrified" },
            // PAINTS (8)
            { name: "Asian Paints Royale Luxury Emulsion - White 20L", slug: "ap-royale-luxury-white-20l", sku: "PNT-AP-001", category: "interior-paints", brand: "asian-paints", price: 5800, mrp: 6850, unit: "bucket", stock: 500, min_order: 1, description: "Ultra-premium interior emulsion with Teflon surface protector. Washable and stain-proof." },
            { name: "Asian Paints Apex Ultima Exterior - White 20L", slug: "ap-apex-ultima-white-20l", sku: "PNT-AP-002", category: "exterior-paints", brand: "asian-paints", price: 4200, mrp: 5100, unit: "bucket", stock: 600, min_order: 1, description: "Weather-proof exterior emulsion with 7-year performance warranty." },
            { name: "Berger Silk Glamor Interior Emulsion - White 20L", slug: "berger-silk-glamor-20l", sku: "PNT-BER-001", category: "interior-paints", brand: "berger-paints", price: 4800, mrp: 5600, unit: "bucket", stock: 400, min_order: 1, description: "Luxury interior emulsion with silk-like smooth finish and low VOC." },
            { name: "Berger WeatherCoat All Guard Exterior - White 20L", slug: "berger-weathercoat-20l", sku: "PNT-BER-002", category: "exterior-paints", brand: "berger-paints", price: 3800, mrp: 4500, unit: "bucket", stock: 350, min_order: 1, description: "Advanced exterior paint with anti-algal and anti-fungal protection." },
            { name: "Asian Paints Woodtech Melamyne - Clear 4L", slug: "ap-woodtech-melamyne-4l", sku: "PNT-AP-003", category: "wood-finishes", brand: "asian-paints", price: 1200, mrp: 1450, unit: "can", stock: 300, min_order: 2, description: "High-gloss melamine wood finish for interior furniture and doors." },
            { name: "Asian Paints Trucare Wall Primer - 20L", slug: "ap-trucare-primer-20l", sku: "PNT-AP-004", category: "primers-putty", brand: "asian-paints", price: 1800, mrp: 2200, unit: "bucket", stock: 450, min_order: 1, description: "Water-based wall primer for interior and exterior surfaces." },
            { name: "Berger Bison Wall Putty - 40kg", slug: "berger-bison-putty-40kg", sku: "PNT-BER-003", category: "primers-putty", brand: "berger-paints", price: 850, mrp: 980, unit: "bag", stock: 800, min_order: 5, description: "White cement-based wall putty for smooth and even surface preparation." },
            { name: "Asian Paints Apcolite Enamel - White 4L", slug: "ap-apcolite-enamel-4l", sku: "PNT-AP-005", category: "wood-finishes", brand: "asian-paints", price: 950, mrp: 1150, unit: "can", stock: 350, min_order: 2, description: "Premium synthetic enamel for wood and metal surfaces with superior gloss." },
            // SANITARYWARE (8)
            { name: "Hindware Starlet Over Counter Wash Basin", slug: "hindware-starlet-basin", sku: "SAN-HIN-001", category: "wash-basins", brand: "hindware", price: 3200, mrp: 4100, unit: "piece", stock: 150, min_order: 1, description: "Premium ceramic over-counter wash basin with contemporary oval design." },
            { name: "Hindware Essence Wall Hung WC with Seat", slug: "hindware-essence-wc", sku: "SAN-HIN-002", category: "toilets-wc", brand: "hindware", price: 8500, mrp: 10500, unit: "piece", stock: 80, min_order: 1, description: "Wall hung toilet with soft-close seat cover and rimless flushing technology." },
            { name: "Jaquar Florentine Single Lever Basin Mixer", slug: "jaquar-florentine-mixer", sku: "SAN-JAQ-001", category: "faucets-taps", brand: "jaquar", price: 4800, mrp: 5900, unit: "piece", stock: 200, min_order: 1, description: "Chrome-plated single lever basin mixer with ceramic cartridge and 5-year warranty." },
            { name: "Jaquar Overhead Rain Shower 200mm Chrome", slug: "jaquar-rain-shower-200", sku: "SAN-JAQ-002", category: "shower-systems", brand: "jaquar", price: 6500, mrp: 7800, unit: "piece", stock: 120, min_order: 1, description: "200mm round overhead rain shower with wall mount arm, chrome finish." },
            { name: "Parryware Cascade NXT One Piece WC", slug: "parryware-cascade-nxt", sku: "SAN-PAR-001", category: "toilets-wc", brand: "parryware", price: 6200, mrp: 7800, unit: "piece", stock: 100, min_order: 1, description: "One piece floor mounted WC with S-trap and soft close seat. Water efficient 3/6L dual flush." },
            { name: "Parryware Verve Pedestal Wash Basin", slug: "parryware-verve-basin", sku: "SAN-PAR-002", category: "wash-basins", brand: "parryware", price: 2800, mrp: 3500, unit: "piece", stock: 120, min_order: 1, description: "Full pedestal wash basin with contemporary design. Includes overflow hole." },
            { name: "Jaquar Kubix Pillar Cock Chrome", slug: "jaquar-kubix-pillar", sku: "SAN-JAQ-003", category: "faucets-taps", brand: "jaquar", price: 2200, mrp: 2800, unit: "piece", stock: 300, min_order: 2, description: "Quarter turn pillar cock with chrome finish and brass body. 5-year warranty." },
            { name: "Hindware Italian Collection Shower Panel", slug: "hindware-shower-panel", sku: "SAN-HIN-003", category: "shower-systems", brand: "hindware", price: 15000, mrp: 18500, unit: "piece", stock: 40, min_order: 1, description: "Multi-function shower panel with body jets, overhead shower, and hand shower." },
            // HARDWARE (6)
            { name: "Hettich Quadro V6 Drawer Slide 500mm Pair", slug: "hettich-quadro-v6-500", sku: "HDW-HET-001", category: "drawer-slides", brand: "hettich", price: 850, mrp: 1050, unit: "pair", stock: 500, min_order: 10, description: "Full extension soft-close drawer slides, 500mm length. 30kg load capacity." },
            { name: "Hettich Sensys 110° Soft Close Hinge", slug: "hettich-sensys-110", sku: "HDW-HET-002", category: "hinges", brand: "hettich", price: 180, mrp: 220, unit: "piece", stock: 2000, min_order: 20, description: "110° opening angle concealed hinge with integrated soft close." },
            { name: "Godrej Ultra XL+ Deadbolt Lock - Satin", slug: "godrej-ultra-xl-deadbolt", sku: "HDW-GOD-001", category: "locks-latches", brand: "godrej-locks", price: 2800, mrp: 3500, unit: "piece", stock: 150, min_order: 1, description: "High security 4-pin deadbolt with anti-pick and anti-drill features." },
            { name: "Godrej Duralock Main Door Handle Set", slug: "godrej-duralock-handle", sku: "HDW-GOD-002", category: "door-handles", brand: "godrej-locks", price: 1500, mrp: 1850, unit: "set", stock: 200, min_order: 1, description: "Stainless steel main door handle set with lever lock. Suitable for 35-45mm door thickness." },
            { name: "Hafele Straight Bar Pull Handle 300mm SS", slug: "hafele-bar-pull-300", sku: "HDW-HAF-001", category: "door-handles", brand: "hafele", price: 650, mrp: 820, unit: "piece", stock: 400, min_order: 5, description: "304 grade stainless steel pull handle, 300mm center-to-center. Satin finish." },
            { name: "Hafele Slido Classic 80 Sliding Door Kit", slug: "hafele-slido-classic-80", sku: "HDW-HAF-002", category: "hardware", brand: "hafele", price: 4500, mrp: 5600, unit: "set", stock: 60, min_order: 1, description: "Sliding door fitting set for wooden doors up to 80kg. Includes track, rollers, and guide." },
            // PLYWOOD & BOARDS (6)
            { name: "Century 18mm BWP Marine Plywood 8x4", slug: "century-18mm-bwp-8x4", sku: "PLY-CEN-001", category: "bwp-plywood", brand: "century-plyboards", price: 3500, mrp: 4200, unit: "sheet", stock: 200, min_order: 5, description: "IS:710 grade boiling waterproof marine plywood. Termite and borer treated.", grade: "BWP" },
            { name: "Century 19mm MR Grade Commercial Plywood 8x4", slug: "century-19mm-mr-8x4", sku: "PLY-CEN-002", category: "mr-plywood", brand: "century-plyboards", price: 2200, mrp: 2800, unit: "sheet", stock: 300, min_order: 5, description: "IS:303 grade moisture resistant commercial plywood for interior furniture.", grade: "MR" },
            { name: "Greenply 18mm BWP Plywood 8x4", slug: "greenply-18mm-bwp-8x4", sku: "PLY-GRN-001", category: "bwp-plywood", brand: "greenply", price: 3200, mrp: 3900, unit: "sheet", stock: 250, min_order: 5, description: "Zero emission BWP grade plywood with lifetime warranty against borer and termite.", grade: "BWP" },
            { name: "Greenply 19mm Block Board 8x4", slug: "greenply-19mm-blockboard", sku: "PLY-GRN-002", category: "block-board", brand: "greenply", price: 2600, mrp: 3200, unit: "sheet", stock: 150, min_order: 5, description: "High density pine core block board for shelves, partitions, and door shutters.", grade: "MR" },
            { name: "Century 18mm MDF Board Plain 8x4", slug: "century-18mm-mdf-8x4", sku: "PLY-CEN-003", category: "mdf-board", brand: "century-plyboards", price: 1800, mrp: 2200, unit: "sheet", stock: 200, min_order: 5, description: "High density plain MDF board for CNC routing, lamination, and painting.", grade: "E1" },
            { name: "Greenply 12mm MR Plywood 8x4", slug: "greenply-12mm-mr-8x4", sku: "PLY-GRN-003", category: "mr-plywood", brand: "greenply", price: 1600, mrp: 2000, unit: "sheet", stock: 350, min_order: 10, description: "12mm commercial grade MR plywood for light furniture and interior applications.", grade: "MR" },
            // ELECTRICAL (6)
            { name: "Havells 10A One Way Switch - White", slug: "havells-10a-switch-white", sku: "ELC-HAV-001", category: "switches-sockets", brand: "havells", price: 65, mrp: 85, unit: "piece", stock: 5000, min_order: 50, description: "Modular one way switch 10A with polycarbonate body and silver alloy contacts." },
            { name: "Havells 32A SP MCB C Curve", slug: "havells-32a-mcb", sku: "ELC-HAV-002", category: "mcbs-distribution", brand: "havells", price: 280, mrp: 350, unit: "piece", stock: 1000, min_order: 10, description: "Single pole miniature circuit breaker 32A, C curve. 10kA breaking capacity." },
            { name: "Anchor Roma 6A 2-Pin Socket - White", slug: "anchor-roma-6a-socket", sku: "ELC-ANC-001", category: "switches-sockets", brand: "anchor-panasonic", price: 48, mrp: 62, unit: "piece", stock: 5000, min_order: 50, description: "Modular 6A two-pin socket with child safety shutter. ISI certified." },
            { name: "Havells Lifeline 1.5 sqmm Wire 90m - Red", slug: "havells-lifeline-1-5mm-90m", sku: "ELC-HAV-003", category: "wires-cables", brand: "havells", price: 1850, mrp: 2200, unit: "coil", stock: 400, min_order: 2, description: "FR-LSH PVC insulated copper wire, 1.5 sq mm. Heat resistant up to 85°C." },
            { name: "Havells Pacer 1200mm Ceiling Fan - White", slug: "havells-pacer-1200-fan", sku: "ELC-HAV-004", category: "fans", brand: "havells", price: 1450, mrp: 1750, unit: "piece", stock: 250, min_order: 1, description: "1200mm sweep ceiling fan with aerodynamic blades for high air delivery." },
            { name: "Anchor Woods 16A Socket with Switch", slug: "anchor-woods-16a-socket", sku: "ELC-ANC-002", category: "switches-sockets", brand: "anchor-panasonic", price: 195, mrp: 245, unit: "piece", stock: 2000, min_order: 20, description: "16A combined socket with switch, premium wood finish faceplate." },
            // PLUMBING (5)
            { name: "Astral CPVC Pro 3/4 inch Pipe - 3m", slug: "astral-cpvc-pro-3-4-3m", sku: "PLB-AST-001", category: "cpvc-pipes", brand: "astral-pipes", price: 320, mrp: 395, unit: "piece", stock: 2000, min_order: 20, description: "CPVC SDR-11 hot and cold water pipe. Max temperature: 93°C. ISI certified." },
            { name: "Supreme PVC SWR 110mm Pipe - 3m", slug: "supreme-pvc-swr-110-3m", sku: "PLB-SUP-001", category: "pvc-pipes", brand: "supreme-pipes", price: 450, mrp: 550, unit: "piece", stock: 1500, min_order: 10, description: "PVC soil, waste and rainwater drainage pipe. Type A ring-fit joint." },
            { name: "Astral CPVC Elbow 3/4 inch 90°", slug: "astral-cpvc-elbow-3-4", sku: "PLB-AST-002", category: "pipe-fittings", brand: "astral-pipes", price: 28, mrp: 38, unit: "piece", stock: 5000, min_order: 50, description: "CPVC 90 degree elbow fitting for hot and cold water plumbing systems." },
            { name: "Supreme PVC Tee 110mm SWR", slug: "supreme-pvc-tee-110", sku: "PLB-SUP-002", category: "pipe-fittings", brand: "supreme-pipes", price: 85, mrp: 110, unit: "piece", stock: 3000, min_order: 20, description: "PVC equal tee fitting for SWR drainage systems. Ring-fit joint." },
            { name: "Astral CPVC 1 inch Pipe - 3m", slug: "astral-cpvc-1inch-3m", sku: "PLB-AST-003", category: "cpvc-pipes", brand: "astral-pipes", price: 520, mrp: 640, unit: "piece", stock: 1500, min_order: 10, description: "1 inch CPVC pipe for mainline hot and cold water supply. 50-year life." },
            // KITCHEN (4)
            { name: "Hafele Single Bowl SS Kitchen Sink 24x18", slug: "hafele-single-bowl-24x18", sku: "KIT-HAF-001", category: "kitchen-sinks", brand: "hafele", price: 4500, mrp: 5500, unit: "piece", stock: 80, min_order: 1, description: "304 grade stainless steel single bowl kitchen sink with satin finish." },
            { name: "Hafele Pull-Down Kitchen Faucet Chrome", slug: "hafele-pulldown-faucet", sku: "KIT-HAF-002", category: "kitchen-faucets", brand: "hafele", price: 6800, mrp: 8200, unit: "piece", stock: 60, min_order: 1, description: "Single lever pull-down spray kitchen faucet with dual function spray head." },
            { name: "Hindware Nevio 60cm Auto Clean Chimney", slug: "hindware-nevio-60-chimney", sku: "KIT-HIN-001", category: "chimneys-hobs", brand: "hindware", price: 12000, mrp: 15000, unit: "piece", stock: 50, min_order: 1, description: "60cm auto-clean filterless chimney with 1200 m3/hr suction. Touch control." },
            { name: "Hettich Cargo Basket 600mm Unit", slug: "hettich-cargo-basket-600", sku: "KIT-HET-001", category: "kitchen-accessories", brand: "hettich", price: 3200, mrp: 3900, unit: "piece", stock: 100, min_order: 1, description: "Stainless steel pull-out cargo basket for 600mm base unit with soft close." },
            // CEMENT (4)
            { name: "UltraTech OPC 53 Grade Cement - 50kg", slug: "ultratech-opc-53-50kg", sku: "CEM-ULT-001", category: "opc-cement", brand: "ultratech-cement", price: 380, mrp: 420, unit: "bag", stock: 5000, min_order: 50, description: "53 grade ordinary portland cement for high strength structural work.", grade: "53" },
            { name: "ACC PPC Cement - 50kg", slug: "acc-ppc-50kg", sku: "CEM-ACC-001", category: "ppc-cement", brand: "acc-cement", price: 350, mrp: 390, unit: "bag", stock: 5000, min_order: 50, description: "Portland pozzolana cement for general construction, plastering, and masonry work.", grade: "PPC" },
            { name: "UltraTech White Cement - 1kg", slug: "ultratech-white-1kg", sku: "CEM-ULT-002", category: "white-cement", brand: "ultratech-cement", price: 28, mrp: 32, unit: "kg", stock: 10000, min_order: 100, description: "Pure white cement for decorative work, tile joints, and wall putty mixing." },
            { name: "ACC Gold PPC Cement - 50kg", slug: "acc-gold-ppc-50kg", sku: "CEM-ACC-002", category: "ppc-cement", brand: "acc-cement", price: 370, mrp: 410, unit: "bag", stock: 4000, min_order: 50, description: "Premium grade PPC cement with superior consistency for foundations and RCC work.", grade: "PPC" },
            // LIGHTING (5)
            { name: "Philips 9W LED Bulb B22 Cool Day Light", slug: "philips-9w-led-b22-cdl", sku: "LIT-PHI-001", category: "led-bulbs", brand: "philips-lighting", price: 85, mrp: 110, unit: "piece", stock: 5000, min_order: 20, description: "9W LED bulb with B22 base. 6500K cool daylight. 15,000 hours rated life." },
            { name: "Philips 18W Round LED Panel Light", slug: "philips-18w-panel-round", sku: "LIT-PHI-002", category: "panel-lights", brand: "philips-lighting", price: 480, mrp: 600, unit: "piece", stock: 800, min_order: 5, description: "18W surface mount round LED panel light. Slim design, uniform light distribution." },
            { name: "Havells 15W LED Downlighter 6 inch", slug: "havells-15w-downlight-6", sku: "LIT-HAV-001", category: "downlighters", brand: "havells", price: 550, mrp: 680, unit: "piece", stock: 600, min_order: 5, description: "15W recessed LED downlighter with 6 inch cutout. 3000K warm white." },
            { name: "Philips 15W LED Bulb B22 Warm White", slug: "philips-15w-led-b22-ww", sku: "LIT-PHI-003", category: "led-bulbs", brand: "philips-lighting", price: 140, mrp: 180, unit: "piece", stock: 4000, min_order: 10, description: "15W LED bulb for bright illumination. 2700K warm white. Eye comfort technology." },
            { name: "Havells 20W LED Flood Light IP65", slug: "havells-20w-flood-ip65", sku: "LIT-HAV-002", category: "outdoor-lights", brand: "havells", price: 750, mrp: 950, unit: "piece", stock: 400, min_order: 5, description: "20W LED outdoor flood light with IP65 water and dust protection." },
        ];
        let insertCount = 0;
        for (const p of productsData) {
            const exists = await db_1.default.query("SELECT id FROM products WHERE slug = $1", [p.slug]);
            if (exists.rows.length > 0)
                continue;
            await db_1.default.query(`INSERT INTO products (name, slug, sku, category_id, brand_id, description, price, mrp, unit, stock_qty, min_order_qty, grade, is_active, country_of_origin, material)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, 'India', $13)`, [
                p.name, p.slug, p.sku,
                catMap[p.category] || null,
                brandMap[p.brand] || null,
                p.description,
                p.price, p.mrp, p.unit,
                p.stock, p.min_order,
                p.grade || null,
                p.material || null,
            ]);
            insertCount++;
        }
        console.log(`  ${insertCount} products inserted (${productsData.length - insertCount} already existed)`);
        // ========================================================================
        // DEMO BUYER USER
        // ========================================================================
        console.log("Seeding demo buyer...");
        const buyerExists = await db_1.default.query("SELECT id FROM users WHERE email = 'buyer@example.com'");
        if (buyerExists.rows.length === 0) {
            const buyerHash = await bcryptjs_1.default.hash("buyer123", 10);
            const bu = await db_1.default.query(`INSERT INTO users (email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
         VALUES ('buyer@example.com', '9700000001', $1, 'Vikram', 'Singh', 'buyer', true, true) RETURNING id`, [buyerHash]);
            await db_1.default.query(`INSERT INTO user_roles (user_id, role, is_active) VALUES ($1, 'buyer_admin', true)`, [bu.rows[0].id]);
            await db_1.default.query(`INSERT INTO buyers (user_id, company_name) VALUES ($1, 'Singh Constructions Pvt Ltd')`, [bu.rows[0].id]);
            console.log("  Buyer: buyer@example.com / buyer123");
        }
        else {
            console.log("  Demo buyer already exists");
        }
        console.log("\nSeed complete! Database is ready.");
        console.log("  20 brands, 7 parent categories, 44 subcategories, 62 products");
    }
    catch (error) {
        console.error("Seed error:", error.message);
        console.error(error.stack);
    }
    finally {
        await db_1.default.end();
        process.exit(0);
    }
}
seed();
//# sourceMappingURL=seed.js.map