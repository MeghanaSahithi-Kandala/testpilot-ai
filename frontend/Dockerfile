# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
