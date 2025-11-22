# Frontend/Dockerfile
# ---------- Stage 1: Builder ----------
FROM node:22-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files first
COPY package*.json ./

# Install dependencies using cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy entire project AFTER deps (cache-friendly)
COPY . .

# Load .env.production
COPY .env.production .env.production

# Build Next.js
RUN --mount=type=cache,target=/root/.npm \
    npm run build


# ---------- Stage 2: Runner ----------
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only runtime files
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next

# Install only production deps
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
