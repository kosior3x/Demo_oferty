import os
import sys
import json
import re
import subprocess
import time
import traceback
import google.generativeai as genai

# ==========================================
# CONFIGURATION & CONSTANTS
# ==========================================
VERSION = "4.0.0 (Builder Edition)"
WORKSPACE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")

# Ensure directories exist
os.makedirs(WORKSPACE_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# ANSI Colors for formatting
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# ==========================================
# TOOL DEFINITIONS
# ==========================================
TOOLS_SCHEMA = [
    {
        "name": "execute_code",
        "description": "Executes Python or Bash code. Use for all calculations, file manipulations, and logic.",
        "parameters": {
            "type": "object",
            "properties": {
                "language": {"type": "string", "enum": ["python", "bash"]},
                "code": {"type": "string", "description": "The code to execute."}
            },
            "required": ["language", "code"]
        }
    },
    {
        "name": "create_file",
        "description": "Creates or overwrites a file with specific content.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Relative path in workspace"},
                "content": {"type": "string", "description": "File content"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "read_file",
        "description": "Reads the content of a file.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "list_files",
        "description": "Lists files in the workspace (recursive).",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Subdirectory to list (optional)"}
            }
        }
    }
]

# ==========================================
# CORE CLASSES
# ==========================================

class ToolExecutor:
    def __init__(self, workspace_dir):
        self.workspace_dir = workspace_dir

    def _resolve_path(self, path):
        # Prevent escaping workspace
        path = path.strip().lstrip('/')
        full_path = os.path.abspath(os.path.join(self.workspace_dir, path))
        if not full_path.startswith(os.path.abspath(self.workspace_dir)):
            raise ValueError(f"Access denied: {path} is outside workspace")
        return full_path

    def execute_code(self, language, code):
        if language == 'python':
            return self._run_python(code)
        elif language == 'bash':
            return self._run_bash(code)
        else:
            return {"status": "error", "output": f"Unsupported language: {language}"}

    def _run_python(self, code):
        # Create a temporary file
        temp_filename = f"temp_exec_{int(time.time())}.py"
        full_path = self._resolve_path(temp_filename)

        try:
            with open(full_path, 'w') as f:
                f.write(code)

            result = subprocess.run(
                [sys.executable, full_path],
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=30
            )

            output = result.stdout + result.stderr
            status = "success" if result.returncode == 0 else "error"

            # Cleanup
            try: os.remove(full_path)
            except: pass

            return {"status": status, "output": output.strip()}

        except Exception as e:
            return {"status": "error", "output": str(e)}

    def _run_bash(self, code):
        try:
            result = subprocess.run(
                code,
                shell=True,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=30
            )
            output = result.stdout + result.stderr
            status = "success" if result.returncode == 0 else "error"
            return {"status": status, "output": output.strip()}
        except Exception as e:
            return {"status": "error", "output": str(e)}

    def create_file(self, path, content):
        try:
            full_path = self._resolve_path(path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)
            return {"status": "success", "output": f"File created: {path}"}
        except Exception as e:
            return {"status": "error", "output": str(e)}

    def read_file(self, path):
        try:
            full_path = self._resolve_path(path)
            if not os.path.exists(full_path):
                return {"status": "error", "output": "File not found"}
            with open(full_path, 'r') as f:
                content = f.read()
            return {"status": "success", "output": content}
        except Exception as e:
            return {"status": "error", "output": str(e)}

    def list_files(self, path="."):
        try:
            target_dir = self._resolve_path(path)
            file_list = []
            for root, dirs, files in os.walk(target_dir):
                for file in files:
                    rel_path = os.path.relpath(os.path.join(root, file), self.workspace_dir)
                    file_list.append(rel_path)
            return {"status": "success", "output": "\n".join(file_list) or "(empty)"}
        except Exception as e:
            return {"status": "error", "output": str(e)}

class GeminiBrain:
    def __init__(self, api_key, model_name='gemini-1.5-flash'):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.history = []

    def _clean_json(self, text):
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if match: return match.group(1)
        return text.strip()

    def get_plan(self, user_query, mode="accurate", error_context=None):

        mode_prompts = {
            "accurate": "Prioritize correctness. Write robust code with checks. If you write code, ensure it prints the result.",
            "fast": "Be concise. Provide the simplest working solution.",
            "creative": "Think outside the box. Suggest innovative approaches.",
            "debug": "Analyze thoroughly. Add debug prints. Explain the 'why'.",
            "teaching": "Explain every step like a tutor. Add comments to code."
        }

        system_prompt = f"""
ROLE: Expert Python Developer & System Administrator (VSpro Agent v{VERSION})
MODE: {mode.upper()} - {mode_prompts.get(mode, "")}
WORKSPACE: ./workspace/

AVAILABLE TOOLS:
{json.dumps(TOOLS_SCHEMA, indent=2)}

INSTRUCTIONS:
1. Analyze the USER REQUEST.
2. If code execution is needed, plan the steps using 'execute_code'.
3. Always verify your work (e.g., if you create a file, read it back or run it).
4. If an error is provided in CONTEXT, analyze it and fix the code.
5. RETURN ONLY JSON.

FORMAT:
{{
  "thought": "Reasoning...",
  "steps": [
    {{ "action": "tool_name", "params": {{ ... }} }}
  ]
}}
"""
        user_part = f"REQUEST: {user_query}"
        if error_context:
            user_part += f"\n\nPREVIOUS ERROR (Please Fix):\n{error_context}"

        try:
            # We don't use chat history for the *planning* strictly to keep it focused,
            # but we could append it. For now, let's keep it stateless for the plan generation
            # to avoid context bloat, or pass a summary.
            # In v4.0 we pass the last few messages.

            response = self.model.generate_content(system_prompt + "\n" + user_part)
            return json.loads(self._clean_json(response.text))
        except Exception as e:
            return {"thought": f"Error planning: {e}", "steps": []}

    def synthesize(self, user_query, results):
        prompt = f"""
USER: {user_query}
RESULTS: {json.dumps(results, indent=2)}

Task: Write a helpful response summarizing what was done.
If there was output, show it. If files were created, list them.
"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Task completed (could not generate summary)."

    def review_code(self, code):
        prompt = f"""
