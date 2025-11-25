# Backend/Dockerfile
# ---------- Stage 1: Build ----------
FROM node:22-slim AS build

WORKDIR /app

# Set temporary mirror (fast build)
RUN npm set registry https://registry.npmmirror.com \
    && npm set fetch-retries 5 \
    && npm set fetch-retry-factor 10 \
    && npm set fetch-retry-mintimeout 20000 \
    && npm set fetch-retry-maxtimeout 120000 \
    && npm set strict-ssl false

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy all files AFTER dependencies
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build



# ---------- Stage 2: Runtime ----------
FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=4001
ENV DOCKER_ENV=true
ENV REDIS_URL=redis://redis:6379

# Copy package.json
COPY package*.json ./


# ✔ ใช้ node_modules จาก build stage (มี Prisma Engine)
COPY --from=build /app/node_modules ./node_modules

# Copy built output & prisma schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 4001

CMD ["node", "dist/main.js"]
