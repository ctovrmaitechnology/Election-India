const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const parts = svg.split('<path');
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  if (part.includes('id="ch"')) {
    const dMatch = part.match(/d="([^"]+)"/s);
    console.log('dMatch is null:', !dMatch);
    if (dMatch) {
      console.log('d length:', dMatch[1].length);
      console.log('d content:', JSON.stringify(dMatch[1]));
    }
  }
}
