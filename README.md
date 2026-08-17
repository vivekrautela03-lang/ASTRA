# ASTRA — Production-Grade Personal AI Operating System

![ASTRA OS Banner](https://img.shields.io/badge/ASTRA_OS-v10.0_Quantum-0ea5e9?style=for-the-badge&logo=probot&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge)
![Security Audit](https://img.shields.io/badge/Security-Zero_Trust_Sandbox-f59e0b?style=for-the-badge)
![Multi--Device](https://img.shields.io/badge/Multi--Device-Desktop_|_Mobile_|_Robotics-8b5cf6?style=for-the-badge)

ASTRA is a personal AI operating system (JARVIS/FRIDAY class) engineered for multimodal intelligence, multi-agent orchestration, computer automation, persistent memory, and future robotics integration.

---

## 🌟 Core Features

- **Multimodal AI Router**: Dynamic task-based routing across OpenAI (GPT-4o), Google Gemini 1.5 Pro, Groq Llama 3.3 70B, DeepSeek R1, and local Ollama.
- **Autonomous Multi-Agent Orchestrator**: Specialized agents for Research, Coding, Creative, System Automation, Browser, and Robotics.
- **Natural Voice Intelligence**: Wake-word activation ("Hey Astra"), natural "Yes, boss" persona, real-time interruptions, and low-latency voice pipeline.
- **Hierarchical Memory Engine**: Unified short-term, long-term, semantic (pgvector), project, and knowledge graph memory.
- **Zero-Trust Security & Sandbox**: Multi-tier permission levels (READ to PHYSICAL), risk scoring, command sandboxing, and prompt-injection defense.
- **Desktop & Computer Control**: Application launching, file read/write, active window automation, system telemetry, and audio volume.
- **Official Integrations Center**: Turnkey connectors for OpenAI, Google Workspace, GitHub, Supabase, Vercel, Figma, and Spotify.
- **Robotics & Digital Twin Abstraction**: High-level hardware abstraction layer (`RoboticsController`, `SuitController`, `DigitalTwin`) ensuring physical safety.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+ / 22+
- npm or pnpm
- Supabase account (or local Postgres with `pgvector`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/vivekrautela03-lang/ASTRA.git
cd ASTRA

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 3. Start the Kernel & Frontend
```bash
# Start the Backend Kernel (Port 8990)
npm run backend

# In a separate terminal, start Vite Frontend (Port 5173)
npm run dev
```

Visit `http://localhost:5173` to access the ASTRA OS interface.

---

## 📚 Documentation Index

| Guide | Description |
| :--- | :--- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deep dive into ASTRA's kernel, router, agent loop, and robotics layer. |
| [SECURITY.md](./SECURITY.md) | Zero-trust sandbox, permission levels, secret vaulting, and prompt defense. |
| [SETUP.md](./SETUP.md) | Comprehensive setup instructions for local development and cloud deployments. |
| [API.md](./API.md) | REST API and WebSocket specifications for the ASTRA kernel. |
| [AGENTS.md](./AGENTS.md) | Agent lifecycle, delegation protocols, and dynamic agent spawning. |
| [MEMORY.md](./MEMORY.md) | Memory hierarchy, pgvector semantic search, and knowledge graph schema. |
| [TOOLS.md](./TOOLS.md) | Tool registry, execution policies, and permission gating. |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Setup and OAuth configuration for third-party services. |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Containerization, staging, and production deployment strategies. |
| [ROBOTICS.md](./ROBOTICS.md) | Future robotics API, kinematic safety gates, and digital twin simulation. |
| [CHANGELOG.md](./CHANGELOG.md) | Release notes and architectural evolution history. |

---

## ⚖️ License
MIT License. Built with precision for autonomous intelligence.
