
const fs = require('fs');
const content = fs.readFileSync('i:/BoxFox/boxfox-store/app/customize/page.js', 'utf8');
const lines = content.split('\n');
let b = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  const selfClosings = (line.match(/<div[^>]*\/>/g) || []).length;
  const diff = (opens - selfClosings) - closes;
  if (diff !== 0) {
    b += diff;
    console.log(`Line ${i+1}: Balance ${b} (Diff: ${diff})`);
  }
}
