# ASTRA Hierarchical Memory Engine

## 1. Memory Taxonomy

ASTRA OS features a multi-tiered memory architecture designed to retain context across short interactions, multi-day development projects, and lifetime user preferences:

| Memory Tier | Description | Storage Substrate |
| :--- | :--- | :--- |
| `SHORT_TERM` | Rolling conversation scratchpad & active window state | In-memory RAM ring buffer (last 20 turns) |
| `LONG_TERM` | Explicit facts, user details, and operational rules | Supabase Postgres `memories` table |
| `PROJECT` | Code architecture, tech stack, open issues, and decisions | Supabase Postgres `projects` & `project_files` |
| `PREFERENCE` | User tone, preferred code conventions, voice model | Local storage + Cloud sync |
| `SEMANTIC` | Document embeddings & knowledge base search | Supabase `pgvector` (`vector(1536)`) |
| `EPISODIC` | Past task executions, debugging logs, and outcomes | Supabase Postgres `system_logs` |
| `PROCEDURAL` | Learned step-by-step workflow recipes | Knowledge Graph |

---

## 2. Knowledge Graph Layer

Alongside vector retrieval, ASTRA utilizes a relationship graph to maintain entity associations:

```
[User: Vivek]
    │── created ──> [Project: ASTRA OS]
    │── owns ──> [Device: Primary PC]
    └── preference ──> [Theme: Dark / Amber Gold]

[Project: ASTRA OS]
    │── depends_on ──> [Tech: React 19, Supabase, Groq, Gemini]
    │── active_task ──> [Task: Production Kernel Migration]
    └── connected_to ──> [Integration: GitHub, Vercel]
```

---

## 3. Natural Language Memory Commands

- *"Astra, remember this: we use Vite 8 and React 19 for all frontends."* → Saves to `PREFERENCE` & `PROJECT` memory.
- *"What do you remember about my project stack?"* → Performs hybrid vector + graph lookup.
- *"Forget our discussion about the old scraper."* → Safely deletes matching memory entries.
