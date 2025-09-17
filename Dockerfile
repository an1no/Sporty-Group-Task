# Dockerfile for Sporty Leagues Angular App

# --- Builder Stage ---
# Use a specific version of node:20-alpine for reproducibility
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and the .npmrc file for dependency installation.
# This allows us to leverage Docker's layer caching. Dependencies will only be
# re-installed if package*.json or .npmrc changes.
COPY package*.json ./
COPY .npmrc .npmrc

# Install dependencies using the configuration from .npmrc
# The --verbose flag provides more output, which can be helpful for debugging.
RUN npm ci --verbose

# Copy the rest of the application source code
COPY . .

# Build the application for production.
# The output will be in the /app/dist directory by default.
RUN npm run build


# --- Production Stage ---
# Use a specific version of nginx:alpine for a lightweight production server
FROM nginx:alpine

# Install curl, which is used for the health check
RUN apk add --no-cache curl

# Copy the built application from the builder stage to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration to handle Angular's routing
# and provide a health check endpoint.
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # This is the key part for Angular routing:
    # It tries to serve the requested file, then a directory,
    # and if both fail, it serves /index.html, letting Angular handle the routing.
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # A simple health check endpoint that always returns 200 OK
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Expose port 80 for the web server
EXPOSE 80

# Add a healthcheck to the container to ensure it's running correctly.
# This is useful for container orchestrators.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1/health || exit 1

# Start nginx in the foreground when the container launches
CMD ["nginx", "-g", "daemon off;"]
