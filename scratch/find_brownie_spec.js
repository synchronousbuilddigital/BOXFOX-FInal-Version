const fs = require('fs');
const data = JSON.parse(fs.readFileSync('i:/BoxFox/boxfox-store/BoxFox_price_analyses-/dashboard/public/data.json', 'utf8'));
const bakery = data.categories.Bakery;
const brownie1 = bakery["Brownie 1"];
console.log(JSON.stringify(brownie1.specs["89*89*38 mm | 3.5*3.5*1.5 inch"], null, 2));
