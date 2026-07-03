const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'maps', 'india.svg');
const content = fs.readFileSync(svgPath, 'utf8');

const pathRegex = /<path[^>]*id="([^"]+)"[^>]*aria-label="([^"]+)"/g;
let match;
console.log('--- Path IDs and Labels in india.svg ---');
while ((match = pathRegex.exec(content)) !== null) {
  console.log(`id: "${match[1]}", label: "${match[2]}"`);
}

const pathRegex2 = /<path[^>]*aria-label="([^"]+)"[^>]*id="([^"]+)"/g;
while ((match = pathRegex2.exec(content)) !== null) {
  console.log(`id: "${match[2]}", label: "${match[1]}"`);
}

// Also check all ids
const idRegex = /id="([^"]+)"/g;
const ids = [];
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}
console.log('All IDs found:', ids.join(', '));
