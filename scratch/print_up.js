const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const parts = svg.split('<path');
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  if (part.includes('id="up"')) {
    const dMatch = part.match(/\bd="([^"]+)"/s);
    if (dMatch) {
      console.log('UP d attribute:', dMatch[1].substring(0, 300));
    }
  }
}
