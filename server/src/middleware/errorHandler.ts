import { Request, Response, NextFunction } from "express";
import { ParamValidationError } from "../types";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ParamValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { details: err.message }),
  });
}
