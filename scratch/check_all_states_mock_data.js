const fs = require('fs');
const path = require('path');

const STATE_FILES = {
  'IN-KL': 'kerala_districts.json',
  'IN-TG': 'telangana_districts.json',
  'IN-AP': 'andhrapradesh_districts.json',
  'IN-PY': 'puducherry_districts.json'
};

const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'newStatesMockData.js');
const mockContent = fs.readFileSync(mockDataPath, 'utf8');

const keysMatch = mockContent.match(/export const newStatesConstituencyData = \{([\s\S]+?)\};/);
if (!keysMatch) {
  console.log('Could not find newStatesConstituencyData!');
  process.exit(1);
}

const lines = keysMatch[1].split('\n');
const mockKeys = new Set();
lines.forEach(line => {
  const m = line.match(/^  "([^"]+)"\s*:\s*\[/);
  if (m) mockKeys.add(m[1]);
});

Object.entries(STATE_FILES).forEach(([stateId, jsonFile]) => {
  console.log(`\nChecking ${stateId} (${jsonFile}):`);
  const jsonPath = path.join(__dirname, '..', 'public', 'data', jsonFile);
  if (!fs.existsSync(jsonPath)) {
    console.log(`ERROR: JSON file not found: ${jsonPath}`);
    return;
  }
  
  const districts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let missing = 0;
  districts.forEach(d => {
    if (!mockKeys.has(d.id)) {
      console.log(`- Missing in mock data: ${d.id} (${d.name})`);
      missing++;
    }
  });
  if (missing === 0) {
    console.log(`SUCCESS: All ${districts.length} districts are present in mock data.`);
  } else {
    console.log(`WARNING: ${missing} districts are missing from mock data.`);
  }
});
