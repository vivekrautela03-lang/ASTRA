# ASTRA OS Deployment & Operations Guide

## 1. Production Architecture

ASTRA OS is deployed using a decoupled architecture:
1. **Kernel Daemon:** Node.js Express & WebSocket kernel running as a supervised process or Docker container.
2. **Frontend Client:** High-performance static SPA hosted via Vercel, Netlify, or self-hosted Nginx.
3. **Database Cluster:** Managed Supabase PostgreSQL with `pgvector`.

---

## 2. Docker Deployment

### 2.1 Build & Run Container
```bash
# Build the unified ASTRA container
docker build -t astra-os:latest .

# Run with environment secrets
docker run -d \
  -p 8990:8990 \
  -p 5173:5173 \
  --env-file .env \
  --name astra-os-kernel \
  astra-os:latest
```

---

## 3. Self-Healing & Health Checks

ASTRA exposes standard health endpoints for container orchestrators:
- `GET http://localhost:8990/api/health`
- WebSocket Heartbeat on `ws://localhost:8990/ev-kernel` (1Hz telemetry update).
