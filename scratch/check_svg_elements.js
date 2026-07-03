const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const tagRegex = /<([a-zA-Z0-9:-]+)/g;
let match;
const tags = {};
while ((match = tagRegex.exec(svgText)) !== null) {
  const tag = match[1];
  tags[tag] = (tags[tag] || 0) + 1;
}

console.log('SVG Element tag counts:');
console.log(tags);
