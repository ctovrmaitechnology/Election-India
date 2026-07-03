const fs = require('fs');
const path = require('path');
const React = require('react');

// Simple PRNG to generate deterministic random numbers based on a seed string
function getSeededRandom(seedStr) {
  let h = 0xdeadbeef;
  for(let i = 0; i < seedStr.length; i++)
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  let seed = ((h ^ h >>> 16) >>> 0);
  
  return function() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed < 0 ? ~seed + 1 : seed) % 100000) / 100000;
  }
}

// Karnataka districts data from source code
const karnatakaMockDataFile = path.join(__dirname, '..', 'src', 'data', 'mockData.js');
let karnatakaDistricts = [];

if (fs.existsSync(karnatakaMockDataFile)) {
  const content = fs.readFileSync(karnatakaMockDataFile, 'utf8');
  // Extract districtsData array using simple regex or eval
  const arrayMatch = content.match(/export const districtsData = (\[[\s\S]*?\]);/);
  if (arrayMatch) {
    try {
      // Safely evaluate mockData structure
      const mockSandbox = {};
      const evalCode = `(function() { return ${arrayMatch[1]}; })()`;
      karnatakaDistricts = eval(evalCode);
    } catch (e) {
      console.error('Failed to parse Karnataka mockData, falling back to empty list', e);
    }
  }
}

const states = [
  { id: 'IN-KA', fileId: 'karnataka', name: 'Karnataka', pkg: 'svgmap-tamilnadu', isKarnataka: true },
  { id: 'IN-TN', fileId: 'tamilnadu', name: 'Tamil Nadu', pkg: 'svgmap-tamilnadu' },
  { id: 'IN-KL', fileId: 'kerala', name: 'Kerala', pkg: 'svgmap-kerala' },
  { id: 'IN-TG', fileId: 'telangana', name: 'Telangana', pkg: 'svgmap-telangana' },
  { id: 'IN-AP', fileId: 'andhrapradesh', name: 'Andhra Pradesh', pkg: 'svgmap-andhrapradesh' },
  { id: 'IN-MH', fileId: 'maharashtra', name: 'Maharashtra', pkg: 'svgmap-maharashtra' },
  { id: 'IN-CG', fileId: 'chhattisgarh', name: 'Chhattisgarh', pkg: 'svgmap-chhattisgarh' },
  { id: 'IN-OD', fileId: 'odisha', name: 'Odisha', pkg: 'svgmap-odisha' },
  { id: 'IN-GJ', fileId: 'gujarat', name: 'Gujarat', pkg: 'svgmap-gujarat' },
  { id: 'IN-MP', fileId: 'madhyapradesh', name: 'Madhya Pradesh', pkg: 'svgmap-madhyapradesh' },
  { id: 'IN-WB', fileId: 'westbengal', name: 'West Bengal', pkg: 'svgmap-westbengal' },
  { id: 'IN-PY', fileId: 'puducherry', name: 'Puducherry', pkg: 'none' },
  { id: 'IN-JH', fileId: 'jharkhand', name: 'Jharkhand', pkg: 'svgmap-jharkhand' }
];

const destDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[\s\-\'\.]+/g, '_');
}

const summary = {};

