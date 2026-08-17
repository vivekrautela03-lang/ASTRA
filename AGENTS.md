# ASTRA Multi-Agent System Architecture

## 1. Agent Architecture

In ASTRA OS, the AI operates as an **Autonomous Orchestrator** supervising specialized agent workers. When a complex directive is received, ASTRA breaks it down into distinct subtasks, assigns them to appropriate specialist agents, and synthesizes the outputs.

```
                  +-----------------------+
                  |    ASTRA ORCHESTRATOR |
                  +-----------+-----------+
                              |
     +------------+-----------+-----------+------------+
     |            |           |           |            |
+----+----+  +----+----+ +----+----+ +----+----+  +----+----+
|Research |  | Coding  | | Creative| | System  |  |Robotics |
| Agent   |  | Agent   | | Agent   | | Agent   |  | Agent   |
+---------+  +---------+ +---------+ +---------+  +---------+
```

---

## 2. Specialized Agent Roles

### 2.1 ResearchAgent
- **Responsibilities:** Web searching, authoritative source ranking, multi-source contradiction detection, citation verification, and markdown report synthesis.
- **Tools:** `web_search`, `fetch_url`, `pdf_parser`, `citation_validator`.

### 2.2 CodingAgent
- **Responsibilities:** Codebase analysis, semantic code search, diagnostics, safe git branching (`git checkout -b <branch>`), refactoring, unit test execution, and pull request generation.
- **Safety Policy:** Never modifies `main` branch directly. Generates diff previews and awaits user review before deployment.

### 2.3 CreativeAgent
- **Responsibilities:** Storyboarding, screenwriting, presentation slide decks, visual image generation prompts, and UI copy.

### 2.4 SystemAgent
- **Responsibilities:** Host automation, window focusing, file system operations, background process monitoring, and OS telemetry.

### 2.5 RoboticsAgent
- **Responsibilities:** Spatial mapping, kinematic motion planning, digital twin simulation, and safety interlock verification.

---

## 3. Agent Lifecycle & Task Management

Agents transition through formal lifecycle states:
1. `QUEUED` — Task waiting for dependency resolution.
2. `PLANNING` — Agent generating step-by-step execution graph.
3. `RUNNING` — Active tool execution.
4. `WAITING` — Waiting for external API or subagent.
5. `NEEDS_APPROVAL` — High-risk step awaiting user confirmation.
6. `COMPLETED` — All steps verified and artifacts produced.
7. `FAILED` — Error encountered with diagnostic rollback.
