# VSpro Coding Agent

A fully functional, cross-platform coding agent that mimics the capabilities of ChatGPT Code Interpreter. It uses Google Gemini for reasoning and a local tool executor for file and code operations.

## Features

- **Autonomous Planning**: Breaks down complex tasks into steps.
- **Code Execution**: Runs Python and Bash scripts locally.
- **File Management**: Creates, reads, and edits files.
- **History**: Remembers conversation context.
- **Cross-Platform**: Designed to run on Android (Termux), Linux, and Windows.

## Installation

1.  **Prerequisites**: Python 3.x installed.
2.  **Dependencies**:
    ```bash
    pip install google-generativeai
    ```

## Configuration

1.  Create a `.env` file in the `VSpro` directory:
    ```bash
    cp .env.template .env
    ```
2.  Add your Google Gemini API Key:
    ```
    GOOGLE_API_KEY=your_actual_api_key_here
    ```

## Usage

Run the agent from the `VSpro` directory:

```bash
python agent.py
```

### Example

**User**: "Create a python script that calculates the first 10 Fibonacci numbers and saves them to fib.txt"

**Agent**:
1.  Plans to create the script.
2.  Executes the python code.
3.  Writes to `fib.txt`.
4.  Verifies the content.
5.  Confirms success.

## Structure

- `agent.py`: Main entry point.
- `core/`: Core logic (Brain, Tools, Session).
- `configs/`: Configuration files.