for (const state of states) {
  let districts = [];
  const stateDestPath = path.join(destDir, `${state.fileId}_districts.json`);
  
  if (state.isKarnataka && karnatakaDistricts.length > 0) {
    districts = karnatakaDistricts;
  } else if (state.id === 'IN-PY') {
    // Puducherry manual list of 4 districts
    const pyDistNames = ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'];
    const rand = getSeededRandom(state.name);
    for (const origName of pyDistNames) {
      const id = normalizeName(origName);
      const constituenciesCount = Math.floor(rand() * 4) + 1; // smaller counts for UT
      const wardsCount = constituenciesCount * 10;
      const population = Math.floor(rand() * 500000) + 50000;
      const complaintsMajor = Math.floor(rand() * 150) + 10;
      const complaintsMinor = Math.floor(rand() * 100) + 10;
      const candidates = Math.floor(rand() * 8) + 2;
      const visitedCount = Math.floor((complaintsMajor + complaintsMinor) * (rand() * 0.3 + 0.1));
      const notVisitedCount = Math.floor((complaintsMajor + complaintsMinor) * (rand() * 0.2 + 0.05));
      const engaged = Math.floor(population * (rand() * 0.02 + 0.005));

      districts.push({
        id,
        name: origName,
        hq: `${origName} City`,
        constituenciesCount,
        wardsCount,
        population,
        complaintsMajor,
        complaintsMinor,
        candidates,
        visitedCount,
        notVisitedCount,
        engaged
      });
    }
  } else {
    try {
      const mod = require(state.pkg);
      const districtNames = mod.districtNames || {};
      const rand = getSeededRandom(state.name);
      
      for (const [code, origName] of Object.entries(districtNames)) {
        const id = normalizeName(origName);
        
        // Generate deterministic values
        const constituenciesCount = Math.floor(rand() * 12) + 4; // 4 to 15
        const wardsCount = constituenciesCount * (Math.floor(rand() * 10) + 15); // 15 to 24 per constituency
        const population = Math.floor(rand() * 4000000) + 600000; // 600k to 4.6M
        const complaintsMajor = Math.floor(rand() * 1000) + 100; // 100 to 1100
        const complaintsMinor = Math.floor(rand() * 600) + 50; // 50 to 650
        const candidates = Math.floor(rand() * 18) + 6; // 6 to 23
        const visitedCount = Math.floor((complaintsMajor + complaintsMinor) * (rand() * 0.3 + 0.1));
        const notVisitedCount = Math.floor((complaintsMajor + complaintsMinor) * (rand() * 0.2 + 0.05));
        const engaged = Math.floor(population * (rand() * 0.02 + 0.005));
        
        districts.push({
          id,
          name: origName,
          hq: `${origName} City`,
          constituenciesCount,
          wardsCount,
          population,
          complaintsMajor,
          complaintsMinor,
          candidates,
          visitedCount,
          notVisitedCount,
          engaged
        });
      }
    } catch (err) {
      if (fs.existsSync(stateDestPath)) {
        console.log(`Module loading failed for ${state.name}. Using existing file: ${stateDestPath}`);
        districts = JSON.parse(fs.readFileSync(stateDestPath, 'utf8'));
      } else {
        console.error(`Error loading state npm module ${state.pkg} and no existing file found:`, err);
      }
    }
  }
  
  // Write state-level districts file
  fs.writeFileSync(stateDestPath, JSON.stringify(districts, null, 2), 'utf8');
  console.log(`Saved ${districts.length} districts for ${state.name} to ${stateDestPath}`);
  
  // Compute state-level aggregation
  const stateStats = districts.reduce((acc, d) => ({
    complaintsMajor: acc.complaintsMajor + d.complaintsMajor,
    complaintsMinor: acc.complaintsMinor + d.complaintsMinor,
    candidates: acc.candidates + d.candidates,
    visitedCount: acc.visitedCount + d.visitedCount,
    notVisitedCount: acc.notVisitedCount + d.notVisitedCount
  }), { complaintsMajor: 0, complaintsMinor: 0, candidates: 0, visitedCount: 0, notVisitedCount: 0 });
  
  const totalComplaints = stateStats.complaintsMajor + stateStats.complaintsMinor;
  
  // Determine risk level based on total complaints
  let risk = 'Low';
  if (totalComplaints > 20000) risk = 'High';
  else if (totalComplaints > 10000) risk = 'Medium';
  
  summary[state.id] = {
    id: state.id,
    name: state.name,
    complaintsMajor: stateStats.complaintsMajor,
    complaintsMinor: stateStats.complaintsMinor,
    totalComplaints,
    candidates: stateStats.candidates,
    visitedCount: stateStats.visitedCount,
    notVisitedCount: stateStats.notVisitedCount,
    risk
  };
}

// Write the unified summary file
const summaryPath = path.join(destDir, 'stateSummary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`Saved unified stateSummary.json to ${summaryPath}`);
