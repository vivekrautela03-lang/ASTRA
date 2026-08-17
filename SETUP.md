# ASTRA OS Setup & Installation Guide

## 1. System Requirements
- **OS:** Windows 10/11, macOS 13+, or Ubuntu 22.04+
- **Runtime:** Node.js v20.x or v22.x, npm v10+
- **Database:** Supabase account or local PostgreSQL 15+ with `pgvector`
- **Optional:** Local Ollama instance for offline inference (`ollama run llama3`)

---

## 2. Step-by-Step Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/vivekrautela03-lang/ASTRA.git
cd ASTRA
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create `.env` based on `.env.example`:
```bash
cp .env.example .env
```

Populate `.env` with your API keys:
- `OPENAI_API_KEY`: For GPT-4o & Realtime Voice API
- `GEMINI_API_KEY`: For Google Gemini 1.5 Pro multimodal vision & research
- `GROQ_API_KEY`: For ultra-low latency Llama 3.3 70B
- `DEEPSEEK_API_KEY`: For DeepSeek R1 reasoning
- `SUPABASE_URL` & `SUPABASE_PUBLISHABLE_KEY`: For database persistence

### Step 4: Supabase Database Migration
Execute `supabase_schema.sql` in your Supabase SQL Editor to initialize all tables, indexes, and pgvector extensions.

### Step 5: Start ASTRA OS Kernel & UI
In Terminal 1 (Backend Kernel):
```bash
npm run backend
```
Kernel starts on `http://localhost:8990` with WebSocket IPC on `ws://localhost:8990/ev-kernel`.

In Terminal 2 (Vite Frontend):
```bash
npm run dev
```
Frontend opens at `http://localhost:5173`.
