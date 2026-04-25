# Lightweight Alpine image - no native modules needed
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json
COPY backend/package.json ./backend/

# Install production dependencies
WORKDIR /usr/src/app/backend
RUN npm install --omit=dev

# Copy all source files
WORKDIR /usr/src/app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set working directory to backend for startup
WORKDIR /usr/src/app/backend

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Start server
CMD ["node", "src/server.js"]
