# ──────────────────────────────────────────────
# Stage 1: Install dependencies & generate Prisma
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# ──────────────────────────────────────────────
# Stage 2: Production image
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

# Copy node_modules (with Prisma client) from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY prisma ./prisma

# Copy pre-committed seed uploads (mis. default-template.pdf, lihat
# backend/.gitignore) sebelum mkdir -p — dulu langkah ini cuma bikin folder
# kosong dan file yang sengaja di-commit (bukan upload user) tidak pernah ikut
# ke image, jadi CertificateTemplate seed selalu 404 di container manapun.
COPY uploads ./uploads

# Create uploads directories (volume will be mounted here)
RUN mkdir -p uploads/cv \
             uploads/org-logos \
             uploads/event-gallery \
             uploads/event-documents \
             uploads/certificate-templates

EXPOSE 4000

# Use dumb-init to handle signals properly in containers
ENTRYPOINT ["dumb-init", "--"]

# Run Prisma migrate deploy then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
