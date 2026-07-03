/**
 * merge_and_update_data.js
 * Merges the pre-existing state_mlas.json (8 states) and scratch/fetched_mlas.json (18 states)
 * into the main newStatesMockData.js dataset, aligning constituencies to districts.
 */

const fs = require('fs');
const path = require('path');

const STATE_PREFIXES = {
  'IN-KL': 'kerala',
  'IN-TG': 'telangana',
  'IN-AP': 'andhrapradesh',
  'IN-MH': 'maharashtra',
  'IN-CG': 'chhattisgarh',
  'IN-OD': 'odisha',
  'IN-GJ': 'gujarat',
  'IN-MP': 'madhyapradesh',
  'IN-WB': 'westbengal',
  'IN-PY': 'puducherry',
  'IN-JH': 'jharkhand',
  'IN-BR': 'bihar',
  'IN-UP': 'uttarpradesh',
  'IN-PB': 'punjab',
  'IN-HR': 'haryana',
  'IN-HP': 'himachalpradesh',
  'IN-UT': 'uttarakhand',
  'IN-AS': 'assam',
  'IN-TR': 'tripura',
  'IN-MN': 'manipur',
  'IN-ML': 'meghalaya',
  'IN-MZ': 'mizoram',
  'IN-NL': 'nagaland',
  'IN-AR': 'arunachalpradesh',
  'IN-SK': 'sikkim',
  'IN-JK': 'jammu_kashmir'
};

// Seeded PRNG for consistent mock metric generation
function getSeededRandom(seedStr) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedStr.length; i++)
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  let seed = ((h ^ h >>> 16) >>> 0);
  return function() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed < 0 ? ~seed + 1 : seed) % 100000) / 100000;
  }
}

// Levenshtein Distance for district matching
function levenshtein(a, b) {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase()
    .replace(/district/gi, '')
    .replace(/[\s\-\'\.]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function findMatchingDistrict(parsedDistrictName, districtsList) {
  const normParsed = normalizeName(parsedDistrictName);
  if (!normParsed) return null;
  
  let bestDist = Infinity;
  let bestMatch = null;
  
  for (const d of districtsList) {
    const normId = normalizeName(d.id);
    const normName = normalizeName(d.name);
    
    if (normParsed === normId || normParsed === normName) {
      return d;
    }
    
    const distId = levenshtein(normParsed, normId);
    const distName = levenshtein(normParsed, normName);
    const minD = Math.min(distId, distName);
    
    if (minD < bestDist) {
      bestDist = minD;
      bestMatch = d;
    }
  }
  
  if (bestDist < 5) {
    return bestMatch;
  }
  return null;
}

function main() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  
  // 1. Read existing newStatesMockData.js content
  const mockDataFile = path.join(__dirname, '..', 'src', 'data', 'newStatesMockData.js');
  const fileContent = fs.readFileSync(mockDataFile, 'utf8');
  const jsonText = fileContent.substring(fileContent.indexOf('{'), fileContent.lastIndexOf('}') + 1);
  let newStatesConstituencyData;
  try {
    newStatesConstituencyData = eval('(' + jsonText + ')');
  } catch (err) {
    console.error('Failed to parse existing mock data file:', err);
    process.exit(1);
  }
  
  // 2. Read input MLA sources
  const preExistingMlas = JSON.parse(fs.readFileSync(path.join(dataDir, 'state_mlas.json'), 'utf8'));
  const fetchedMlas = JSON.parse(fs.readFileSync(path.join(__dirname, 'fetched_mlas.json'), 'utf8'));
  
  // Combine all MLAs by state ID
  const allMlaData = {};
  
  // For the 8 pre-existing states
  const stateIdMapping = {
    'maharashtra': 'IN-MH',
    'chhattisgarh': 'IN-CG',
    'odisha': 'IN-OD',
    'gujarat': 'IN-GJ',
    'madhyapradesh': 'IN-MP',
    'westbengal': 'IN-WB',
    'puducherry': 'IN-PY',
    'jharkhand': 'IN-JH'
  };
  
  Object.entries(preExistingMlas).forEach(([statePrefix, list]) => {
    const stateId = stateIdMapping[statePrefix];
    if (stateId) {
      allMlaData[stateId] = list;
    }
  });
  
  // For the 18 fetched states
  Object.entries(fetchedMlas).forEach(([stateId, list]) => {
    allMlaData[stateId] = list;
  });
  
  console.log(`Processing updates for ${Object.keys(allMlaData).length} states...`);
  
  let totalReplaced = 0;
  let totalDistrictsUpdated = 0;
  
  // 3. Process each state and update its districts
  for (const [stateId, prefix] of Object.entries(STATE_PREFIXES)) {
    const stateMlas = allMlaData[stateId];
    if (!stateMlas) {
      console.log(`No MLA data for ${stateId} (${prefix}), skipping.`);
      continue;
    }
    
    // Load the district mappings
    const districtFile = path.join(dataDir, `${prefix}_districts.json`);
    if (!fs.existsSync(districtFile)) {
      console.log(`District file ${districtFile} not found, skipping state.`);
      continue;
    }
    
    const districts = JSON.parse(fs.readFileSync(districtFile, 'utf8'));
    
    // Group MLA data by matched district ID
    const groupedByDistrictId = {};
    districts.forEach(d => {
      groupedByDistrictId[d.id] = [];
    });
    
    stateMlas.forEach(record => {
      // Find matching district ID
      const matched = findMatchingDistrict(record.district, districts);
      if (matched) {
        groupedByDistrictId[matched.id].push(record);
      } else {
        // Fallback: search in constituency name or district prefix if needed,
        // or just log warning. In most cases, findMatchingDistrict will succeed.
        // console.log(`[Warning] No district match for: ${record.district} in ${stateId}`);
      }
    });
    
    // Update each district in the newStatesConstituencyData object
    districts.forEach(d => {
      const records = groupedByDistrictId[d.id];
      if (records && records.length > 0) {
        // Convert MLA records into constituency objects
        const newConsList = records.map(r => {
          const cName = r.constituency;
          const rand = getSeededRandom(cName);
          const wards = Math.floor(rand() * 11) + 12; // 12 to 22 wards
          const major = Math.floor(rand() * 451) + 150; // 150 to 600
          const minor = Math.floor(rand() * 271) + 80; // 80 to 350
          const visited = rand() > 0.5;
          
          return {
            name: cName,
            mla: r.mla || 'Pending Election',
            party: r.party || 'N/A',
            wards,
            major,
            minor,
            visited
          };
        });
        
        // Overwrite the constituency list for this district ID
        newStatesConstituencyData[d.id] = newConsList;
        totalReplaced += newConsList.length;
        totalDistrictsUpdated++;
      } else {
        // Safe Fallback: keep existing mock list so we don't clear the district
        console.log(`[Info] No fetched data for district ${d.id} (${d.name}) in ${stateId}, keeping existing data.`);
      }
    });
  }
  
  // 4. Serialize and write the updated data back
  const output = `export const newStatesConstituencyData = ${JSON.stringify(newStatesConstituencyData, null, 2)};\n`;
  fs.writeFileSync(mockDataFile, output, 'utf8');
  
  console.log(`\nSuccess! Updated ${totalDistrictsUpdated} districts with a total of ${totalReplaced} real constituencies.`);
}

main();
