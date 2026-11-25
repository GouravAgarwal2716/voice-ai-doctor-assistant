# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Build production assets
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
