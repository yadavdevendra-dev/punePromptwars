# Use the official Node.js 20 LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json from backend
COPY backend/package.json ./backend/

# Install ONLY production dependencies (no native modules now!)
WORKDIR /usr/src/app/backend
RUN npm install --omit=dev

# Copy all source files
WORKDIR /usr/src/app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set working directory to backend
WORKDIR /usr/src/app/backend

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/server.js"]
