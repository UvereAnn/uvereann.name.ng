#Stage 1: Install dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPy package*.json ./
RUN npm ci --only production

# Stage 2: production runtime
FROM node:20-alpine AS runtime

# SECURITY: Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 1. Create the data directory and set permissions BEFORE switching users
# We create a specific folder for the database so permissions are easier to manage
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Copy installed packages from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=appuser:appgroup . .

# 2. Ensure the /app directory itself is owned by appuser 
# (Required for SQLite to create -wal and -shm files)
RUN chown appuser:appgroup /app

# Switch to non-root user
USER appuser

# Tell docker this container listens to port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q -O- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]