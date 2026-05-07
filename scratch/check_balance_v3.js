
const fs = require('fs');
const content = fs.readFileSync('i:/BoxFox/boxfox-store/app/customize/page.js', 'utf8');
const lines = content.split('\n');
let balance = 0;
let lastZero = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens - closes;
  if (balance === 0) {
    lastZero = i + 1;
  }
  if (i > 2400) {
     // console.log(`Line ${i+1}: Balance ${balance}`);
  }
}
console.log(`Last Zero Balance Line: ${lastZero}`);
console.log(`Final Balance: ${balance}`);
