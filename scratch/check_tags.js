const fs = require('fs');
const content = fs.readFileSync('i:\\BoxFox\\boxfox-store\\app\\customize\\page.js', 'utf8');

function checkTags(code) {
    let stack = [];
    let lines = code.split('\n');
    
    // Simple regex to find JSX tags
    // Matches <Tag, </Tag, and />
    const tagRegex = /<(\/?[a-zA-Z0-9\.]+)|(\/>)/g;

    lines.forEach((lineText, lineIdx) => {
        let match;
        const lineNum = lineIdx + 1;
        
        // Remove comments and strings before matching to avoid false positives
        let cleanLine = lineText
            .replace(/\/\/.*/g, '') // single line comments
            .replace(/\/\*.*?\*\//g, '') // multi line comments (same line)
            .replace(/`.*?`/g, '""') // template literals
            .replace(/".*?"/g, '""') // double quotes
            .replace(/'.*?'/g, "''"); // single quotes

        while ((match = tagRegex.exec(cleanLine)) !== null) {
            const tag = match[1];
            const isSelfClosing = match[2] === '/>';

            if (isSelfClosing) {
                if (stack.length > 0) {
                    // In JSX, a /> closes the most recent open tag
                    // stack.pop(); // Actually, in JSX <Tag /> is one unit.
                }
            } else if (tag.startsWith('/')) {
                const tagName = tag.substring(1);
                if (stack.length === 0) {
                    console.log(`Unmatched closing tag </${tagName}> at line ${lineNum}`);
                } else {
                    const last = stack.pop();
                    if (last.name !== tagName) {
                        console.log(`Mismatch: <${last.name}> (line ${last.line}) with </${tagName}> (line ${lineNum})`);
                    }
                }
            } else {
                // Opening tag
                // Check if it's self-closing in the original text (e.g. <img ... />)
                const restOfTag = cleanLine.substring(match.index);
                const tagEndMatch = restOfTag.match(/^<[a-zA-Z0-9\.]+(?:\s+[^>]*?)?(\/?)>/);
                
                if (tagEndMatch) {
                    const isTagSelfClosing = tagEndMatch[1] === '/';
                    if (!isTagSelfClosing) {
                        stack.push({ name: tag, line: lineNum });
                    }
                    tagRegex.lastIndex = match.index + tagEndMatch[0].length;
                }
            }
        }
    });

    if (stack.length > 0) {
        console.log("Remaining tags:");
        stack.forEach(s => console.log(`<${s.name}> at line ${s.line}`));
    } else {
        console.log("Tags balanced!");
    }
}

checkTags(content);