Review this code for Security, Performance, and Best Practices.
CODE:
{code}

Output format:
SCORE: X/100
ISSUES:
- ...
SUGGESTIONS:
- ...
"""
        return self.model.generate_content(prompt).text

# ==========================================
# MAIN AGENT LOOP
# ==========================================

class Agent:
    def __init__(self):
        self.load_env()
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            print(f"{Colors.FAIL}❌ API Key missing! Run 'python fix_api_key.py' first.{Colors.ENDC}")
            sys.exit(1)

        self.brain = GeminiBrain(api_key)
        self.tools = ToolExecutor(WORKSPACE_DIR)
        self.mode = "accurate"

    def load_env(self):
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        k, v = line.strip().split('=', 1)
                        os.environ[k] = v

    def run(self):
        print(f"{Colors.CYAN}🚀 VSpro Agent v{VERSION} initialized!{Colors.ENDC}")
        print(f"{Colors.BLUE}📂 Workspace: {WORKSPACE_DIR}{Colors.ENDC}")
        print("Type '/help' for commands.")

        while True:
            try:
                user_input = input(f"\n{Colors.GREEN}👤 You ({self.mode}): {Colors.ENDC}").strip()
                if not user_input: continue

                if user_input.startswith('/'):
                    self.handle_command(user_input)
                    continue

                self.process_request(user_input)

            except KeyboardInterrupt:
                print("\n👋 Exiting...")
                break
            except Exception as e:
                print(f"{Colors.FAIL}❌ Critical Error: {e}{Colors.ENDC}")

    def handle_command(self, cmd):
        parts = cmd.split()
        command = parts[0].lower()

        if command == '/mode':
            if len(parts) > 1 and parts[1] in ['accurate', 'fast', 'creative', 'debug', 'teaching']:
                self.mode = parts[1]
                print(f"✅ Mode set to: {self.mode}")
            else:
                print("Usage: /mode [accurate|fast|creative|debug|teaching]")

        elif command == '/project':
            print("🏗️ Project scaffolding is handled by the agent. Describe your project naturally.")
            print("Example: 'Create a FastAPI project named blog_api'")

        elif command == '/review':
            print("Usage: Ask the agent 'Review file mycode.py'")

        elif command in ['/exit', '/quit']:
            sys.exit(0)

        elif command == '/help':
            print("""
COMMANDS:
  /mode [mode]   - Change agent behavior
  /exit          - Quit

MODES:
  accurate (default), fast, creative, debug, teaching
""")

    def process_request(self, user_query):
        print(f"{Colors.BLUE}🧠 Thinking...{Colors.ENDC}")

        # Auto-fix loop
        max_retries = 3 if self.mode == "accurate" else 1
        error_context = None

        for attempt in range(max_retries):
            plan = self.brain.get_plan(user_query, self.mode, error_context)

            if not plan.get('steps'):
                print(f"🤖 {plan.get('thought', 'I am confused.')}")
                return

            print(f"{Colors.CYAN}📋 Plan:{Colors.ENDC} {plan['thought']}")

            execution_results = []
            has_error = False

            for step in plan['steps']:
                action = step['action']
                params = step['params']

                print(f"⚙️ {action}...", end=" ")

                result = None
                if action == 'execute_code':
                    result = self.tools.execute_code(params['language'], params['code'])
                elif action == 'create_file':
                    result = self.tools.create_file(params['path'], params['content'])
                elif action == 'read_file':
                    result = self.tools.read_file(params['path'])
                elif action == 'list_files':
                    result = self.tools.list_files(params.get('path', '.'))
                else:
                    result = {"status": "error", "output": "Unknown tool"}

                if result['status'] == 'error':
                    print(f"{Colors.FAIL}FAILED{Colors.ENDC}")
                    print(f"{Colors.WARNING}⚠️ Error: {result['output']}{Colors.ENDC}")
                    has_error = True
                    execution_results.append({"step": step, "result": result})
                    break # Stop execution on error to fix it
                else:
                    print(f"{Colors.GREEN}OK{Colors.ENDC}")
                    execution_results.append({"step": step, "result": result})

            if has_error and attempt < max_retries - 1:
                print(f"\n{Colors.WARNING}🔧 Auto-fixing error (Attempt {attempt+1}/{max_retries})...{Colors.ENDC}")
                error_context = f"Step '{step['action']}' failed with error: {result['output']}"
                continue

            # If we get here, either success or ran out of retries
            final_response = self.brain.synthesize(user_query, execution_results)
            print(f"\n🤖 {Colors.BOLD}Agent:{Colors.ENDC} {final_response}")
            return

if __name__ == "__main__":
    Agent().run()
