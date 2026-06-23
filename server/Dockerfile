# Container image for the Smart Notes API (Express + Socket.io + Prisma).
# Build from the repository root so the npm workspace lockfile is available:
#   docker build -f server/Dockerfile -t smartnotes-api .
#
# Designed for a long-running host (Render / Railway / Fly), NOT serverless —
# the Socket.io realtime layer needs a persistent process.

# --- Build stage -----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies against the workspace lockfile. The web workspace's
# package.json must be present for `npm ci` to resolve the lockfile, but its
# source is never copied — only the server is built here.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
RUN npm ci

# Build the server (generates the Prisma client, then compiles TypeScript).
COPY server ./server
RUN npm run db:generate -w server && npm run build -w server

# --- Runtime stage ---------------------------------------------------------
FROM node:20-alpine
WORKDIR /app/server
ENV NODE_ENV=production

# Bring over installed deps (incl. the generated Prisma client + CLI) and the
# compiled server.
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/server /app/server

EXPOSE 4000

# Apply migrations and ensure reference data (subjects, achievements, admin)
# exist — both idempotent — then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js"]
