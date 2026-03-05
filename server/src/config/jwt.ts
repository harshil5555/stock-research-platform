export function getJwtSecret(): string {
  const secret = process.env.STOCK_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not configured: set STOCK_JWT_SECRET or JWT_SECRET");
  }
  return secret;
}
