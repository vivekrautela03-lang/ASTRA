# ASTRA OS — Database Architecture (Layer B: Supabase Platform)

ASTRA delegates persistence, identity, vector search, and Row Level Security (RLS) to **Supabase Managed PostgreSQL + `pgvector`**.

---

## 🗄️ Relational Entities & Schema

1. **`profiles`**: User identity, display name, avatar, timezone, and cognitive personality preferences.
2. **`conversations`**: Dialogue session threads with metadata and operational modes.
3. **`messages`**: Multi-turn dialogue history with role, tool calls, and attachments.
4. **`memories`**: 15-Layer hierarchical memory store with temporal validity (`valid_from`, `valid_until`), importance ranking, tags, and 1536-dimensional `vector(1536)` embeddings.
5. **`projects` & `project_files`**: Project workspaces with tracked file hashes and dependencies.
6. **`tasks` & `task_steps`**: Autonomous DAG task states (`QUEUED`, `PLANNING`, `RUNNING`, `WAITING`, `NEEDS_APPROVAL`, `VERIFYING`, `COMPLETED`, `FAILED`, `CANCELLED`, `ROLLED_BACK`).
7. **`devices`**: Registered cross-device endpoints (Desktop, Android, Robotics, Wearable).
8. **`audit_logs`**: Immutable, append-only security logs recording every tool execution, risk score, and user approval.

---

## 🔍 Semantic Search Stored Procedure

```sql
SELECT * FROM match_memories(
    query_embedding := '[...]'::vector,
    match_threshold := 0.75,
    match_count := 5
);
```

---

## 🛡️ Row Level Security (RLS)

Every user-owned table enforces RLS:
```sql
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own memories" 
ON public.memories FOR ALL 
USING (auth.uid() = user_id);
```
