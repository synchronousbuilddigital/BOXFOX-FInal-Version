
const fs = require('fs');
const content = fs.readFileSync('i:/BoxFox/boxfox-store/app/customize/page.js', 'utf8');
const lines = content.split('\n');

function checkRange(start, end) {
  let b = 0;
  for (let i = start - 1; i < end; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    b += opens - closes;
  }
  return b;
}

console.log(`Step 1 (1579-1770): ${checkRange(1579, 1770)}`);
console.log(`Step 2 (1773-1984): ${checkRange(1773, 1984)}`);
console.log(`Step 3 (1986-2044): ${checkRange(1986, 2044)}`);
console.log(`Step 4 (2047-2241): ${checkRange(2047, 2241)}`);
console.log(`Left Col (1106-1573): ${checkRange(1106, 1573)}`);
console.log(`Right Col (1576-2342): ${checkRange(1576, 2342)}`);
console.log(`Main (1104-2343): ${checkRange(1104, 2343)}`);


