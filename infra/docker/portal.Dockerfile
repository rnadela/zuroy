# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/portal/package.json ./apps/portal/
COPY packages/shared/package.json ./packages/shared/

RUN yarn install --frozen-lockfile --ignore-engines --production=false

# Stage 2: Build
FROM deps AS builder
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn workspace @zuroy/shared build
RUN cd apps/portal && npx next build

# Stage 3: Production
FROM node:20-alpine AS production
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/public ./apps/portal/public

USER nextjs
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

HEALTHCHECK --interval=60s --timeout=10s --retries=3 --start-period=30s \
  CMD wget --spider -q http://localhost:3000 || exit 1

CMD ["node", "apps/portal/server.js"]
