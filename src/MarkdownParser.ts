const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;

let currentContainer: HTMLElement | null = null; 
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}

// Enum to track the parser state
enum MarkdownState {
    Normal,
    InlineCode,
    CodeBlock,
    PotentialInlineCode,      // For handling single backtick
    PotentialCodeBlockStart,  // For handling double backtick
    PotentialCodeBlockEnd     // For handling potential end of code block
}

// Variables to track state
let currentState: MarkdownState = MarkdownState.Normal;
let currentSpan: HTMLElement | null = null;
let backtickCount: number = 0;
let buffer: string = '';

// Helper to create a new span with appropriate styling based on state
function createStateSpan(state: MarkdownState): HTMLElement {
    const span = document.createElement('span');
    
    switch (state) {
        case MarkdownState.InlineCode:
            span.style.backgroundColor = '#f0f0f0';
            span.style.fontFamily = 'monospace';
            span.style.padding = '2px 4px';
            span.style.borderRadius = '3px';
            break;
        case MarkdownState.CodeBlock:
            span.style.display = 'block';
            span.style.backgroundColor = '#f5f5f5';
            span.style.fontFamily = 'monospace';
            span.style.padding = '10px';
            span.style.margin = '10px 0';
            span.style.borderRadius = '5px';
            span.style.whiteSpace = 'pre';
            break;
        default:
            break;
    }
    
    return span;
}

/* 
Please edit the addToken method to support at least inline codeblocks and codeblocks. Feel free to add any other methods you need.
This starter code does token streaming with no styling right now. Your job is to write the parsing logic to make the styling work.

Note: don't be afraid of using globals for state. For this challenge, speed is preferred over cleanliness.
 */
function addToken(token: string) {
    if (!currentContainer) return;

    // Process each character in the token to handle state transitions
    for (let i = 0; i < token.length; i++) {
        const char = token[i];
        
        // Handle backticks which control code formatting
        if (char === '`') {
            switch (currentState) {
                case MarkdownState.Normal:
                    // Start potential inline code
                    backtickCount = 1;
                    currentState = MarkdownState.PotentialInlineCode;
                    
                    // Output any buffered text in normal state
                    if (buffer) {
                        const span = document.createElement('span');
                        span.innerText = buffer;
                        currentContainer.appendChild(span);
                        buffer = '';
                    }
                    break;
                    
                case MarkdownState.PotentialInlineCode:
                    backtickCount++;
                    if (backtickCount === 3) {
                        // We have three backticks, start a code block
                        currentState = MarkdownState.CodeBlock;
                        currentSpan = createStateSpan(MarkdownState.CodeBlock);
                        buffer = '';  // Clear buffer, don't include backticks in output
                    } else if (backtickCount === 2) {
                        // Two backticks, might be start of code block
                        currentState = MarkdownState.PotentialCodeBlockStart;
                    }
                    break;
                    
                case MarkdownState.PotentialCodeBlockStart:
                    // If we get a third backtick, it's a code block
                    currentState = MarkdownState.CodeBlock;
                    currentSpan = createStateSpan(MarkdownState.CodeBlock);
                    buffer = '';  // Clear buffer, don't include backticks in output
                    break;
                    
                case MarkdownState.InlineCode:
                    // End of inline code
                    currentState = MarkdownState.Normal;
                    
                    // Append the current span with buffer content
                    if (currentSpan) {
                        currentSpan.innerText = buffer;
                        currentContainer.appendChild(currentSpan);
                        currentSpan = null;
                        buffer = '';
                    }
                    break;
                    
                case MarkdownState.CodeBlock:
                    // Potential end of code block
                    backtickCount = 1;
                    currentState = MarkdownState.PotentialCodeBlockEnd;
                    break;
                    
                case MarkdownState.PotentialCodeBlockEnd:
                    backtickCount++;
                    if (backtickCount === 3) {
                        // We have three backticks, end code block
                        if (currentSpan) {
                            currentSpan.innerText = buffer;
                            currentContainer.appendChild(currentSpan);
                            currentSpan = null;
                        }
                        buffer = '';
                        currentState = MarkdownState.Normal;
                    }
                    break;
            }
        } else {
            // Not a backtick, handle based on current state
            switch (currentState) {
                case MarkdownState.PotentialInlineCode:
                    // Was a single backtick followed by non-backtick, so it's inline code
                    currentState = MarkdownState.InlineCode;
                    currentSpan = createStateSpan(MarkdownState.InlineCode);
                    buffer += char;
                    break;
                    
                case MarkdownState.PotentialCodeBlockStart:
                    // Was less than three backticks, convert to inline code
                    currentState = MarkdownState.InlineCode;
                    currentSpan = createStateSpan(MarkdownState.InlineCode);
                    buffer = '`'.repeat(backtickCount) + char;
                    break;
                    
                case MarkdownState.PotentialCodeBlockEnd:
                    // Not enough backticks for block end, add them to buffer
                    buffer += '`'.repeat(backtickCount) + char;
                    backtickCount = 0;
                    currentState = MarkdownState.CodeBlock;
                    break;
                    
                default:
                    // In a normal state or code state, just add to buffer
                    buffer += char;
                    
                    // If we're in a normal state and don't have a current span,
                    // create one for normal text
                    if (currentState === MarkdownState.Normal && !currentSpan) {
                        currentSpan = document.createElement('span');
                    }
                    break;
            }
        }
    }
    
    // After processing the token, update the DOM with any buffered content
    // but only if we're in a consistent state (not in a potential state)
    if (currentState === MarkdownState.Normal || 
        currentState === MarkdownState.InlineCode || 
        currentState === MarkdownState.CodeBlock) {
        
        // If buffer is non-empty and we have a current span, append it
        if (buffer && currentSpan) {
            currentSpan.innerText += buffer;
            
            // Only append to container if it's not already there
            if (!currentSpan.parentNode) {
                currentContainer.appendChild(currentSpan);
            }
            
            // Clear buffer but keep span for future additions if in a code state
            buffer = '';
            if (currentState === MarkdownState.Normal) {
                currentSpan = null;
            }
        }
    }
}