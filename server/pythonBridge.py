import sys
import os
import json
import traceback
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

# ── Force UTF-8 on Windows ──────────────────────────────────────────────
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Setup Python Paths for Actions & Memory ──────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
AI_BACKEND_DIR = PROJECT_ROOT / "ai-assistant--main" / "ai-assistant--main"

if str(AI_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(AI_BACKEND_DIR))

# Dummy player/ui shim for actions that expect a player/ui object
class HeadlessAstraUI:
    def __init__(self):
        self.muted = False
        self.current_file = None

    def write_log(self, text):
        print(f"[ASTRA LOG]: {text}")

    def show_content(self, title, text):
        print(f"[ASTRA CONTENT] {title}: {text[:100]}...")

    def set_state(self, state):
        print(f"[ASTRA STATE]: {state}")

headless_ui = HeadlessAstraUI()

def execute_tool(tool_name: str, args: dict) -> dict:
    tool = str(tool_name or '').lower().strip()
    try:
        if tool == "open_app":
            from actions.open_app import open_app
            r = open_app(parameters=args, response=None, player=headless_ui)
            return {"success": True, "result": r or f"Launched {args.get('app_name', 'application')}."}

        elif tool == "weather_report" or tool == "weather":
            from actions.weather_report import weather_action
            r = weather_action(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "Weather delivered."}

        elif tool == "web_search":
            from actions.web_search import web_search as web_search_action
            r = web_search_action(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "Search completed."}

        elif tool == "browser_control":
            try:
                from actions.browser_control import browser_control
                r = browser_control(parameters=args, player=headless_ui)
                return {"success": True, "result": r or "Browser command executed."}
            except ImportError:
                import webbrowser
                url = args.get("url") or args.get("query")
                if url:
                    if not url.startswith("http"):
                        url = f"https://www.google.com/search?q={url}"
                    webbrowser.open(url)
                    return {"success": True, "result": f"Opened browser: {url}"}
                return {"success": True, "result": "Browser opened."}

        elif tool == "file_controller":
            from actions.file_controller import file_controller
            r = file_controller(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "File system operation complete."}

        elif tool == "file_processor":
            from actions.file_processor import file_processor
            r = file_processor(parameters=args, player=headless_ui, speak=lambda s: None)
            return {"success": True, "result": r or "File processed successfully."}

        elif tool == "send_message":
            from actions.send_message import send_message
            r = send_message(parameters=args, response=None, player=headless_ui, session_memory=None)
            return {"success": True, "result": r or f"Message sent to {args.get('receiver')}."}

        elif tool == "reminder":
            from actions.reminder import reminder
            r = reminder(parameters=args, response=None, player=headless_ui)
            return {"success": True, "result": r or "Reminder scheduled."}

        elif tool == "youtube_video" or tool == "youtube":
            from actions.youtube_video import youtube_video
            r = youtube_video(parameters=args, response=None, player=headless_ui)
            return {"success": True, "result": r or "YouTube action executed."}

        elif tool == "computer_settings":
            from actions.computer_settings import computer_settings
            r = computer_settings(parameters=args, response=None, player=headless_ui)
            return {"success": True, "result": r or "Computer settings updated."}

        elif tool == "desktop_control":
            from actions.desktop import desktop_control
            r = desktop_control(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "Desktop command completed."}

        elif tool == "code_helper":
            from actions.code_helper import code_helper
            r = code_helper(parameters=args, player=headless_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Code task executed."}

        elif tool == "dev_agent":
            from actions.dev_agent import dev_agent
            r = dev_agent(parameters=args, player=headless_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Dev agent task finished."}

        elif tool == "computer_control":
            from actions.computer_control import computer_control
            r = computer_control(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "Computer control executed."}

        elif tool == "game_updater":
            from actions.game_updater import game_updater
            r = game_updater(parameters=args, player=headless_ui, speak=lambda s: None)
            return {"success": True, "result": r or "Game updater command finished."}

        elif tool == "flight_finder":
            from actions.flight_finder import flight_finder
            r = flight_finder(parameters=args, player=headless_ui)
            return {"success": True, "result": r or "Flight search completed."}

        elif tool == "system_status":
            from actions.system_monitor import get_system_status
            r = get_system_status()
            return {"success": True, "result": str(r)}

        elif tool == "capture_screen":
            from actions.screen_processor import _capture_screen
            img_bytes, mime = _capture_screen()
            import base64
            b64 = base64.b64encode(img_bytes).decode("ascii")
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
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

    except Exception as err:
        return {"success": False, "error": str(err), "traceback": traceback.format_exc()}

class BridgeHTTPHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors()
            self.end_headers()
            resp = {
                "status": "ONLINE",
                "engine": "ASTRA Native Python Tool Kernel",
                "version": "10.0-ultra",
                "tools": [
                    "open_app", "web_search", "weather_report", "browser_control",
                    "file_controller", "file_processor", "send_message", "reminder",
                    "youtube_video", "computer_settings", "desktop_control", "code_helper",
                    "dev_agent", "computer_control", "game_updater", "flight_finder",
                    "system_status", "capture_screen", "save_memory", "load_memory"
                ]
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
        elif self.path == "/system/status":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors()
            self.end_headers()
            res = execute_tool("system_status", {})
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/execute" or self.path == "/api/tool":
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                tool_name = data.get("tool") or data.get("action") or data.get("name")
                args = data.get("args") or data.get("parameters") or {}
                result = execute_tool(tool_name, args)
                
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
        # Clean logging
        pass

def run_server(port=8991):
    server = HTTPServer(('127.0.0.1', port), BridgeHTTPHandler)
    print(f"[PythonBridge] ⚡ Native Python Tool Server running on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[PythonBridge] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8991
    run_server(port)
