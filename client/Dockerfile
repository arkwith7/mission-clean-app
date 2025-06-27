# --- Build Stage ---
# Use a specific Node.js version for consistency
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies cleanly for production
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the React app for production, creating an optimized build in /app/dist
RUN npm run build


# --- Production Stage ---
# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the optimized build files from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file
# This file will configure Nginx to serve the React app and proxy API requests.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for standard HTTP traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"] 