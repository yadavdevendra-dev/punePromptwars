# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY backend/package*.json ./backend/

# Install dependencies in the backend directory
WORKDIR /usr/src/app/backend
RUN npm install --omit=dev

# Copy local code to the container image.
WORKDIR /usr/src/app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set working directory to backend to run the server
WORKDIR /usr/src/app/backend

# Ensure the DB file can be written by creating a placeholder and setting permissions 
# (SQLite needs write access to the directory)
RUN touch data.sqlite && chmod 666 data.sqlite

# Run the web service on container startup.
CMD [ "npm", "start" ]
