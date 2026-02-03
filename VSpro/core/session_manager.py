import json
import os
import time

class SessionManager:
    """
    Manages chat history and context.
    """
    def __init__(self, session_file='session_history.json'):
        self.session_file = session_file
        self.history = self._load_history()

    def _load_history(self):
        if os.path.exists(self.session_file):
            try:
                with open(self.session_file, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []

    def save_history(self):
        with open(self.session_file, 'w') as f:
            json.dump(self.history, f, indent=2)

    def add_message(self, role, content):
        """
        Role: 'user', 'model', or 'system' (though Gemini uses 'user'/'model')
        """
        message = {
            'role': role,
            'content': content,
            'timestamp': time.time()
        }
        self.history.append(message)
        self.save_history()

    def get_context(self, limit=10):
        """
        Returns the last N messages formatted for context.
        """
        return self.history[-limit:]

    def clear_history(self):
        self.history = []
        if os.path.exists(self.session_file):
            os.remove(self.session_file)
