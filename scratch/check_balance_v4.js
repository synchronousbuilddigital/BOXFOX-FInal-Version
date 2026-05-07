
const fs = require('fs');
const content = fs.readFileSync('i:/BoxFox/boxfox-store/app/customize/page.js', 'utf8');
const lines = content.split('\n');
let b = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  // Ignore self-closing divs for this check
  const selfClosings = (line.match(/<div[^>]*\/>/g) || []).length;
  b += (opens - selfClosings) - closes;
  if (b < 0) {
    console.log(`NEGATIVE BALANCE at line ${i+1}: ${b}`);
    // b = 0; // reset to find next
  }
}
console.log(`Final Balance (ignoring self-closing): ${b}`);
