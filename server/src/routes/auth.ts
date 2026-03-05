import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { signToken, authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginLimiter } from "../middleware/rateLimiter";
import { loginSchema } from "../validators/auth";
import { AuthRequest } from "../types";

const router = Router();

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
