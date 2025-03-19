# Streaming Markdown Parser

A lightweight, real-time Markdown parser that processes text in small chunks (tokens) and renders it with proper formatting as it arrives. This parser is specifically designed to handle the streaming nature of text coming from sources like AI models or real-time APIs.

##  Overview

This project simulates and handles the scenario where text doesn't arrive all at once but streams in small, sometimes awkwardly split chunks. It demonstrates how to parse and render Markdown formatting correctly even when syntax markers (like backticks) might be split across multiple tokens.

### Key Features

- **Real-time processing**: Renders markdown as it arrives in small chunks
- **Streaming-friendly**: Handles text tokens of any size without breaking the formatting
- **Code formatting**: Supports both inline code (single backticks) and code blocks (triple backticks)
- **State machine architecture**: Robustly tracks parsing state across token boundaries

##  Technical Implementation

### State Machine

The parser uses a state machine approach to track what kind of text it's currently processing:

- **Normal**: Regular text without special formatting
- **InlineCode**: Text within single backticks (`)
- **CodeBlock**: Text within triple backticks (```)
- **PotentialInlineCode**: When a single backtick has been detected
- **PotentialCodeBlockStart**: When multiple backticks that might start a code block are detected
- **PotentialCodeBlockEnd**: When backticks that might end a code block are detected

This state tracking allows the parser to maintain context even when tokens are split in the middle of formatting markers.

### Styling

The parser applies appropriate styling to different types of content:

- **Inline Code**: Gray background, monospace font, and rounded corners
- **Code Blocks**: Block display, gray background, monospace font, and preserved whitespace

## How It Works

1. A sample Markdown document is split into random-sized tokens (2-20 characters)
2. These tokens are processed one by one at regular intervals (every 20ms)
3. Each token is processed character by character to detect Markdown syntax
4. As tokens are processed, HTML elements with appropriate styling are created and added to the page
5. The state machine ensures that formatting is preserved even across token boundaries

##  Installation

```bash
# Clone the repository
git clone https://github.com/Ranvirdeshmukh/Markdown-parser.git

# Navigate to the project directory
cd Markdown-parser

# Install dependencies
npm install
```

##  Usage

```bash
# Build the project
npm run build

# For development with automatic recompilation
npm run dev
```

After building, open `dist/index.html` in your browser and click the "STREAM" button to see the Markdown parser in action.

##  Project Structure

- **src/MarkdownParser.ts**: The main parser implementation with the state machine
- **public/index.html**: The HTML page that displays the parsed Markdown
- **package.json**: Project configuration and dependencies

##  Code Explanation

### The Main Components

1. **runStream()**: 
   - Splits the markdown into random-sized tokens
   - Sets up an interval to process each token

2. **addToken()**: 
   - The core parsing function
   - Processes each character in the token
   - Handles state transitions when encountering special characters
   - Creates and appends HTML elements with appropriate styling

3. **createStateSpan()**: 
   - Creates HTML elements with styling based on the current state

### The Parsing Logic

The parser processes each character in the incoming tokens, keeping track of special characters like backticks that indicate code formatting. It uses a state machine to handle transitions between different types of content.

For example, when encountering a backtick:
- In normal text, it might be the start of inline code
- If already processing inline code, it might be the end
- Multiple backticks together might indicate the start or end of a code block

The parser ensures that even if these markers are split across multiple tokens, the formatting is preserved correctly.

##  Potential Improvements

- Support for additional Markdown features like headings, lists, and emphasis
- Handling for nested formatting
- Error recovery for malformed Markdown
- Performance optimizations for handling larger documents

## 📄 License

ISC License

---

This implementation demonstrates a solution to the challenge of parsing streaming text while maintaining proper formatting across token boundaries.
