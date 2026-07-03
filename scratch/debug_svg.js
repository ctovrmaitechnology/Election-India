const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const parts = svg.split('<path');
console.log('Parts count:', parts.length);
for (let i = 1; i < Math.min(parts.length, 5); i++) {
  console.log(`Part ${i}:`, parts[i].substring(0, 200).replace(/\s+/g, ' '));
}
