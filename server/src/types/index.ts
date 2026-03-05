import { Request } from "express";

export interface AuthPayload {
  userId: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Safely extract a single string param from req.params and validate as UUID */
export function param(req: Request, key: string): string {
  const val = req.params[key];
  const str = Array.isArray(val) ? val[0] : val;
  if (!UUID_RE.test(str)) {
    throw new ParamValidationError(`Invalid UUID for parameter "${key}"`);
  }
  return str;
}

export class ParamValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParamValidationError";
  }
}

/** Escape LIKE/ILIKE wildcard characters in user input */
export function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

/** Handle errors in route catch blocks. Returns true if the error was handled. */
export function handleRouteError(err: unknown, res: import("express").Response): boolean {
  if (err instanceof ParamValidationError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  return false;
}
