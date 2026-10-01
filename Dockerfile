# ==============================================================================
# WASHORA Production Multi-Stage Dockerfile
# Stage 1: Base Dependencies
# Stage 2: Build & Asset Optimization
# Stage 3: Minimal Production Runtime
# ==============================================================================

# --- STAGE 1: Dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci || npm install --legacy-peer-deps

# --- STAGE 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js frontend and static bundles
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# --- STAGE 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create secure non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 washapp

# Copy production artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set ownership to non-root user
RUN chown -R washapp:nodejs /app

USER washapp

EXPOSE 3000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["npm", "start"]
