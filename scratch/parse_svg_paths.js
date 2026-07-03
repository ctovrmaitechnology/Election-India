const fs = require('fs');

const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const pathRegex = /<path[^>]+id="([^"]+)"[^>]*>/g;
let match;
while ((match = pathRegex.exec(svg)) !== null) {
  const pathTag = match[0];
  const id = match[1];
  const dMatch = pathTag.match(/d="([^"]+)"/);
  const d = dMatch ? dMatch[1] : '';
  console.log(`Path ID: ${id}, tag length: ${pathTag.length}, d attribute length: ${d.length}`);
}
