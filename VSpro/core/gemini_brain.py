import google.generativeai as genai
import json
import re
import os

class GeminiBrain:
    def __init__(self, api_key, config):
        if not api_key:
            raise ValueError("API Key is required")

        genai.configure(api_key=api_key)
        self.model_name = config.get('model_name', 'gemini-1.5-flash')
        self.config = config
        self.model = genai.GenerativeModel(self.model_name)

    def _clean_json(self, text):
        """
        Extracts JSON from markdown code blocks or raw text.
        """
        # Try to find JSON inside ```json ... ``` or ``` ... ```
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            text = match.group(1)
        return text.strip()

    def create_plan(self, user_query, history_context):
        """
        Generates a plan based on the user query and available tools.
        """
        tools_desc = json.dumps(self.config['tools'], indent=2)
        personality = self.config['agent_personality']

        # Build prompt
        prompt = f"""
{personality}

You have access to the following tools:
{tools_desc}

User Request: {user_query}

Conversation History:
{json.dumps(history_context, indent=2)}

INSTRUCTIONS:
1. Analyze the user request.
2. If the request requires code execution, file creation, or file reading, create a plan.
3. RETURN ONLY A JSON OBJECT with the following structure:
{{
    "thought": "Explanation of your reasoning",
    "steps": [
        {{
            "action": "tool_name",
            "params": {{ "param_name": "value" }}
        }}
    ]
}}
4. If no tools are needed (just a chat response), return a plan with empty steps, or a single "thought" step.
5. IMPORTANT: The "action" must match the 'name' in the tool definitions exactly.
"""
        try:
            response = self.model.generate_content(prompt)
            cleaned_text = self._clean_json(response.text)
            return json.loads(cleaned_text)
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "thought": f"Failed to parse plan from Gemini: {str(e)}",
                "steps": []
            }

    def synthesize_response(self, user_query, plan_results):
        """
        Generates a natural language response based on tool execution results.
        """
        prompt = f"""
User Query: {user_query}

Execution Results:
{json.dumps(plan_results, indent=2)}

INSTRUCTIONS:
1. Summarize what was done based on the results.
2. If there were errors, explain them.
3. If files were created or content generated, mention it.
4. Be helpful and professional.
"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error synthesizing response: {str(e)}"
