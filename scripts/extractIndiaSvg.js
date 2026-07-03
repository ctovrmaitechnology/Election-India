const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\b2d26dc2-7c36-4655-8487-a00085034722\\.system_generated\\steps\\285\\content.md';
const destDir = path.join(__dirname, '..', 'public', 'maps');
const destPath = path.join(destDir, 'india.svg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const content = fs.readFileSync(srcPath, 'utf8');

// The SVG starts at '<svg' and ends at '</svg>'
const svgStart = content.indexOf('<svg');
const svgEnd = content.indexOf('</svg>');

if (svgStart !== -1 && svgEnd !== -1) {
  const svgText = content.substring(svgStart, svgEnd + '</svg>'.length);
  fs.writeFileSync(destPath, svgText, 'utf8');
  console.log('Successfully extracted India SVG to:', destPath);
} else {
  console.error('Could not find SVG start or end in the source file.');
}
