import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directories exist
const dirs = ["products", "brands", "categories", "documents"];
for (const dir of dirs) {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Allowed image MIME types
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    const subfolder = (_req as any).uploadFolder || "products";
    cb(null, path.join(UPLOAD_DIR, subfolder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(allowedTypes: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`));
    }
  };
}

// Single image upload (max 5MB)
export const uploadImage = multer({
  storage,
  fileFilter: fileFilter(IMAGE_TYPES),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// Multiple images upload (max 10 files, 5MB each)
export const uploadImages = multer({
  storage,
  fileFilter: fileFilter(IMAGE_TYPES),
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10);

// Document upload (images + PDF, max 10MB)
export const uploadDocument = multer({
  storage,
  fileFilter: fileFilter(DOC_TYPES),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("document");

// Set upload subfolder middleware
export const setUploadFolder = (folder: string) => {
  return (req: Request, _res: any, next: any) => {
    (req as any).uploadFolder = folder;
    next();
  };
};

export { UPLOAD_DIR };
