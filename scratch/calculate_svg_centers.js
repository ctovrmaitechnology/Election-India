const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

// A simple parser for SVG path d attributes to extract all X and Y coordinates
function getPathBBox(d) {
  // Replace commands with spaces and split by numbers/commas/spaces
  // Path commands: M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z
  const tokens = d.replace(/([a-zA-Z])/g, ' $1 ').split(/[\s,]+/);
  
  let currentX = 0;
  let currentY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i].trim();
    if (!token) {
      i++;
      continue;
    }
    
    // Check if token is a command
    if (/^[a-zA-Z]$/.test(token)) {
      const cmd = token;
      i++;
      
      // Parse coordinates based on command
      if (cmd === 'M' || cmd === 'L') {
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX = x;
          currentY = y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'm' || cmd === 'l') {
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX += x;
          currentY += y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'H') {
        const x = parseFloat(tokens[i++]);
        if (!isNaN(x)) {
          currentX = x;
          minX = Math.min(minX, currentX);
          maxX = Math.max(maxX, currentX);
        }
      } else if (cmd === 'h') {
        const x = parseFloat(tokens[i++]);
        if (!isNaN(x)) {
          currentX += x;
          minX = Math.min(minX, currentX);
          maxX = Math.max(maxX, currentX);
        }
      } else if (cmd === 'V') {
        const y = parseFloat(tokens[i++]);
        if (!isNaN(y)) {
          currentY = y;
          minY = Math.min(minY, currentY);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'v') {
        const y = parseFloat(tokens[i++]);
        if (!isNaN(y)) {
          currentY += y;
          minY = Math.min(minY, currentY);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'C') {
        // Cubic bezier: x1 y1, x2 y2, x y
        const x1 = parseFloat(tokens[i++]);
        const y1 = parseFloat(tokens[i++]);
        const x2 = parseFloat(tokens[i++]);
        const y2 = parseFloat(tokens[i++]);
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX = x;
          currentY = y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'c') {
        const x1 = parseFloat(tokens[i++]);
        const y1 = parseFloat(tokens[i++]);
        const x2 = parseFloat(tokens[i++]);
        const y2 = parseFloat(tokens[i++]);
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX += x;
          currentY += y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 'S') {
        const x2 = parseFloat(tokens[i++]);
        const y2 = parseFloat(tokens[i++]);
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX = x;
          currentY = y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      } else if (cmd === 's') {
        const x2 = parseFloat(tokens[i++]);
        const y2 = parseFloat(tokens[i++]);
        const x = parseFloat(tokens[i++]);
        const y = parseFloat(tokens[i++]);
        if (!isNaN(x) && !isNaN(y)) {
          currentX += x;
          currentY += y;
          minX = Math.min(minX, currentX);
          minY = Math.min(minY, currentY);
          maxX = Math.max(maxX, currentX);
          maxY = Math.max(maxY, currentY);
        }
      }
    } else {
      // It's a number, which means it continues the last command (usually relative or absolute line/curve)
      // For simplicity, let's treat it as a relative/absolute movement depending on previous command context,
      // or just parse pairs of numbers as coordinate points.
      const val1 = parseFloat(token);
      const val2 = parseFloat(tokens[i++]);
      if (!isNaN(val1) && !isNaN(val2)) {
        // If they are valid numbers, let's assume they represent a coordinate point.
        // We can check if they are absolute or relative by checking the last command,
        // but for bounding box estimation, we can just treat them as coordinate values.
        // Let's assume absolute for estimation:
        minX = Math.min(minX, val1);
        minY = Math.min(minY, val2);
        maxX = Math.max(maxX, val1);
        maxY = Math.max(maxY, val2);
      }
    }
  }
  
  return {
    minX, minY, maxX, maxY,
    centerX: Math.round((minX + maxX) / 2),
    centerY: Math.round((minY + maxY) / 2)
  };
}

// Find all paths and extract their d attribute
const pathRegex = /<path([^>]+)>/g;
let m;
const results = {};
while ((m = pathRegex.exec(svgText)) !== null) {
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  const dMatch = attrs.match(/d="([^"]+)"/);
  if (idMatch && dMatch) {
    const id = idMatch[1];
    const bbox = getPathBBox(dMatch[1]);
    results[id] = bbox;
  }
}

console.log('Calculated Bounding Box Centers for SVG paths:');
console.log(JSON.stringify(results, null, 2));
