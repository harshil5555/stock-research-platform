import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, refreshTokens } from "../db/schema";
import { signToken, authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";
import { loginSchema } from "../validators/auth";
import { AuthRequest } from "../types";

const router = Router();

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
  });
}

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = signToken({ userId: user.id, username: user.username });

      // Generate refresh token
      const rawRefreshToken = crypto.randomBytes(64).toString("hex");
      const tokenHash = hashToken(rawRefreshToken);

      // Delete any existing refresh tokens for this user
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, user.id));

      // Store hashed refresh token
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
      await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      // Set httpOnly cookie with plaintext refresh token
      setRefreshCookie(res, rawRefreshToken);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawToken = req.cookies?.refresh_token;
      if (!rawToken) {
        res.status(401).json({ error: "No refresh token" });
        return;
      }

      const tokenHash = hashToken(rawToken);

      const [storedToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

      if (!storedToken || storedToken.expiresAt < new Date()) {
        // Clean up expired token if it exists
        if (storedToken) {
          await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.id, storedToken.id));
        }
        clearRefreshCookie(res);
        res.status(401).json({ error: "Invalid or expired refresh token" });
        return;
      }

      // Look up the user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, storedToken.userId))
        .limit(1);

      if (!user) {
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.id, storedToken.id));
        clearRefreshCookie(res);
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Issue new access token
      const newAccessToken = signToken({
        userId: user.id,
        username: user.username,
      });

      // Rotate refresh token: delete old, create new
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, user.id));

      const newRawRefreshToken = crypto.randomBytes(64).toString("hex");
      const newTokenHash = hashToken(newRawRefreshToken);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

      await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
      });

      setRefreshCookie(res, newRawRefreshToken);

      res.json({ token: newAccessToken });
    } catch (err) {
      console.error("Refresh error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/auth/logout
router.post(
  "/logout",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Delete refresh token from DB
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, req.user!.userId));

      // Clear the cookie
      clearRefreshCookie(res);

      res.json({ message: "Logged out" });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/auth/me
router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, req.user!.userId))
        .limit(1);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error("Get me error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/auth/users - list all users (for assignment dropdowns etc.)
router.get(
  "/users",
  authMiddleware,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(users);

      res.json(allUsers);
    } catch (err) {
      console.error("List users error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
