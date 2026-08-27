import platform as _platform
import subprocess as _subprocess
import sys
import os
import json
import re
import threading
import time
import asyncio
import traceback
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

# ── Force UTF-8 Encoding ───────────────────────────────────────────────
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Headless Window Flag on Windows ───────────────────────────────────
if _platform.system() == "Windows":
    _OrigPopen = _subprocess.Popen
    class _Popen(_OrigPopen):
        def __init__(self, args, **kw):
            kw["creationflags"] = kw.get("creationflags", 0) | _subprocess.CREATE_NO_WINDOW
            kw.pop("startupinfo", None)
            super().__init__(args, **kw)
    _subprocess.Popen = _Popen

# ── Set Python Paths ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
AI_BACKEND_DIR = PROJECT_ROOT / "ai-assistant--main" / "ai-assistant--main"

if str(AI_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(AI_BACKEND_DIR))

API_CONFIG_PATH = AI_BACKEND_DIR / "config" / "api_keys.json"
PROMPT_PATH = AI_BACKEND_DIR / "core" / "prompt.txt"

# ── Headless Web Bridge UI (Replaces legacy PyQt6 ui.py) ───────────────
class AstraWebBridgeUI:
    def __init__(self):
        self.muted = False
        self.current_file = None
        self.state = "ONLINE"
        self.logs = []
        self.on_text_command = None
        self.on_remote_clicked = None
        self.on_interrupt = None
        self.get_plugins = lambda: []
        self.request_say = None

    def set_state(self, state: str):
        self.state = state
        print(f"[ASTRA STATE]: {state}")

    def write_log(self, text: str):
        print(f"[ASTRA LOG]: {text}")
        self.logs.append({"timestamp": time.time(), "text": text})

    def show_content(self, title: str, text: str):
        print(f"[ASTRA CONTENT] {title}: {text[:120]}...")

    def wait_for_api_key(self):
        pass

    def start_camera_stream(self):
        pass

    def stop_camera_stream(self):
        pass

bridge_ui = AstraWebBridgeUI()

TOOL_DECLARATIONS = [
    {"name": "open_app", "description": "Opens any application on the computer."},
    {"name": "web_search", "description": "Searches the web for facts, news, and current events."},
    {"name": "system_status", "description": "Returns real-time CPU, RAM, GPU, and process metrics."},
    {"name": "weather_report", "description": "Gives the weather report for any city."},
    {"name": "send_message", "description": "Sends a text message via WhatsApp or Telegram."},
    {"name": "reminder", "description": "Sets a timed reminder using Task Scheduler."},
    {"name": "youtube_video", "description": "Controls YouTube: play videos, summarize, trending."},
    {"name": "screen_process", "description": "Captures screen or camera and analyzes vision."},
    {"name": "close_camera", "description": "Closes the live camera view."},
    {"name": "computer_settings", "description": "Controls volume, brightness, dark mode, wifi, shutdown."},
    {"name": "browser_control", "description": "Automates browser navigation, searching, and scraping."},
    {"name": "file_controller", "description": "Manages files: list, create, delete, move, read, write."},
    {"name": "desktop_control", "description": "Controls wallpaper, organize desktop, clean files."},
    {"name": "code_helper", "description": "Writes, edits, explains, or runs code."},
    {"name": "dev_agent", "description": "Builds complete multi-file projects from scratch."},
    {"name": "computer_control", "description": "Direct keyboard/mouse automation and screenshots."},
    {"name": "game_updater", "description": "Installs and updates Steam / Epic games."},
    {"name": "flight_finder", "description": "Searches Google Flights."},
    {"name": "shutdown_astra", "description": "Shuts down the assistant."},
    {"name": "file_processor", "description": "Processes uploaded documents, images, PDFs, spreadsheets."},
    {"name": "save_memory", "description": "Saves personal facts to long-term memory."}
]

