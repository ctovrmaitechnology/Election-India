const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const idRegex = /id="([^"]+)"/g;
let match;
const counts = {};
while ((match = idRegex.exec(svgText)) !== null) {
  const id = match[1];
  counts[id] = (counts[id] || 0) + 1;
}

console.log('Path ID occurrences:');
console.log(counts);
