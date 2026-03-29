# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN yarn install --frozen-lockfile --ignore-engines --production=false

# Stage 2: Build
FROM deps AS builder
COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN yarn workspace @zuroy/database db:generate
RUN yarn workspace @zuroy/shared build
RUN yarn workspace @zuroy/database build
RUN cd apps/api && npx nest build

# Stage 3: Production
FROM node:20-alpine AS production
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/database ./packages/database
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs
ENV NODE_ENV=production
EXPOSE 3001
WORKDIR /app/apps/api

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD wget --spider -q http://localhost:3001/v1/health || exit 1

CMD ["node", "dist/main.js"]
