const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'components', 'map', 'IndiaMap.jsx');
const content = fs.readFileSync(file, 'utf8');

// Parse the LABEL_POS object from the file using regex or evaluation
const labelPosMatch = content.match(/const LABEL_POS = \{([\s\S]+?)\};/);
if (labelPosMatch) {
  console.log('Found LABEL_POS definition:');
  const innerText = labelPosMatch[1];
  console.log(innerText);
  
  // Let's parse it manually to check the keys
  const lines = innerText.split('\n');
  const keys = [];
  lines.forEach(line => {
    const m = line.match(/'([^']+)'\s*:/);
    if (m) keys.push(m[1]);
  });
  console.log('Parsed Keys:', keys.join(', '));
} else {
  console.log('Could not find LABEL_POS in file!');
}
