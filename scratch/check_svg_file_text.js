const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

// Check if there are any <g> tags or other containers
const gMatches = [];
const gRegex = /<g([^>]+)>/g;
let m;
while ((m = gRegex.exec(svgText)) !== null) {
  gMatches.push(m[1]);
}

console.log('Groups found:', gMatches.length);
gMatches.forEach((g, idx) => {
  console.log(`Group ${idx + 1}: ${g.trim()}`);
});

// Check if any paths are nested inside groups
// Let's search for closing </g> tags
const closeGMatches = svgText.match(/<\/g>/g) || [];
console.log('Closing groups found:', closeGMatches.length);
