
const fs = require('fs');
const content = fs.readFileSync('i:/BoxFox/boxfox-store/app/customize/page.js', 'utf8');
const lines = content.split('\n');
let balance = 0;
lines.forEach((line, i) => {
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens - closes;
  if (balance !== 0 && i < 2400) {
     // Optional: log if you want to find where it starts
  }
});
console.log(`Final Balance: ${balance}`);

// Find where balance first stays above 0
balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  balance += opens - closes;
  if (balance < 0) {
    console.log(`Line ${i+1} has too many closing divs! Balance: ${balance}`);
    break;
  }
}
