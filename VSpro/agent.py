import os
import json
import sys

# Add current directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.gemini_brain import GeminiBrain
from core.tool_executor import ClaudeToolExecutor
from core.session_manager import SessionManager

def load_env_file():
    """
    Manually load .env file to avoid external dependencies.
    """
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip()
                    if (value.startswith('"') and value.endswith('"')) or \
                       (value.startswith("'") and value.endswith("'")):
                        value = value[1:-1]
                    os.environ[key.strip()] = value

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'configs', 'agent_config.json')
    with open(config_path, 'r') as f:
        return json.load(f)

def main():
    # Load environment variables
    load_env_file()
    api_key = os.getenv('GOOGLE_API_KEY')

    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in environment variables.")
        print("Please create a .env file with GOOGLE_API_KEY=your_key")
        return

    # Initialize components
    try:
        config = load_config()
        brain = GeminiBrain(api_key, config)
        tools = ClaudeToolExecutor()
        session = SessionManager()
    except Exception as e:
        print(f"❌ Initialization Error: {e}")
        return

    print("🚀 VSpro Coding Agent Initialized (Powered by Gemini)")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            user_input = input("\n👤 You: ")
            if user_input.lower() in ['exit', 'quit']:
                print("Goodbye!")
                break

            if not user_input.strip():
                continue

            # 1. Add user message to history
            session.add_message('user', user_input)

            # 2. Get Plan from Brain
            print("🧠 Thinking...")
            plan = brain.create_plan(user_input, session.get_context())

            if not plan.get('steps'):
                response = plan.get('thought', "I'm not sure what to do.")
                print(f"🤖 Agent: {response}")
                session.add_message('model', response)
                continue

            print(f"📋 Plan: {plan.get('thought')}")

            # 3. Execute Tools
            execution_results = []
            for step in plan['steps']:
                action = step.get('action')
                params = step.get('params', {})

                print(f"⚙️ Executing: {action}...")

                result = None
                if action == 'execute_code':
                    code = params.get('code')
                    if params.get('language') == 'bash':
                        result = tools.run_bash(code)
                    else:
                        result = tools.run_python(code)

                elif action == 'create_file':
                    result = tools.create_file(params.get('path'), params.get('content'))

                elif action == 'read_file':
                    result = tools.read_file(params.get('path'))

                elif action == 'edit_file':
                    result = tools.edit_file(params.get('path'), params.get('old_str'), params.get('new_str'))

                elif action == 'present_file':
                    result = tools.present_file(params.get('path'))

                else:
                    result = {'status': 'error', 'error': f"Unknown tool: {action}"}

                execution_results.append({
                    "step": step,
                    "result": result
                })

            # 4. Synthesize Response
            final_response = brain.synthesize_response(user_input, execution_results)
            print(f"\n🤖 Agent: {final_response}")

            # 5. Save to history
            session.add_message('model', final_response)

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected Error: {e}")

if __name__ == "__main__":
    main()
