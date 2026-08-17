# ASTRA OS Security Architecture & Policies

## 1. Security Overview

ASTRA OS is engineered with a **Zero-Trust Security Architecture**. Because ASTRA has the capability to interact with local operating systems, cloud APIs, and future physical hardware, strict containment boundaries and defensive measures are enforced at every layer.

---

## 2. Core Security Pillars

### 2.1 Backend Credential Vault & Masking
* **No Client-Side Secrets:** Third-party API keys (OpenAI, Gemini, Groq, GitHub, Supabase) are strictly isolated on the backend server.
* **Secret Masking:** In UI panels, keys and tokens are displayed in masked form (e.g. `sk-...4e89`) and never exposed in full to client logs or network payloads.
* **Non-Exfiltration Guarantee:** ASTRA will never search for leaked keys, read unauthorized files, harvest browser cookies/passwords, or transmit secrets into LLM prompts.

### 2.2 Multi-Tier Permission Engine
Every system action is categorized by risk:

| Permission Level | Risk Tier | Behavior | Example Actions |
| :--- | :--- | :--- | :--- |
| `READ` | LOW | Autonomous | Read telemetry, inspect authorized project files |
| `SAFE_ACTION` | LOW | Autonomous | Adjust volume, open calculator, focus window |
| `WRITE` | MEDIUM | Logged / Sandboxed | Create file in workspace, save note |
| `EXECUTE` | HIGH | Policy Sandbox | Run test command, execute compiler |
| `DEPLOY` | HIGH | Explicit Approval | Git push, trigger Vercel deployment |
| `DELETE` | CRITICAL | Explicit Confirmation | Delete file, drop database records |
| `PHYSICAL` | CRITICAL | Hardware Interlock | Actuator movement, suit climbing adhesion |

### 2.3 Prompt Injection & Untrusted Content Defense
External inputs (web pages, search results, clipboard contents, GitHub issues, emails) are treated as **untrusted data payloads**:
1. Untrusted content is wrapped in isolated data delimiters (`<untrusted_content>...</untrusted_content>`).
2. System instructions strictly instruct models to ignore imperative commands or privilege escalation attempts found within external data.

### 2.4 Sandboxed Shell Execution
* **Working Directory Jailing:** File read/write operations are confined to approved workspace roots.
* **Command Blocklist:** Destructive commands (`rm -rf /`, `format`, `del /s /q C:\*`, `forkbomb`) are intercepted and rejected immediately.
* **Execution Timeouts:** Shell executions enforce strict timeouts (default: 10 seconds) to prevent infinite loops and resource starvation.

### 2.5 Audit Logging
All actions performed by ASTRA OS are recorded in the `audit_logs` database table with timestamp, user ID, agent ID, tool invoked, risk level, and execution status.
