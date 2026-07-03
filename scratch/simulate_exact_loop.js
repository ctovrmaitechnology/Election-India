const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const STATE_LABEL_NAMES = {
  'ap': 'Andhra Pradesh',
  'ar': 'Arunachal Pradesh',
  'as': 'Assam',
  'br': 'Bihar',
  'ct': 'Chhattisgarh',
  'gj': 'Gujarat',
  'hr': 'Haryana',
  'hp': 'Himachal Pradesh',
  'jk': 'Jammu & Kashmir',
  'jh': 'Jharkhand',
  'ka': 'Karnataka',
  'kl': 'Kerala',
  'mp': 'Madhya Pradesh',
  'mh': 'Maharashtra',
  'mn': 'Manipur',
  'ml': 'Meghalaya',
  'mz': 'Mizoram',
  'nl': 'Nagaland',
  'or': 'Odisha',
  'pb': 'Punjab',
  'rj': 'Rajasthan',
  'sk': 'Sikkim',
  'tn': 'Tamil Nadu',
  'tg': 'Telangana',
  'tr': 'Tripura',
  'up': 'Uttar Pradesh',
  'ut': 'Uttarakhand',
  'wb': 'West Bengal',
  'py': 'Puducherry',
  'ga': 'Goa',
  'an': 'Andaman & Nicobar',
  'ld': 'Lakshadweep',
  'dn': 'DNH & DD',
  'dd': 'DNH & DD'
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

// Match all <path ... id="..." ... />
const pathMatches = [];
const pathRegex = /<path([^>]+)>/g;
let m;
while ((m = pathRegex.exec(svgText)) !== null) {
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  if (idMatch) {
    pathMatches.push(idMatch[1]);
  }
}

pathMatches.forEach(id => {
  console.log(`Processing path: id="${id}"`);
  
  if (id === 'py') {
    console.log('  -> handled separately (py)');
    return;
  }
  
  const name = STATE_LABEL_NAMES[id];
  if (!name) {
    console.log(`  -> name not found!`);
    return;
  }
  
  if (['ch', 'dl', 'dn', 'dd'].includes(id)) {
    console.log(`  -> micro UT skipped`);
    return;
  }
  
  const pos = LABEL_POS[id];
  if (!pos) {
    console.log(`  -> position not found!`);
    return;
  }
  
  console.log(`  -> SUCCESS: Created text node for ${name} at (${pos.x}, ${pos.y})`);
});
