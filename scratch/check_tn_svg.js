const fs = require('fs');
const content = fs.readFileSync('public/maps/tamilnadu.svg', 'utf-8');
const idRegex = /id="([^"]+)"/g;
let match;
const ids = [];
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}
console.log('Tamil Nadu SVG IDs:', ids);
const jsonDistricts = JSON.parse(fs.readFileSync('public/data/tamilnadu_districts.json', 'utf-8')).map(d => d.id);
console.log('JSON District IDs:', jsonDistricts);
console.log('In JSON but not in SVG:', jsonDistricts.filter(id => !ids.includes(id)));
console.log('In SVG but not in JSON:', ids.filter(id => !jsonDistricts.includes(id)));
