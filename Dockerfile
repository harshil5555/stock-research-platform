# Stage 1: Build client
FROM node:22-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:22-alpine AS server-build
WORKDIR /build/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D appuser

# Copy server build and production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-build /build/server/dist ./dist

# Copy client build as static files
COPY --from=client-build /build/client/dist ./public

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["node", "dist/index.js"]
