const fs = require('fs');
const data = JSON.parse(fs.readFileSync('i:/BoxFox/boxfox-store/BoxFox_price_analyses-/dashboard/public/data.json', 'utf8'));
const food = data.categories.Food;
const dates = food.Dates;
console.log(JSON.stringify(dates.specs["210*148*40 mm | 8.3*5.8*1.6 inch"], null, 2));
