import { Router, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import { db } from "../db";
import { attachments, sources } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { AuthRequest, param, handleRouteError } from "../types";
import { broadcast } from "../ws/broadcast";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");

const router = Router();

// GET /api/sources/:sourceId/attachments
router.get(
  "/sources/:sourceId/attachments",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sourceId = param(req, "sourceId");
      const result = await db
        .select()
        .from(attachments)
        .where(eq(attachments.sourceId, sourceId));

      res.json(result);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("List attachments error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/sources/:sourceId/attachments (with multer error handling)
router.post(
  "/sources/:sourceId/attachments",
  authMiddleware,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "File too large. Maximum size is 10MB." });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const sourceId = param(req, "sourceId");

      // Verify source exists
      const [source] = await db
        .select({ id: sources.id })
        .from(sources)
        .where(eq(sources.id, sourceId))
        .limit(1);

      if (!source) {
        // Clean up uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(404).json({ error: "Source not found" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const [attachment] = await db
        .insert(attachments)
        .values({
          sourceId,
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedBy: req.user!.userId,
        })
        .returning();

      broadcast("attachment", "created", attachment, req.user!.userId);
      res.status(201).json(attachment);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Upload attachment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/attachments/:id/download (with path traversal check)
router.get(
  "/attachments/:id/download",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [attachment] = await db
        .select()
        .from(attachments)
        .where(eq(attachments.id, id))
        .limit(1);

      if (!attachment) {
        res.status(404).json({ error: "Attachment not found" });
        return;
      }

      const filePath = path.resolve(UPLOAD_DIR, attachment.storedName);
      if (!filePath.startsWith(path.resolve(UPLOAD_DIR))) {
        res.status(400).json({ error: "Invalid file path" });
        return;
      }

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File not found on disk" });
        return;
      }

      // Sanitize filename to prevent header injection
      const safeName = attachment.originalName.replace(/[^\w.\-]/g, "_");
      res.download(filePath, safeName);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Download attachment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/attachments/:id (with path traversal check)
router.delete(
  "/attachments/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [attachment] = await db
        .delete(attachments)
        .where(eq(attachments.id, id))
        .returning();

      if (!attachment) {
        res.status(404).json({ error: "Attachment not found" });
        return;
      }

      // Delete file from disk with path traversal protection
      const filePath = path.resolve(UPLOAD_DIR, attachment.storedName);
      if (
        filePath.startsWith(path.resolve(UPLOAD_DIR)) &&
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }

      broadcast(
        "attachment",
        "deleted",
        { id: attachment.id, sourceId: attachment.sourceId },
        req.user!.userId
      );
      res.json({ message: "Attachment deleted" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Delete attachment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
