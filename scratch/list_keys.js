const fs = require('fs');
const data = JSON.parse(fs.readFileSync('i:/BoxFox/boxfox-store/BoxFox_price_analyses-/dashboard/public/data.json', 'utf8'));
console.log(Object.keys(data));
