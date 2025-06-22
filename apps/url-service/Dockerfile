# apps/url-service/Dockerfile

# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN corepack enable && pnpm install
RUN pnpm prisma generate
RUN pnpm prisma migrate deploy
RUN pnpm build

# Etapa 2: runtime
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["node", "dist/main"]
