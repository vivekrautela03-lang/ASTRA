# ASTRA OS API Specification

## 1. REST API Endpoints

Base URL: `http://localhost:8990/api`

### 1.1 Core Status & Telemetry
- `GET /health` — Returns system status, OS metrics (CPU, RAM, Network, Battery), and timestamp.
- `GET /astra/status` — Returns AI router status, active model, agent states, and active tasks.

### 1.2 Cognitive & Conversation Endpoints
- `POST /astra/chat` — Send prompt to Model Router with automatic intent classification and tool execution.
  - Body: `{ prompt: string, modelId?: string, stream?: boolean }`
  - Response: `{ text: string, modelUsed: string, tokensPerSec: number, executionTimeMs: number, actionsTaken: [] }`
- `POST /astra/voice` — Stream audio or trigger speech recognition / text-to-speech synthesis pipeline.
- `POST /astra/vision` — Analyze image base64 buffer or camera snapshot.
  - Body: `{ imageBase64: string, prompt?: string, task?: "ocr" | "describe" | "surroundings" }`

### 1.3 Memory Endpoints
- `GET /memory` — Retrieve stored memories (filter by category, query, tags).
- `POST /memory` — Store new memory item `{ content: string, category: string, tags?: string[] }`.
- `DELETE /memory/:id` — Delete a specific memory item.
- `POST /memory/forget` — Delete memories matching a search query.

### 1.4 Agent & Task Orchestration
- `GET /agents` — List all registered agents and their current statuses.
- `POST /agents/run` — Delegate a subtask to a specialized agent `{ agentRole: string, prompt: string }`.
- `GET /tasks` — List all queued, running, and completed tasks.
- `POST /tasks` — Create a new multi-step task.
- `PATCH /tasks/:id` — Update task status or approve execution step.

### 1.5 Integrations & Credentials
- `GET /integrations` — Get status of all official third-party connections.
- `POST /integrations/:provider/connect` — Configure and validate credentials.
- `POST /integrations/:provider/test` — Test connectivity with live API.
- `DELETE /integrations/:provider` — Disconnect provider.

### 1.6 Device & Robotics API
- `GET /devices` — List paired devices (Desktop, Mobile, Robotics, Wearables).
- `POST /devices/pair` — Authenticate and pair a new client device.
- `POST /devices/:id/command` — Send high-level safe action command to device.

---

## 2. WebSocket IPC Bridge

Endpoint: `ws://localhost:8990/ev-kernel`

### 2.1 Emitted Events
- `CONNECTED` — Initial connection handshake with system telemetry.
- `TELEMETRY_UPDATE` — 1Hz live metrics stream (CPU, RAM, GPU, Network).
- `TASK_PROGRESS` — Real-time progress updates for agent workflows.
- `PROACTIVE_ALERT` — Proactive notifications (build failures, battery warnings, schedule events).

### 2.2 Client Messages
- `{ action: "EXECUTE", command: "...", id: "req-1" }` — Sandboxed command execution request.
- `{ action: "APPROVE_STEP", taskId: "...", stepId: "..." }` — Confirm permission for high-risk action.
