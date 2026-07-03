const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const pathRegex = /<path[^>]+id="([^"]+)"/g;
let match;
const ids = [];
while ((match = pathRegex.exec(svg)) !== null) {
  ids.push(match[1]);
}
console.log('Path IDs in india.svg:', ids);
