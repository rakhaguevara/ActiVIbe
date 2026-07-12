# ──────────────────────────────────────────────
# Stage 1: Install & Build (semua 3 portal)
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# VITE_API_URL bisa di-override dari docker-compose build args
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

# Build ketiga portal sekaligus (pakai script yang sudah disiapkan di package.json)
RUN VITE_API_URL=${VITE_API_URL} pnpm build:volunteer && mv dist dist-volunteer
RUN VITE_API_URL=${VITE_API_URL} pnpm build:organizer && mv dist dist-organizer
RUN VITE_API_URL=${VITE_API_URL} pnpm build:admin     && mv dist dist-admin

# ──────────────────────────────────────────────
# Stage 2: Nginx untuk serve static files
# ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Hapus config default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy hasil build ketiga portal
COPY --from=builder /app/dist-volunteer  /usr/share/nginx/volunteer
COPY --from=builder /app/dist-organizer  /usr/share/nginx/organizer
COPY --from=builder /app/dist-admin      /usr/share/nginx/admin

# Copy nginx config (akan diisi oleh docker-compose via volume atau COPY)
COPY nginx.conf /etc/nginx/conf.d/activibe.conf

EXPOSE 80 5173 5175 5176

CMD ["nginx", "-g", "daemon off;"]
