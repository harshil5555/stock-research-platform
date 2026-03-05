import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthPayload } from "../types";
import { getJwtSecret } from "../config/jwt";

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

const DEFAULT_EXPIRY = "30m" as const;
const VALID_EXPIRY_RE = /^\d+[smhd]$/;

export function signToken(payload: AuthPayload): string {
  const envExpiry = process.env.JWT_EXPIRY;
  let expiresIn: number | typeof DEFAULT_EXPIRY = DEFAULT_EXPIRY;
  if (envExpiry) {
    if (/^\d+$/.test(envExpiry)) {
      expiresIn = parseInt(envExpiry, 10);
    } else if (VALID_EXPIRY_RE.test(envExpiry)) {
      expiresIn = envExpiry as typeof DEFAULT_EXPIRY;
    }
    // Invalid format falls through to DEFAULT_EXPIRY
  }
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}
