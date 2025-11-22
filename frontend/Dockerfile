# ---------- Stage 1: Builder ----------
FROM node:22-slim AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files first
COPY package*.json ./

# Install dependencies (faster with CI)
RUN npm ci

# Copy all source code
COPY . .

# Load .env.production (only for build-time NEXT_PUBLIC vars)
# This copies the file but does NOT rely on "export"
COPY .env.production .env.production

# Build Next.js app
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

# Remove dev dependencies for smaller & secure image
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
