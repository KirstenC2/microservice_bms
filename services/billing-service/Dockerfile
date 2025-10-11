# syntax=docker/dockerfile:1

# 1) Install production deps to keep final image slim
FROM node:20-alpine AS prod-deps
WORKDIR /app
# Build context is the monorepo root, so prefix service path
COPY services/billing-service/package*.json ./
RUN npm ci --omit=dev

# 2) Build stage with dev deps
FROM node:20-alpine AS builder
WORKDIR /app
COPY services/billing-service/package*.json ./
RUN npm ci
# Copy service source code
COPY services/billing-service/ ./
# Copy shared proto from monorepo root into builder
COPY proto ./proto
# Build to dist/
RUN npm run build

# 3) Runtime image with only prod deps + dist + proto
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the compiled app
COPY --from=builder /app/dist ./dist
# Copy production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy proto alongside the app (service uses __dirname ../../proto/booking.proto)
COPY proto ./proto

# gRPC port
EXPOSE 50052

# Start Nest microservice (gRPC)
CMD ["node", "dist/main.js"]