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

# Copy package.json
COPY package*.json ./

# Install dependencies (include dev deps because build needs them)
RUN npm ci

# Copy all files
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

# Copy only necessary build output
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4001

CMD ["node", "dist/main.js"]
