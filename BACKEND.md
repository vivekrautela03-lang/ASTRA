# ASTRA OS — Custom Backend Architecture (Layer A)

The **ASTRA Custom Dedicated Backend** is located in `/backend` and provides complete isolation between cognitive logic, hardware safety, and persistent database storage.

```
/backend
├── config/             # Environment, ports, security flags
│   └── env.js
├── auth/               # Supabase JWT cryptographic verifier & session tracking
│   ├── jwtVerifier.js
│   └── sessionManager.js
├── security/           # Zero-Trust permission engine, sandbox & prompt defense
│   ├── permissionEngine.js
│   ├── secretManager.js
│   └── promptDefense.js
├── ai/                 # Pluggable AIProvider interface & concrete adapters
│   ├── aiProvider.js
│   └── providers/      # OpenAI, Google, Groq, DeepSeek, Local Ollama
├── models/             # Dynamic Model Router with latency/cost failover
│   └── modelRouter.js
├── memory/             # Complete 15-tier memory manager & Knowledge Graph
│   ├── memoryManager.js
│   └── knowledgeGraph.js
├── core/               # Cognitive context engine, intent engine, planner & gateway
│   ├── contextEngine.js
│   ├── intentEngine.js
│   ├── planner.js
│   └── gateway.js
├── agents/             # Autonomous agent manager & specialized swarm
│   └── agentManager.js
├── tools/              # Typed tool catalog & execution gate
│   └── toolRegistry.js
├── computer/           # Host OS automation (apps, files, keystrokes, volume)
│   └── computerController.js
├── sandbox/            # Process execution jail & hazardous command blocklist
│   └── sandboxManager.js
├── tasks/              # Task engine state machine & step graph
│   └── taskManager.js
├── workflows/          # Node-based visual & scheduled workflow runner
│   └── workflowEngine.js
├── events/             # Internal PubSub event bus
│   └── eventBus.js
├── notifications/      # Desktop, in-app & web alert engine
│   └── notificationEngine.js
├── voice/              # Realtime voice sessions, VAD & interruption pipeline
│   └── voiceSessionManager.js
├── vision/             # Screen awareness & multimodal frame processor
│   └── visionProcessor.js
├── devices/            # Cross-device synchronizer
│   └── deviceManager.js
├── robotics/           # Kinematic safety interlock, wearable suit & digital twin
│   ├── roboticsController.js
│   ├── suitController.js
│   └── digitalTwin.js
├── integrations/       # Official cloud connectors & Supabase repository
│   ├── integrationManager.js
│   └── supabaseRepository.js
├── observability/      # Telemetry, uptime, latency & cost tracker
│   └── telemetry.js
└── self_development/   # Self-inspection, diagnostics & patch proposal
    └── selfDiagnostics.js
```

---

## 🛰️ API Gateway (`/api/v1/*`)

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/status` | System health, uptime & user session |
| `POST` | `/api/v1/chat` | 15-Layer Context + Model Router pipeline |
| `POST` | `/api/v1/voice/session` | Realtime voice session initialization |
| `POST` | `/api/v1/vision/analyze` | Frame perception & OCR extraction |
| `GET` | `/api/v1/tasks` | Active & historical DAG task graphs |
| `POST` | `/api/v1/tasks` | Create autonomous task with planner |
| `POST` | `/api/v1/agents/run` | Dispatch specialized agent workflow |
| `POST` | `/api/v1/tools/execute` | Execute typed tool with Risk Gating |
| `POST` | `/api/v1/workflows/run` | Execute multi-step workflow |
| `GET` | `/api/v1/memory` | 15-tier memory search & Knowledge Graph |
| `GET` | `/api/v1/devices` | Synchronized cross-device mesh status |
| `GET` | `/api/v1/integrations` | Connected third-party cloud services |
| `GET` | `/api/v1/security/audit` | Pending approvals & audit log stream |
| `GET` | `/api/v1/observability/health` | Memory usage, tokens & system health |
