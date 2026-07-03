const fs = require('fs');
const path = require('path');

const STATE_CONFIGS = {
  'IN-TN': { svgUrl: '/maps/tamilnadu.svg',          json: 'tamilnadu_districts.json' },
  'IN-KL': { svgUrl: '/maps/kerala.svg',              json: 'kerala_districts.json' },
  'IN-TG': { svgUrl: '/maps/telangana.svg',           json: 'telangana_districts.json' },
  'IN-AP': { svgUrl: '/maps/andhrapradesh.svg',       json: 'andhrapradesh_districts.json' },
  'IN-MH': { svgUrl: '/maps/maharashtra.svg',         json: 'maharashtra_districts.json' },
  'IN-CG': { svgUrl: '/maps/chhattisgarh.svg',        json: 'chhattisgarh_districts.json' },
  'IN-OD': { svgUrl: '/maps/odisha.svg',              json: 'odisha_districts.json' },
  'IN-GJ': { svgUrl: '/maps/gujarat.svg',             json: 'gujarat_districts.json' },
  'IN-MP': { svgUrl: '/maps/madhyapradesh.svg',       json: 'madhyapradesh_districts.json' },
  'IN-WB': { svgUrl: '/maps/westbengal.svg',          json: 'westbengal_districts.json' },
  'IN-PY': { svgUrl: '/maps/puducherry.svg',          json: 'puducherry_districts.json' },
  'IN-JH': { svgUrl: '/maps/jharkhand.svg',           json: 'jharkhand_districts.json' },
  'IN-RJ': { svgUrl: '/maps/rajasthan.svg',           json: 'rajasthan_districts.json' },
  'IN-GA': { svgUrl: '/maps/goa.svg',                 json: 'goa_districts.json' },
  'IN-AN': { svgUrl: '/maps/andaman.svg',             json: 'andaman_districts.json' },
  'IN-LD': { svgUrl: '/maps/lakshadweep.svg',         json: 'lakshadweep_districts.json' },
  'IN-DN': { svgUrl: '/maps/dadra_nagar_haveli.svg',  json: 'dadra_nagar_haveli_districts.json' },
  'IN-BR': { svgUrl: '/maps/bihar.svg',               json: 'bihar_districts.json' },
  'IN-UP': { svgUrl: '/maps/uttarpradesh.svg',        json: 'uttarpradesh_districts.json' },
  'IN-PB': { svgUrl: '/maps/punjab.svg',              json: 'punjab_districts.json' },
  'IN-HR': { svgUrl: '/maps/haryana.svg',             json: 'haryana_districts.json' },
  'IN-HP': { svgUrl: '/maps/himachalpradesh.svg',     json: 'himachalpradesh_districts.json' },
  'IN-UT': { svgUrl: '/maps/uttarakhand.svg',         json: 'uttarakhand_districts.json' },
  'IN-AS': { svgUrl: '/maps/assam.svg',               json: 'assam_districts.json' },
  'IN-TR': { svgUrl: '/maps/tripura.svg',             json: 'tripura_districts.json' },
  'IN-MN': { svgUrl: '/maps/manipur.svg',             json: 'manipur_districts.json' },
  'IN-ML': { svgUrl: '/maps/meghalaya.svg',           json: 'meghalaya_districts.json' },
  'IN-MZ': { svgUrl: '/maps/mizoram.svg',             json: 'mizoram_districts.json' },
  'IN-NL': { svgUrl: '/maps/nagaland.svg',            json: 'nagaland_districts.json' },
  'IN-AR': { svgUrl: '/maps/arunachalpradesh.svg',    json: 'arunachalpradesh_districts.json' },
  'IN-SK': { svgUrl: '/maps/sikkim.svg',              json: 'sikkim_districts.json' },
  'IN-JK': { svgUrl: '/maps/jammu_kashmir.svg',       json: 'jammu_kashmir_districts.json' }
};

Object.entries(STATE_CONFIGS).forEach(([stateId, config]) => {
  const svgPath = path.join(__dirname, '..', 'public', config.svgUrl);
  const jsonPath = path.join(__dirname, '..', 'public', 'data', config.json);

  if (!fs.existsSync(svgPath)) {
    console.log(`[${stateId}] ERROR: SVG not found: ${config.svgUrl}`);
    return;
  }
  if (!fs.existsSync(jsonPath)) {
    console.log(`[${stateId}] ERROR: JSON not found: ${config.json}`);
    return;
  }

  const svgText = fs.readFileSync(svgPath, 'utf8');
  const districts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const idRegex = /id="([^"]+)"/g;
  let match;
  const svgIds = [];
  while ((match = idRegex.exec(svgText)) !== null) {
    svgIds.push(match[1]);
  }

  const jsonIds = districts.map(d => d.id);
  const extraInJson = jsonIds.filter(id => !svgIds.includes(id));
  const extraInSvg = svgIds.filter(id => !jsonIds.includes(id));

  if (extraInJson.length > 0 || extraInSvg.length > 0) {
    console.log(`[${stateId}] Mismatch detected:`);
    if (extraInJson.length > 0) console.log(`  - In JSON but not in SVG: ${JSON.stringify(extraInJson)}`);
    if (extraInSvg.length > 0) console.log(`  - In SVG but not in JSON: ${JSON.stringify(extraInSvg)}`);
  } else {
    console.log(`[${stateId}] SUCCESS: SVG and JSON are in perfect sync (${districts.length} districts).`);
  }
});
