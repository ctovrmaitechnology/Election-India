const fs = require('fs');
const svg = fs.readFileSync('public/maps/india.svg', 'utf8');

const parts = svg.split('<path');
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  const idMatch = part.match(/id="([^"]+)"/);
  if (!idMatch) continue;
  const id = idMatch[1];
  
  const dMatch = part.match(/\bd="([^"]+)"/s);
  if (!dMatch) continue;
  const d = dMatch[1];
  
  // Extract all numbers
  const nums = d.split(/[\s,a-df-z]+/i).map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) continue;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (let k = 0; k < nums.length - 1; k += 2) {
    const x = nums[k];
    const y = nums[k+1];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  console.log(`id: '${id}', w: ${w.toFixed(1)}, h: ${h.toFixed(1)}`);
}
