"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
// POST /api/upload/image/:folder — single image
router.post("/image/:folder", auth_middleware_1.authenticate, (req, res, next) => {
    const folder = req.params.folder;
    (0, upload_middleware_1.setUploadFolder)(folder)(req, res, () => {
        (0, upload_middleware_1.uploadImage)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const fileUrl = `/uploads/${folder}/${req.file.filename}`;
            res.json({ url: fileUrl, filename: req.file.filename });
        });
    });
});
// POST /api/upload/images/:folder — multiple images (up to 10)
router.post("/images/:folder", auth_middleware_1.authenticate, (req, res, next) => {
    const folder = req.params.folder;
    (0, upload_middleware_1.setUploadFolder)(folder)(req, res, () => {
        (0, upload_middleware_1.uploadImages)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No files uploaded" });
            }
            const urls = files.map((f) => ({
                url: `/uploads/${folder}/${f.filename}`,
                filename: f.filename,
            }));
            res.json({ files: urls });
        });
    });
});
// POST /api/upload/document/:folder — single document (PDF/image)
router.post("/document/:folder", auth_middleware_1.authenticate, (req, res, next) => {
    const folder = req.params.folder;
    (0, upload_middleware_1.setUploadFolder)(folder)(req, res, () => {
        (0, upload_middleware_1.uploadDocument)(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const fileUrl = `/uploads/${folder}/${req.file.filename}`;
            res.json({ url: fileUrl, filename: req.file.filename });
        });
    });
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map