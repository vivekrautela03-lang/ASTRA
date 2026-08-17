# ASTRA OS System Architecture

## 1. High-Level Architecture

ASTRA OS is engineered with a modular, layered micro-kernel architecture designed to decouple the high-level cognitive layer from low-level device and hardware execution targets.

```
+-----------------------------------------------------------------------------------+
|                                  ASTRA OS CORE                                    |
+-----------------------------------------------------------------------------------+
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  |  Voice Engine     |  |  Vision Engine    |  |  Model Router                 |  |
|  |  - VAD / STT      |  |  - Screen OCR     |  |  - OpenAI / Gemini / Groq     |  |
|  |  - Realtime TTS   |  |  - WebCam Streams |  |  - DeepSeek / Local Ollama    |  |
|  |  - Interruption   |  |  - Document Vision|  |  - Cost / Latency Routing     |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  |  Memory Engine    |  | Agent Orchestrator|  |  Tool Registry & Sandbox      |  |
|  |  - Episodic       |  |  - ResearchAgent  |  |  - Filesystem Operations      |  |
|  |  - Semantic / RAG |  |  - CodingAgent    |  |  - Browser Control            |  |
|  |  - Project Memory |  |  - SystemAgent    |  |  - Sandboxed Shell Execution  |  |
|  |  - Knowledge Graph|  |  - Dynamic Agents |  |  - Permission Gatekeeper      |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  |  Device Manager   |  | Event / Proactive |  |  Security & Credential Vault  |  |
|  |  - Desktop/Mobile |  |  - Webhooks / CI  |  |  - Encrypted Secrets Storage  |  |
|  |  - Digital Twin   |  |  - Cron Timers    |  |  - Prompt Injection Defense   |  |
|  |  - Robotics API   |  |  - Proactive Alerts| |  - Audit Logging              |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Kernel Subsystems

### 2.1 Model Router (`ModelRouter`)
The Model Router evaluates query intent, token complexity, latency requirements, cost thresholds, and privacy constraints:
- **Fast Conversational:** Groq Cloud Llama 3.3 70B (sub-100ms TTFT).
- **Deep Reasoning & Mathematics:** OpenAI GPT-4o / DeepSeek R1.
- **Multimodal & Long-Context:** Google Gemini 1.5 Pro (2M token context window).
- **Air-Gapped & Offline:** Local Ollama / vLLM runtime.
- **Autonomous Fallback:** Automatic sequential failover across active providers.

### 2.2 Agent Orchestrator (`AgentOrchestrator`)
The central coordinator that decomposes user goals into directed acyclic graphs (DAGs) of tasks and assigns them to specialized agents:
- **ResearchAgent:** Synthesizes multi-source citations and generates technical reports.
- **CodingAgent:** Diagnostics, git branching, code refactoring, static analysis, unit testing, and pull requests.
- **CreativeAgent:** Storyboarding, presentations, visual generation, copy creation.
- **SystemAgent:** Host automation, OS diagnostics, file and clipboard operations.
- **RoboticsAgent:** Kinematic path planning, spatial awareness, simulation runs.

### 2.3 Permission Engine & Host Sandbox
All tool calls and execution payloads must pass through the `PermissionEngine`:
- **READ (LOW):** Read-only files, system telemetry.
- **SAFE_ACTION (LOW):** Launch approved apps, volume adjust.
- **WRITE (MEDIUM):** Modify workspace files, update notes.
- **EXECUTE (HIGH):** Run build scripts, linting, tests in sandbox.
- **DEPLOY (HIGH):** Push Git commits, trigger cloud deployments.
- **DELETE (CRITICAL):** Remove directories, database drops.
- **PHYSICAL (CRITICAL):** Motion requests to robotics or actuators.

### 2.4 Multimodal Voice & Vision Engine
- Continuous Wake Word listener with Voice Activity Detection (VAD).
- Streaming bidirectional speech synthesis with dynamic sound effects.
- Screen buffer and camera frame analysis with bounding box OCR.

### 2.5 Hardware & Robotics Layer
The robotics architecture operates through strict interface abstraction (`RoboticsController`, `SuitController`, `SpatialMap`). The LLM generates high-level intentions (e.g. `navigate_to(x, y)` or `assist_walk()`), which are verified by a deterministic safety interlock before passing to physical motor controllers.
