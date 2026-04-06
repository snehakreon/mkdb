"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = exports.setUploadFolder = exports.uploadDocument = exports.uploadImages = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, "../../uploads");
exports.UPLOAD_DIR = UPLOAD_DIR;
// Ensure upload directories exist
const dirs = ["products", "brands", "categories", "documents"];
for (const dir of dirs) {
    const fullPath = path_1.default.join(UPLOAD_DIR, dir);
    if (!fs_1.default.existsSync(fullPath)) {
        fs_1.default.mkdirSync(fullPath, { recursive: true });
    }
}
// Allowed image MIME types
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const subfolder = _req.uploadFolder || "products";
        cb(null, path_1.default.join(UPLOAD_DIR, subfolder));
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
});
function fileFilter(allowedTypes) {
    return (_req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`));
        }
    };
}
// Single image upload (max 5MB)
exports.uploadImage = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(IMAGE_TYPES),
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
// Multiple images upload (max 10 files, 5MB each)
exports.uploadImages = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(IMAGE_TYPES),
    limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10);
// Document upload (images + PDF, max 10MB)
exports.uploadDocument = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(DOC_TYPES),
    limits: { fileSize: 10 * 1024 * 1024 },
}).single("document");
// Set upload subfolder middleware
const setUploadFolder = (folder) => {
    return (req, _res, next) => {
        req.uploadFolder = folder;
        next();
    };
};
exports.setUploadFolder = setUploadFolder;
//# sourceMappingURL=upload.middleware.js.map