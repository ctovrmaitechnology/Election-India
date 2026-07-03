const fs = require('fs');
const path = require('path');

const STATE_FILES = {
  'IN-TN': { svg: 'tamilnadu.svg', json: 'tamilnadu_districts.json' },
  'IN-KL': { svg: 'kerala.svg', json: 'kerala_districts.json' },
  'IN-TG': { svg: 'telangana.svg', json: 'telangana_districts.json' },
  'IN-AP': { svg: 'andhrapradesh.svg', json: 'andhrapradesh_districts.json' },
  'IN-PY': { svg: 'puducherry.svg', json: 'puducherry_districts.json' }
};

Object.entries(STATE_FILES).forEach(([stateId, config]) => {
  console.log(`\n=================== Checking ${stateId} ===================`);
  const svgPath = path.join(__dirname, '..', 'public', 'maps', config.svg);
  const jsonPath = path.join(__dirname, '..', 'public', 'data', config.json);
  
  if (!fs.existsSync(svgPath)) {
    console.log(`ERROR: SVG file not found: ${svgPath}`);
    return;
  }
  if (!fs.existsSync(jsonPath)) {
    console.log(`ERROR: JSON file not found: ${jsonPath}`);
    return;
  }
  
  const svgText = fs.readFileSync(svgPath, 'utf8');
  const districts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const jsonIds = districts.map(d => d.id);
  const jsonNames = districts.map(d => d.name);
  
  // Extract path IDs from SVG
  const idRegex = /<path[^>]+id="([^"]+)"/g;
  let match;
  const svgIds = [];
  while ((match = idRegex.exec(svgText)) !== null) {
    svgIds.push(match[1]);
  }
  
  console.log(`SVG IDs count: ${svgIds.length}`);
  console.log(`JSON District IDs count: ${jsonIds.length}`);
  
  // Find which JSON IDs do not have corresponding SVG IDs
  const missingInSvg = jsonIds.filter(id => !svgIds.includes(id));
  if (missingInSvg.length > 0) {
    console.log(`WARNING: District IDs in JSON not found as path IDs in SVG:`, missingInSvg);
  } else {
    console.log(`SUCCESS: All district IDs in JSON exist as path IDs in SVG.`);
  }
  
  // Find which SVG IDs do not have corresponding JSON IDs
  const extraInSvg = svgIds.filter(id => !jsonIds.includes(id));
  if (extraInSvg.length > 0) {
    console.log(`INFO: Path IDs in SVG not found in JSON (could be decorative or mismatched):`, extraInSvg);
  }
});
