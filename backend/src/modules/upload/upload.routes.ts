import { Router, Request, Response, NextFunction } from "express";
import { upload } from "./upload.middleware";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// POST /api/upload — single file upload
router.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        const status = err.message.includes("not allowed") ? 400 : 413;
        return res.status(status).json({ message: err.message });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }
);

// POST /api/upload/multiple — up to 10 files
router.post(
  "/multiple",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err) {
        const status = err.message.includes("not allowed") ? 400 : 413;
        return res.status(status).json({ message: err.message });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const results = files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));
    res.status(201).json(results);
  }
);

export default router;
