FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY api ./api
COPY shared ./shared
COPY tsconfig.json ./

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3099
ENV DB_PATH=/app/data/railway.db

EXPOSE 3099

CMD ["npx", "tsx", "api/server.ts"]
