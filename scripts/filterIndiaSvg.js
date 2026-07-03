const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'public', 'maps', 'india.svg');
const destPath = path.join(__dirname, '..', 'public', 'maps', 'india_south.svg');

if (!fs.existsSync(srcPath)) {
  console.error('Source india.svg not found at:', srcPath);
  process.exit(1);
}

const svgText = fs.readFileSync(srcPath, 'utf8');

const mapping = {
  'ka': 'IN-KA',
  'tn': 'IN-TN',
  'kl': 'IN-KL',
  'ap': 'IN-AP',
  'tg': 'IN-TG'
};

const parser = require('child_process'); // We can use regular expressions to parse/reconstruct, which requires no external dependencies.
// Let's write a simple JS-only parser using regex or standard DOM-like parsing.
// Actually, we can use a simple regex-based parser that scans <path ... /> elements.

// Let's match all <path ... /> elements.
// Example: <path id="..." aria-label="..." d="..." />
const pathRegex = /<path[^>]*>/g;
const paths = svgText.match(pathRegex) || [];

let filteredPaths = [];
for (const p of paths) {
  // Extract id
  const idMatch = p.match(/id="([^"]+)"/);
  if (idMatch) {
    const id = idMatch[1];
    if (mapping[id]) {
      // Replace id with the mapped value
      const updatedPath = p.replace(`id="${id}"`, `id="${mapping[id]}"`);
      filteredPaths.push(updatedPath);
    }
  }
}

// Now replace the entire inner content of <svg> with these filtered paths.
const svgStartMatch = svgText.match(/<svg[^>]*>/);
if (!svgStartMatch) {
  console.error('Could not find <svg> start tag.');
  process.exit(1);
}
const svgStartTag = svgStartMatch[0];

const finalSvg = `${svgStartTag}
  ${filteredPaths.join('\n  ')}
</svg>`;

fs.writeFileSync(destPath, finalSvg, 'utf8');
console.log('Successfully filtered India SVG to South Indian states and saved to:', destPath);
