const fs = require('fs');
const path = require('path');

const states = ['tamilnadu', 'kerala', 'telangana', 'andhrapradesh'];
const mapsDir = path.join(__dirname, '../public/maps');
const dataDir = path.join(__dirname, '../public/data');

states.forEach(state => {
  const svgPath = path.join(mapsDir, state + '.svg');
  const jsonPath = path.join(dataDir, state + '_districts.json');
  
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Extract path IDs from SVG
  const regex = /<path[^>]*\sid="([^"]+)"/g;
  const pathIds = [];
  let m;
  while ((m = regex.exec(svgContent)) !== null) {
    pathIds.push(m[1]);
  }
  
  const districtIds = jsonData.map(d => d.id);
  const districtNames = jsonData.map(d => d.name);
  
  console.log('\n=== ' + state.toUpperCase() + ' ===');
  console.log('Districts in JSON:', districtIds.length);
  console.log('District IDs:', JSON.stringify(districtIds));
  console.log('District Names:', JSON.stringify(districtNames));
  console.log('Path IDs in SVG:', pathIds.length);
  console.log('Path IDs:', JSON.stringify(pathIds));
  
  // Check direct matches
  const directMatches = pathIds.filter(pid => districtIds.includes(pid));
  console.log('Direct ID matches:', directMatches.length);
});
