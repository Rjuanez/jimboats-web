# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl \
  && npm install --global pnpm@10.34.1

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p public \
  && pnpm media:prepare \
  && pnpm build

FROM node:24-alpine AS runner

ENV HOSTNAME=0.0.0.0
ENV HOME=/home/nextjs
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl \
  && npm install --global prisma@7.8.0 \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs \
  && mkdir -p /home/nextjs \
  && mkdir -p /var/lib/jimboats/media \
  && chown -R nextjs:nodejs /home/nextjs \
  && chown -R nextjs:nodejs /var/lib/jimboats/media

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.mjs ./prisma.config.mjs

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
