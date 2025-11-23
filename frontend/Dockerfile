# ---------- Stage 1: Builder ----------
FROM node:22-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only package files first
COPY package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy project sources
COPY . .


# Build Next.js (Turbopack)
RUN --mount=type=cache,target=/root/.npm \
    npm run build


# ---------- Stage 2: Runner ----------
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install required dependencies for Next.js runtime
RUN apt-get update -y && apt-get install -y openssl

# Copy runtime files
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next

EXPOSE 3000

CMD ["npm", "run", "start"]
