# ---------- Stage 1: Builder ----------
FROM node:22-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files first
COPY package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy entire project AFTER deps
COPY . .

# Copy env file for build time
COPY .env.production .env.production

# Build Next.js (Turbopack)
RUN --mount=type=cache,target=/root/.npm \
    npm run build


# ---------- Stage 2: Runner ----------
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only runtime files
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next

# ❌ REMOVE: npm ci --omit=dev (สาเหตุ RAM OOM)
# เพราะ node_modules จาก build stage พร้อมใช้งานแล้ว

# Expose frontend port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
