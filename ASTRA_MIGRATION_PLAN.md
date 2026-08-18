# ASTRA PRODUCTION MIGRATION PLAN

**Target Release:** ASTRA OS Enterprise/Production Pipeline (v10.0-Ultra)  
**Execution Environment:** Node.js 24+ / TypeScript & Express Dedicated Modular Architecture  
**Database:** Supabase Managed PostgreSQL + `pgvector`  

---

## 1. Pipeline Architectural Blueprint

```
USER
  │ (Voice / Text / Vision / Screen)
  ▼
ASTRA CLIENT (Desktop HUD / Web / Android)
  │
  ▼
API GATEWAY (/api/v1/* on Port 8990)
  │
  ├── [1] AUTH & JWT VERIFICATION (Supabase Auth / Session Manager)
  │
  ├── [2] CONTEXT ENGINE (Synthesizes 15-Layer Memory Matrix)
  │
  ├── [3] INTENT ENGINE & PLANNER (Decomposes complex requests into DAG steps)
  │
  ├── [4] MODEL ROUTER (OpenAI, Gemini, Groq, DeepSeek, Local Ollama)
  │
  ├── [5] AGENT ORCHESTRATOR (Research, Coding, Creative, System, Robotics)
  │
  ├── [6] TOOL REGISTRY & SANDBOX (File ops, Computer control, Web, Terminal)
  │       └── PERMISSION GATEKEEPER (Risk Scoring: LOW to CRITICAL)
  │
  ├── [7] VERIFICATION & SELF-HEALING (Test execution, lint check, health scan)
  │
  ├── [8] MEMORY CONSOLIDATION (Supabase pgvector & Knowledge Graph update)
  │
  ├── [9] EVENT BUS & PROACTIVE ENGINE (PubSub alerts, Webhooks, Notifications)
  │
  ▼
RESPONSE FORMATTER (Streaming Speech Synthesis & HUD State Update)
```

---

## 2. Implementation Phases

### Phase 1: Modular Backend Architecture (`/backend`)
* Build modular subdirectories: `core/`, `config/`, `auth/`, `ai/`, `models/`, `memory/`, `agents/`, `tools/`, `tasks/`, `workflows/`, `voice/`, `vision/`, `computer/`, `sandbox/`, `integrations/`, `events/`, `notifications/`, `devices/`, `security/`, `robotics/`, `observability/`, `self_development/`.

### Phase 2: Database Schema & Supabase Repository
* Complete database migration SQL (`supabase_schema.sql`) with normalized tables: `profiles`, `conversations`, `messages`, `memories`, `projects`, `project_files`, `tasks`, `task_steps`, `agents`, `agent_runs`, `tools`, `tool_runs`, `workflows`, `workflow_runs`, `knowledge_documents`, `devices`, `device_events`, `oauth_connections`, `audit_logs`.
* Implement `SupabaseRepository` service layer.

### Phase 3: AI Provider Adapters & Model Router
* Implement abstract `AIProvider` base class and concrete adapters (`OpenAIProvider`, `GoogleProvider`, `GroqProvider`, `DeepSeekProvider`, `LocalProvider`).
* Implement cost-aware and latency-aware routing with automatic fallback.

### Phase 4: Multi-Layer Memory Engine (15 Tiers) & Context Synthesizer
* Implement all 15 memory tiers with semantic pgvector cosine search and Knowledge Graph integration.
* Implement `ContextEngine` to dynamically build concise, authoritative prompt contexts.

### Phase 5: Agent Orchestrator & Task Engine State Machine
* Full lifecycle management (`QUEUED` -> `PLANNING` -> `RUNNING` -> `WAITING` -> `NEEDS_APPROVAL` -> `VERIFYING` -> `COMPLETED`).
* Dynamic transient agent creation and synthesis.

### Phase 6: Permission Gatekeeper, Sandbox & Computer Automation
* Risk-scored command execution with timeout policies, directory jails, prompt-injection sanitization, and keystroke/app management.

### Phase 7: Voice, Vision & Proactive Notification Engine
* Voice session manager with interruption hooks, screen/camera frame analysis, and desktop/in-app alert dispatching.

### Phase 8: Future Robotics & Wearables Abstraction
* `RoboticsController`, `SuitController`, and `DigitalTwin` simulation interface with strict safety interlocks.

### Phase 9: Verification, End-to-End Test Suite & Documentation
* Unit and integration test runner, full acceptance testing, and documentation index.
