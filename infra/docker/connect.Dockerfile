# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/connect/package.json ./apps/connect/
COPY packages/shared/package.json ./packages/shared/

RUN yarn install --frozen-lockfile --ignore-engines --production=false

# Stage 2: Build
FROM deps AS builder
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn workspace @zuroy/shared build
RUN cd apps/connect && npx next build

# Stage 3: Production
FROM node:20-alpine AS production
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/apps/connect/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/connect/.next/static ./apps/connect/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/connect/public ./apps/connect/public

USER nextjs
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
EXPOSE 3002

HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
  CMD wget --spider -q http://localhost:3002 || exit 1

CMD ["node", "apps/connect/server.js"]
