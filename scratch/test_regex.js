const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const pathRegex = /<path([\s\S]*?)\/>/g;
let m;
let count = 0;
while ((m = pathRegex.exec(svgText)) !== null) {
  count++;
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  const dMatch = attrs.match(/d="([\s\S]*?)"/);
  console.log(`Match ${count}: id=${idMatch ? idMatch[1] : 'null'}, has_d=${!!dMatch}`);
}
