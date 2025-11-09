FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=build /app/frontend/.next ./.next
COPY --from=build /app/frontend/public ./public
COPY --from=build /app/frontend/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start"]