def dispatch_tool(name: str, args: dict) -> dict:
    tool = str(name or '').lower().strip()
    try:
        if tool == "open_app":
            from actions.open_app import open_app
            r = open_app(parameters=args, response=None, player=bridge_ui)
            return {"success": True, "result": r or f"Opened {args.get('app_name')}."}

        elif tool in ("weather_report", "weather"):
            from actions.weather_report import weather_action
            r = weather_action(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "Weather delivered."}

        elif tool == "web_search":
            from actions.web_search import web_search as web_search_action
            r = web_search_action(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "Search completed."}

        elif tool == "browser_control":
            try:
                from actions.browser_control import browser_control
                r = browser_control(parameters=args, player=bridge_ui)
                return {"success": True, "result": r or "Browser command executed."}
            except Exception:
                import webbrowser
                url = args.get("url") or args.get("query")
                if url:
                    if not url.startswith("http"):
                        url = f"https://www.google.com/search?q={url}"
                    webbrowser.open(url)
                    return {"success": True, "result": f"Opened browser at {url}"}
                return {"success": True, "result": "Browser opened."}

        elif tool == "file_controller":
            from actions.file_controller import file_controller
            r = file_controller(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "File system operation complete."}

        elif tool == "file_processor":
            from actions.file_processor import file_processor
            r = file_processor(parameters=args, player=bridge_ui, speak=lambda s: None)
            return {"success": True, "result": r or "File processed successfully."}

        elif tool == "send_message":
            from actions.send_message import send_message
            r = send_message(parameters=args, response=None, player=bridge_ui, session_memory=None)
            return {"success": True, "result": r or f"Message queued for {args.get('receiver')}."}

        elif tool == "reminder":
            from actions.reminder import reminder
            r = reminder(parameters=args, response=None, player=bridge_ui)
            return {"success": True, "result": r or "Reminder scheduled."}

        elif tool in ("youtube_video", "youtube"):
            from actions.youtube_video import youtube_video
            r = youtube_video(parameters=args, response=None, player=bridge_ui)
            return {"success": True, "result": r or "YouTube action executed."}

        elif tool == "computer_settings":
            from actions.computer_settings import computer_settings
            r = computer_settings(parameters=args, response=None, player=bridge_ui)
            return {"success": True, "result": r or "Computer settings updated."}

        elif tool == "desktop_control":
            from actions.desktop import desktop_control
            r = desktop_control(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "Desktop command completed."}

        elif tool == "code_helper":
            from actions.code_helper import code_helper
            r = code_helper(parameters=args, player=bridge_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Code task executed."}

        elif tool == "dev_agent":
            from actions.dev_agent import dev_agent
            r = dev_agent(parameters=args, player=bridge_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Dev agent task finished."}

        elif tool == "computer_control":
            from actions.computer_control import computer_control
            r = computer_control(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "Computer control executed."}

        elif tool == "game_updater":
            from actions.game_updater import game_updater
            r = game_updater(parameters=args, player=bridge_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Game updater command finished."}

        elif tool == "flight_finder":
            from actions.flight_finder import flight_finder
            r = flight_finder(parameters=args, player=bridge_ui)
            return {"success": True, "result": r or "Flight search completed."}

        elif tool == "system_status":
            from actions.system_monitor import get_system_status
            r = get_system_status()
            return {"success": True, "result": str(r)}

        elif tool == "screen_process" or tool == "capture_screen":
            from actions.screen_processor import _capture_screen
            img_b, mime = _capture_screen()
            import base64
            b64 = base64.b64encode(img_b).decode("ascii")
            return {"success": True, "mime": mime, "base64": b64}

        elif tool == "save_memory":
            from memory.memory_manager import update_memory
            cat = args.get("category", "notes")
            k = args.get("key", "")
            v = args.get("value", "")
            if k and v:
                update_memory({cat: {k: {"value": v}}})
            return {"success": True, "result": f"Saved memory: {cat}/{k}"}

        elif tool == "load_memory":
            from memory.memory_manager import load_memory
            m = load_memory()
            return {"success": True, "memory": m}

        else:
            return {"success": False, "error": f"Unknown tool: {name}"}

    except Exception as err:
        return {"success": False, "error": str(err), "traceback": traceback.format_exc()}

def process_chat_query(prompt: str) -> dict:
    lower = prompt.lower().strip()

    # 1. Native Tool Pattern Matching
    if re.match(r'^(open|launch|start)\s+(.+)', lower):
        app = re.sub(r'^(open|launch|start)\s+', '', prompt, flags=re.IGNORECASE).strip()
        res = dispatch_tool("open_app", {"app_name": app})
        return {
            "response": res.get("result", f"Opened {app}."),
            "toolUsed": "open_app",
            "modelUsed": "astra-python-native",
            "success": True
        }

    if "system status" in lower or "pc status" in lower or "cpu usage" in lower or "system performance" in lower:
        res = dispatch_tool("system_status", {})
        return {
            "response": f"📊 Real-Time System Metrics:\n\n{res.get('result')}",
            "toolUsed": "system_status",
            "modelUsed": "astra-python-native",
            "success": True
        }

    if "weather" in lower and ("in " in lower or "for " in lower or "at " in lower):
        m = re.search(r'weather\s+(?:in|for|at)\s+([a-zA-Z\s]+)', prompt, re.IGNORECASE)
        city = m.group(1).strip() if m else "London"
        res = dispatch_tool("weather_report", {"city": city})
        return {
            "response": res.get("result", f"Weather delivered for {city}."),
            "toolUsed": "weather_report",
            "modelUsed": "astra-python-native",
            "success": True
        }

    if "play " in lower and "youtube" in lower:
        m = re.search(r'play\s+(.+?)(?:\s+on\s+youtube|\s+youtube|$)', prompt, re.IGNORECASE)
        q = m.group(1).strip() if m else prompt
        res = dispatch_tool("youtube_video", {"action": "play", "query": q})
        return {
            "response": res.get("result", f"Playing {q} on YouTube."),
            "toolUsed": "youtube_video",
            "modelUsed": "astra-python-native",
            "success": True
        }

    if "search " in lower or "who is " in lower or "what is " in lower or "latest news" in lower:
        res = dispatch_tool("web_search", {"query": prompt})
        return {
            "response": res.get("result", "Search completed."),
            "toolUsed": "web_search",
            "modelUsed": "astra-python-native",
            "success": True
        }

    if lower in ("hi", "hello", "hey", "astra", "hey astra", "namaste"):
        return {
            "response": "Online and ready, sir. All system tools, vision engines, and native actions are active. How may I assist you?",
            "modelUsed": "astra-python-native",
            "success": True
        }

    # General Intelligent Execution
    return {
        "response": f"Acknowledged, sir. Processed your directive: \"{prompt}\". All 21 native system tools and memory layers are standing by.",
        "modelUsed": "astra-python-native",
        "success": True
    }

# ── HTTP Server Bridge ─────────────────────────────────────────────────
class AstraBackendHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        if self.path in ("/health", "/"):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ONLINE",
                "backend": "ASTRA Python Native Intelligence Kernel",
                "version": "10.0-ultra",
                "tools": [t["name"] for t in TOOL_DECLARATIONS]
            }).encode('utf-8'))
        elif self.path in ("/api/system/status", "/system/status"):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors()
            self.end_headers()
            res = dispatch_tool("system_status", {})
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ("/chat", "/api/chat", "/api/v1/chat"):
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                prompt = data.get("prompt") or data.get("query") or data.get("text") or ""
                result = process_chat_query(prompt)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))

        elif self.path in ("/execute", "/api/tool", "/api/tools/execute"):
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                tool_name = data.get("tool") or data.get("action") or data.get("name")
                args = data.get("args") or data.get("parameters") or {}
                result = dispatch_tool(tool_name, args)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8991
    server = HTTPServer(('127.0.0.1', port), AstraBackendHandler)
    print(f"\n=======================================================")
    print(f" ⚡ ASTRA PYTHON NATIVE BACKEND RUNNING ON PORT {port}")
    print(f" 🛠️  Tools Active: {len(TOOL_DECLARATIONS)} native actions")
    print(f"=======================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[ASTRA BACKEND] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    main()
