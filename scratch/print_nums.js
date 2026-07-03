const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const parts = svg.split('<path');
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  if (part.includes('id="ch"')) {
    const dMatch = part.match(/d="([^"]+)"/s);
    const d = dMatch[1];
    const splitArr = d.split(/[\s,a-df-z]+/i);
    const nums = splitArr.map(Number);
    console.log('splitArr:', splitArr.slice(0, 20));
    console.log('nums:', nums.slice(0, 20));
    console.log('filtered:', nums.filter(n => !isNaN(n)).slice(0, 20));
  }
}
