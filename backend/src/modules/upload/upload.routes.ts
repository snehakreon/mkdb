import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadImage, uploadImages, uploadDocument, setUploadFolder, UPLOAD_DIR } from "../../middleware/upload.middleware";

const router = Router();

// POST /api/upload/image/:folder — single image
router.post(
  "/image/:folder",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const folder = req.params.folder;
    setUploadFolder(folder)(req, res, () => {
      uploadImage(req, res, (err: any) => {
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
  }
);

// POST /api/upload/images/:folder — multiple images (up to 10)
router.post(
  "/images/:folder",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const folder = req.params.folder;
    setUploadFolder(folder)(req, res, () => {
      uploadImages(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        const files = req.files as Express.Multer.File[];
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
  }
);

// POST /api/upload/document/:folder — single document (PDF/image)
router.post(
  "/document/:folder",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const folder = req.params.folder;
    setUploadFolder(folder)(req, res, () => {
      uploadDocument(req, res, (err: any) => {
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
  }
);

export default router;
