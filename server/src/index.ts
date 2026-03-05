// CI/CD deploy test
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import { initializeSocket } from "./ws";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Ensure uploads directory exists (use absolute path)
const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Security middleware (configure CSP for SPA)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? false // Same-origin in production (SPA served from same server)
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (built React client in production)
app.use(express.static(path.join(__dirname, "..", "public")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// 404 handler for unmatched API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// SPA fallback -- serve index.html for all non-API GET routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Error handler (MUST be last middleware)
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || "3000", 10);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
function shutdown() {
  console.log("Shutting down gracefully...");
  httpServer.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { app, httpServer };
