const fs = require('fs');
const content = fs.readFileSync('i:\\BoxFox\\boxfox-store\\app\\customize\\page.js', 'utf8');

function checkBalance(code) {
    let stack = [];
    let line = 1;
    let col = 1;
    let inString = null;
    let inComment = null;

    for (let i = 0; i < code.length; i++) {
        let char = code[i];
        
        if (char === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }

        if (inComment) {
            if (inComment === '//' && char === '\n') inComment = null;
            if (inComment === '/*' && char === '*' && code[i+1] === '/') {
                inComment = null;
                i++;
            }
            continue;
        }

        if (inString) {
            if (char === inString && code[i-1] !== '\\') inString = null;
            continue;
        }

        if (char === '/' && code[i+1] === '/') { inComment = '//'; i++; continue; }
        if (char === '/' && code[i+1] === '*') { inComment = '/*'; i++; continue; }
        if (char === "'" || char === '"' || char === '`') { inString = char; continue; }

        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line, col });
        } else if (char === '}' || char === ')' || char === ']') {
            if (stack.length === 0) {
                console.log(`Unmatched ${char} at line ${line}, col ${col}`);
                continue;
            }
            let last = stack.pop();
            if ((char === '}' && last.char !== '{') ||
                (char === ')' && last.char !== '(') ||
                (char === ']' && last.char !== '[')) {
                console.log(`Mismatch: ${last.char} (line ${last.line}) with ${char} (line ${line}, col ${col})`);
                // Put back the last one to try to recover? No, just keep going to see more errors
            }
        }
    }

    if (stack.length > 0) {
        console.log("Remaining stack:");
        stack.forEach(s => console.log(`${s.char} at line ${s.line}`));
    } else {
        console.log("Balanced!");
    }
}

checkBalance(content);
