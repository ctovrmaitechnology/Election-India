const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'newStatesMockData.js');
const content = fs.readFileSync(filePath, 'utf8');

const keysMatch = content.match(/export const newStatesConstituencyData = \{([\s\S]+?)\};/);
if (keysMatch) {
  const innerText = keysMatch[1];
  const lines = innerText.split('\n');
  const keys = [];
  lines.forEach(line => {
    // Top-level key has exactly 2 spaces indent, followed by "key": [
    const m = line.match(/^  "([^"]+)"\s*:\s*\[/);
    if (m) keys.push(m[1]);
  });
  console.log('Total top-level district keys:', keys.length);
  console.log('Sample district keys:', keys.slice(0, 50));
} else {
  console.log('Could not find newStatesConstituencyData!');
}
