import subprocess
import os
import sys
import tempfile

class ClaudeToolExecutor:
    """
    Executes tools locally, mimicking a Code Interpreter environment.
    """

    def __init__(self):
        self.cwd = os.getcwd()

    def run_python(self, code: str) -> dict:
        """
        Executes Python code.
        Strategy: Write to a temporary file and execute it to handle multi-line strings/indentation correctly.
        """
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp:
                tmp.write(code)
                tmp_path = tmp.name

            # Execute the file
            # We use the same python interpreter as the agent
            cmd = [sys.executable, tmp_path]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.cwd)

            # Cleanup
            os.remove(tmp_path)

            return {
                'status': 'success' if result.returncode == 0 else 'error',
                'stdout': result.stdout,
                'stderr': result.stderr,
                'exit_code': result.returncode
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    def run_bash(self, command: str) -> dict:
        """
        Executes a bash command.
        """
        try:
            # shell=True is required for piping, etc.
            result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=self.cwd)
            return {
                'status': 'success' if result.returncode == 0 else 'error',
                'stdout': result.stdout,
                'stderr': result.stderr,
                'exit_code': result.returncode
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    def create_file(self, path: str, content: str) -> dict:
        """
        Creates a file with the given content.
        """
        try:
            full_path = os.path.abspath(path)
            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            return {'status': 'success', 'path': full_path, 'message': 'File created successfully.'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def read_file(self, path: str) -> dict:
        """
        Reads a file.
        """
        try:
            if not os.path.exists(path):
                return {'status': 'error', 'error': f"File not found: {path}"}

            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {'status': 'success', 'content': content}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def edit_file(self, path: str, old_str: str, new_str: str) -> dict:
        """
        Replaces text in a file.
        """
        try:
            read_result = self.read_file(path)
            if read_result['status'] == 'error':
                return read_result

            content = read_result['content']
            if old_str not in content:
                return {'status': 'error', 'error': 'old_str not found in file content.'}

            new_content = content.replace(old_str, new_str)

            return self.create_file(path, new_content)
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def present_file(self, path: str) -> dict:
        """
        Returns the absolute path to the file.
        """
        try:
            if not os.path.exists(path):
                return {'status': 'error', 'error': f"File not found: {path}"}
            return {'status': 'success', 'path': os.path.abspath(path)}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
