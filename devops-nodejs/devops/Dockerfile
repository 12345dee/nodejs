# Stage 1 — Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer cache optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Stage 2 — Production image
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy deps from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY src/ ./src/
COPY package.json ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check baked into the image
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start command
CMD ["node", "src/app.js"]
```

---

## 📄 File 6 — `.dockerignore`
```
node_modules
.env
*.log
.git
.gitignore
README.md
