-- ==========================================================
-- ASTRA OS — PRODUCTION POSTGRESQL & PGVECTOR SCHEMA v10.0
-- ==========================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. User Profiles & Preferences Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'User',
    avatar TEXT,
    timezone TEXT DEFAULT 'UTC+5:30',
    locale TEXT DEFAULT 'en-US',
    preferences JSONB DEFAULT '{"theme": "dark", "voice": "natural", "persona": "calm_confident"}'::jsonb,
    personality TEXT DEFAULT 'JARVIS/FRIDAY-class AI Assistant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Conversations & Messages Tables
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    mode TEXT DEFAULT 'general', -- 'general', 'coding', 'research', 'robotics'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    tool_calls JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 15-Layer Hierarchical Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    tier TEXT NOT NULL CHECK (tier IN (
        'WORKING', 'SHORT_TERM', 'EPISODIC', 'SEMANTIC', 'PROCEDURAL',
        'PERSONAL', 'PREFERENCE', 'PROJECT', 'CONVERSATIONAL', 'ENVIRONMENTAL',
        'TOOL', 'AGENT', 'KNOWLEDGE', 'RELATIONSHIP', 'TEMPORAL'
    )),
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    importance INT DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    embedding vector(1536),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects & Files
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    content_hash TEXT,
    size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Autonomous Tasks & Step State Machine
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    goal TEXT NOT NULL,
    agent_role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN (
        'QUEUED', 'PLANNING', 'RUNNING', 'WAITING', 'NEEDS_APPROVAL',
        'VERIFYING', 'COMPLETED', 'FAILED', 'CANCELLED', 'ROLLED_BACK'
    )),
    priority TEXT DEFAULT 'MEDIUM',
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    artifacts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    step_index INT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    output TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Devices & Synchronized Nodes
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Desktop', 'Android', 'Robotics', 'Wearable'
    os TEXT,
    capabilities TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'OFFLINE',
    safety_level TEXT DEFAULT 'SAFE',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Immutable Security Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    status TEXT NOT NULL,
    agent_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Semantic Vector Similarity Search Stored Procedure
CREATE OR REPLACE FUNCTION match_memories (
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id UUID,
    tier TEXT,
    content TEXT,
    tags TEXT[],
    importance INT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        memories.id,
        memories.tier,
        memories.content,
        memories.tags,
        memories.importance,
        1 - (memories.embedding <=> query_embedding) AS similarity
    FROM memories
    WHERE 1 - (memories.embedding <=> query_embedding) > match_threshold
      AND (memories.valid_until IS NULL OR memories.valid_until > NOW())
    ORDER BY memories.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Default User Isolation RLS Policies
CREATE POLICY "Users can only access their own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own messages" ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);
CREATE POLICY "Users can only access their own memories" ON public.memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own devices" ON public.devices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own audit logs" ON public.audit_logs FOR ALL USING (auth.uid() = user_id);
