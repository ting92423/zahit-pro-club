# Production build for ZAHIT API
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm --filter @zahit/db exec prisma generate

# Build shared and api
RUN pnpm --filter @zahit/shared build
RUN pnpm --filter api build

# Runtime image
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/shared ./packages/shared/
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3001

# Entrypoint script to run migrations and start
CMD ["sh", "-c", "pnpm --filter @zahit/db exec prisma migrate deploy && pnpm --filter api start:prod"]
