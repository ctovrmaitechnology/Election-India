const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

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
  'ml': { x: 487, y: 285 },
  'mn': { x: 537, y: 306 },
  'mp': { x: 246, y: 306 },
  'mh': { x: 188, y: 412 },
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
  'py': null,
};

const idRegex = /id="([^"]+)"/g;
let match;
const svgIds = [];
while ((match = idRegex.exec(svgText)) !== null) {
  svgIds.push(match[1]);
}

console.log('Comparing SVG IDs with LABEL_POS keys:');
svgIds.forEach(id => {
  if (id === 'py') return;
  if (['ch', 'dl', 'dn', 'dd'].includes(id)) return;
  
  const pos = LABEL_POS[id];
  if (!pos) {
    console.log(`WARNING: ID "${id}" in SVG is missing from LABEL_POS!`);
  } else {
    console.log(`ID "${id}" matches coordinate: (${pos.x}, ${pos.y})`);
  }
});
