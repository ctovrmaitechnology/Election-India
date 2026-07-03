const fs = require('fs');
const path = require('path');
const React = require('react');

const states = [
  { name: 'tamilnadu', pkg: 'svgmap-tamilnadu' },
  { name: 'kerala', pkg: 'svgmap-kerala' },
  { name: 'telangana', pkg: 'svgmap-telangana' },
  { name: 'andhrapradesh', pkg: 'svgmap-andhrapradesh' },
  { name: 'maharashtra', pkg: 'svgmap-maharashtra' },
  { name: 'chhattisgarh', pkg: 'svgmap-chhattisgarh' },
  { name: 'odisha', pkg: 'svgmap-odisha' },
  { name: 'gujarat', pkg: 'svgmap-gujarat' },
  { name: 'madhyapradesh', pkg: 'svgmap-madhyapradesh' },
  { name: 'westbengal', pkg: 'svgmap-westbengal' },
  { name: 'jharkhand', pkg: 'svgmap-jharkhand' }
];

const destDir = path.join(__dirname, '..', 'public', 'maps');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to normalize a name to lowercase, space-to-underscore format
function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[\s\-\'\.]+/g, '_');
}

for (const state of states) {
  try {
    const mod = require(state.pkg);
    const districtNames = mod.districtNames || {};
    
    let element = mod.default({});
    // Recursively render function components
    while (typeof element.type === 'function') {
      element = element.type(element.props);
    }
    
    // Find the svg element
    let svgElement = element;
    if (element.type === 'div') {
      svgElement = element.props.children;
    }
    
    if (svgElement.type !== 'svg') {
      console.error(`Could not find svg element for ${state.name}`);
      continue;
    }
    
    const viewBox = svgElement.props.viewBox;
    const paths = svgElement.props.children;
    
    console.log(`Generating SVG for ${state.name}: viewBox="${viewBox}", pathsCount=${paths.length}`);
    
    const pathStrings = [];
    for (const pathObj of paths) {
      const origId = pathObj.props.id;
      const districtName = districtNames[origId] || origId;
      const normalizedId = normalizeName(districtName);
      const d = pathObj.props.d;
      
      pathStrings.push(`  <path id="${normalizedId}" d="${d}" />`);
    }
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${pathStrings.join('\n')}
</svg>`;
    
    const destPath = path.join(destDir, `${state.name}.svg`);
    fs.writeFileSync(destPath, svgContent, 'utf8');
    console.log(`Successfully generated and saved SVG to ${destPath}`);
  } catch (err) {
    console.error(`Error generating SVG for ${state.name}:`, err);
  }
}
