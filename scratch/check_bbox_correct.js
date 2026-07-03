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
  
  // Parse commands and coordinates
  let cx = 0, cy = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  // Tokenize the path
  const tokens = d.match(/[a-df-z]|[-+]?[0-9]*\.?[0-9]+/gi) || [];
  
  let idx = 0;
  let currentCmd = '';
  
  while (idx < tokens.length) {
    const token = tokens[idx];
    if (/[a-df-z]/i.test(token)) {
      currentCmd = token;
      idx++;
    } else {
      // If no command token, it is an implicit command repeat (usually L or l)
      if (currentCmd === 'M') currentCmd = 'L';
      if (currentCmd === 'm') currentCmd = 'l';
    }
    
    if (idx >= tokens.length && !/[a-df-z]/i.test(token)) break;
    
    // Read command arguments
    const cmdLower = currentCmd.toLowerCase();
    
    const updateBounds = (x, y) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    };
    
    if (cmdLower === 'm') {
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 'm') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'l') {
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 'l') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'h') {
      const dx = parseFloat(tokens[idx++]);
      if (currentCmd === 'h') {
        cx += dx;
      } else {
        cx = dx;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'v') {
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 'v') {
        cy += dy;
      } else {
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'c') {
      const dx1 = parseFloat(tokens[idx++]);
      const dy1 = parseFloat(tokens[idx++]);
      const dx2 = parseFloat(tokens[idx++]);
      const dy2 = parseFloat(tokens[idx++]);
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 'c') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 's') {
      const dx2 = parseFloat(tokens[idx++]);
      const dy2 = parseFloat(tokens[idx++]);
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 's') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'q') {
      const dx1 = parseFloat(tokens[idx++]);
      const dy1 = parseFloat(tokens[idx++]);
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 'q') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 't') {
      const dx = parseFloat(tokens[idx++]);
      const dy = parseFloat(tokens[idx++]);
      if (currentCmd === 't') {
        cx += dx;
        cy += dy;
      } else {
        cx = dx;
        cy = dy;
      }
      updateBounds(cx, cy);
    } else if (cmdLower === 'z') {
      // closed
    }
  }
  
  const w = maxX - minX;
  const h = maxY - minY;
  console.log(`id: '${id}', w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, x: ${minX.toFixed(1)}, y: ${minY.toFixed(1)}`);
}
