# ASTRA Tool Registry & Execution Policies

## 1. Tool Registry Overview

All capabilities available to ASTRA and its subagents are encapsulated as strictly typed tools registered in `toolRegistry.ts`. Tools define input parameters, return schemas, permission levels, and execution handlers.

---

## 2. Standard Tool Catalog

### 2.1 File & Workspace Tools
- `read_file(path)` — Read file content with path jailing check.
- `write_file(path, content)` — Write file content with automated backup.
- `list_directory(dirPath)` — List files and subdirectories.
- `search_codebase(pattern)` — Fast regex code search.

### 2.2 System & Automation Tools
- `launch_app(appName)` — Open native application on host.
- `type_text(content)` — Send keystrokes to active window.
- `adjust_volume(level)` — Mute, volume up, volume down.
- `execute_sandbox_cmd(command)` — Run shell command in sandboxed environment.

### 2.3 Web & Research Tools
- `web_search(query)` — Multi-engine web search with authoritative summarization.
- `fetch_url_content(url)` — Download and extract markdown from web URLs.
- `weather_lookup(location)` — Current meteorological conditions.
- `time_date_lookup(timezone)` — Accurate local/UTC timestamp.

### 2.4 Vision & Perception Tools
- `capture_screen()` — Capture current desktop display for OCR analysis.
- `analyze_webcam_frame()` — Analyze camera feed for physical object identification.

### 2.5 Hardware & Robotics Tools
- `robotics_get_state()` — Read telemetry from connected physical device.
- `robotics_request_motion(goal)` — Request kinematic movement plan.
- `robotics_emergency_stop()` — Immediate hardware halt interlock.
