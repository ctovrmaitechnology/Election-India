const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const getPathBBox = (d) => {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  const commandRegex = /[a-df-z]/gi;
  const commands = d.match(commandRegex) || [];
  const commandCoords = d.split(commandRegex);
  if (commandCoords[0] === '') commandCoords.shift();

  let curX = 0;
  let curY = 0;

  const updateBBox = (x, y) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const coordsStr = commandCoords[i] || '';
    const numbers = [];
    const numRegex = /[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g;
    let match;
    while ((match = numRegex.exec(coordsStr)) !== null) {
      numbers.push(Number(match[0]));
    }
    
    const isRelative = (cmd === cmd.toLowerCase());
    const upperCmd = cmd.toUpperCase();

    let idx = 0;
    const len = numbers.length;

    if (upperCmd === 'Z') {
      continue;
    }

    while (idx < len) {
      if (upperCmd === 'M' || upperCmd === 'L' || upperCmd === 'T') {
        if (idx + 1 >= len) break;
        const x = numbers[idx];
        const y = numbers[idx + 1];
        if (isRelative) {
          curX += x;
          curY += y;
        } else {
          curX = x;
          curY = y;
        }
        updateBBox(curX, curY);
        idx += 2;
      } else if (upperCmd === 'H') {
        const x = numbers[idx];
        if (isRelative) {
          curX += x;
        } else {
          curX = x;
        }
        updateBBox(curX, curY);
        idx += 1;
      } else if (upperCmd === 'V') {
        const y = numbers[idx];
        if (isRelative) {
          curY += y;
        } else {
          curY = y;
        }
        updateBBox(curX, curY);
        idx += 1;
      } else if (upperCmd === 'C') {
        if (idx + 5 >= len) break;
        const x1 = numbers[idx];
        const y1 = numbers[idx + 1];
        const x2 = numbers[idx + 2];
        const y2 = numbers[idx + 3];
        const x = numbers[idx + 4];
        const y = numbers[idx + 5];

        const absX1 = isRelative ? curX + x1 : x1;
        const absY1 = isRelative ? curY + y1 : y1;
        const absX2 = isRelative ? curX + x2 : x2;
        const absY2 = isRelative ? curY + y2 : y2;
        const absX = isRelative ? curX + x : x;
        const absY = isRelative ? curY + y : y;

        updateBBox(absX1, absY1);
        updateBBox(absX2, absY2);
        updateBBox(absX, absY);

        curX = absX;
        curY = absY;
        idx += 6;
      } else if (upperCmd === 'S' || upperCmd === 'Q') {
        if (idx + 3 >= len) break;
        const x1 = numbers[idx];
        const y1 = numbers[idx + 1];
        const x = numbers[idx + 2];
        const y = numbers[idx + 3];

        const absX1 = isRelative ? curX + x1 : x1;
        const absY1 = isRelative ? curY + y1 : y1;
        const absX = isRelative ? curX + x : x;
        const absY = isRelative ? curY + y : y;

        updateBBox(absX1, absY1);
        updateBBox(absX, absY);

        curX = absX;
        curY = absY;
        idx += 4;
      } else if (upperCmd === 'A') {
        if (idx + 6 >= len) break;
        const x = numbers[idx + 5];
        const y = numbers[idx + 6];

        const absX = isRelative ? curX + x : x;
        const absY = isRelative ? curY + y : y;

        updateBBox(absX, absY);

        curX = absX;
        curY = absY;
        idx += 7;
      } else {
        idx++;
      }
    }
  }

  if (minX === Infinity || minY === Infinity) {
    return null;
  }
  return {
    x: Math.round((minX + maxX) / 2),
    y: Math.round((minY + maxY) / 2)
  };
};

const LABEL_POS = {
  'an': { x: 553, y: 640 },
  'ap': { x: 232, y: 535 },
  'ar': { x: 548, y: 243 },
  'as': { x: 506, y: 272 },
  'br': { x: 368, y: 265 },
  'ct': { x: 298, y: 382 },
  'ga': { x: 131, y: 514 },
  'gj': { x: 100, y: 342 },
  'hp': { x: 207, y: 139 },
  'hr': { x: 182, y: 196 },
  'jh': { x: 368, y: 322 },
  'jk': { x: 183, y: 84  },
  'ka': { x: 170, y: 510 },
  'kl': { x: 169, y: 605 },
  'ld': { x: 97,  y: 614 },
  'mp': { x: 246, y: 306 },
  'mh': { x: 188, y: 412 },
  'mn': { x: 537, y: 306 },
  'ml': { x: 487, y: 285 },
  'mz': { x: 519, y: 340 },
  'nl': { x: 543, y: 262 },
  'or': { x: 354, y: 390 },
  'pb': { x: 158, y: 157 },
  'rj': { x: 132, y: 245 },
  'sk': { x: 428, y: 236 },
  'tn': { x: 206, y: 595 },
  'tg': { x: 228, y: 462 },
  'tr': { x: 509, y: 340 },
  'up': { x: 248, y: 230 },
  'ut': { x: 237, y: 162 },
  'wb': { x: 405, y: 340 },
};

// Find all paths and extract their d attribute
const pathRegex = /<path([\s\S]*?)\/>/g;
let m;
console.log('Comparing LABEL_POS vs Robust Math Center:');
console.log('ID\tLABEL_POS\tMATH_CENTER\tOFFSET');
while ((m = pathRegex.exec(svgText)) !== null) {
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  const dMatch = attrs.match(/\bd="([\s\S]*?)"/);
  if (idMatch && dMatch) {
    const id = idMatch[1];
    if (id === 'py') continue;
    if (['ch', 'dl', 'dn', 'dd'].includes(id)) continue;
    
    const bbox = getPathBBox(dMatch[1]);
    const pos = LABEL_POS[id];
    if (pos && bbox) {
      const dx = Math.abs(pos.x - bbox.x);
      const dy = Math.abs(pos.y - bbox.y);
      const offset = Math.round(Math.sqrt(dx*dx + dy*dy));
      console.log(`${id}\t(${pos.x}, ${pos.y})\t(${bbox.x}, ${bbox.y})\t${offset}px`);
    } else if (!pos) {
      console.log(`${id}\tMISSING from LABEL_POS`);
    }
  }
}
