FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package*.json ./
RUN npm ci --omit=dev
EXPOSE 4000
CMD ["node", "dist/main.js"]
