async function main() {
  const data = await import('../src/data/newStatesMockData.js');
  const consData = data.newStatesConstituencyData;

  const stateMlaStats = {};

  // We need to map district ID to state ID. We can read the district JSON files.
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_districts.json'));

  const distToState = {};
  files.forEach(f => {
    let stateId = '';
    // Map filename to stateId
    if (f.startsWith('tamilnadu_')) stateId = 'IN-TN';
    else if (f.startsWith('kerala_')) stateId = 'IN-KL';
    else if (f.startsWith('telangana_')) stateId = 'IN-TG';
    else if (f.startsWith('andhrapradesh_')) stateId = 'IN-AP';
    else if (f.startsWith('maharashtra_')) stateId = 'IN-MH';
    else if (f.startsWith('chhattisgarh_')) stateId = 'IN-CG';
    else if (f.startsWith('odisha_')) stateId = 'IN-OD';
    else if (f.startsWith('gujarat_')) stateId = 'IN-GJ';
    else if (f.startsWith('madhyapradesh_')) stateId = 'IN-MP';
    else if (f.startsWith('westbengal_')) stateId = 'IN-WB';
    else if (f.startsWith('puducherry_')) stateId = 'IN-PY';
    else if (f.startsWith('jharkhand_')) stateId = 'IN-JH';
    else if (f.startsWith('rajasthan_')) stateId = 'IN-RJ';
    else if (f.startsWith('goa_')) stateId = 'IN-GA';
    else if (f.startsWith('andaman_')) stateId = 'IN-AN';
    else if (f.startsWith('lakshadweep_')) stateId = 'IN-LD';
    else if (f.startsWith('dadra_nagar_haveli_')) stateId = 'IN-DN';
    else if (f.startsWith('bihar_')) stateId = 'IN-BR';
    else if (f.startsWith('uttarpradesh_')) stateId = 'IN-UP';
    else if (f.startsWith('punjab_')) stateId = 'IN-PB';
    else if (f.startsWith('haryana_')) stateId = 'IN-HR';
    else if (f.startsWith('himachalpradesh_')) stateId = 'IN-HP';
    else if (f.startsWith('uttarakhand_')) stateId = 'IN-UT';
    else if (f.startsWith('assam_')) stateId = 'IN-AS';
    else if (f.startsWith('tripura_')) stateId = 'IN-TR';
    else if (f.startsWith('manipur_')) stateId = 'IN-MN';
    else if (f.startsWith('meghalaya_')) stateId = 'IN-ML';
    else if (f.startsWith('mizoram_')) stateId = 'IN-MZ';
    else if (f.startsWith('nagaland_')) stateId = 'IN-NL';
    else if (f.startsWith('arunachalpradesh_')) stateId = 'IN-AR';
    else if (f.startsWith('sikkim_')) stateId = 'IN-SK';
    else if (f.startsWith('jammu_kashmir_')) stateId = 'IN-JK';
    else if (f.startsWith('karnataka_')) stateId = 'IN-KA';

    if (stateId) {
      const districts = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
      districts.forEach(d => {
        distToState[d.id] = stateId;
      });
    }
  });

  Object.entries(consData).forEach(([dist, list]) => {
    const stateId = distToState[dist] || 'UNKNOWN';
    if (!stateMlaStats[stateId]) {
      stateMlaStats[stateId] = { real: 0, placeholder: 0 };
    }
    list.forEach(c => {
      if (
        c.name.includes('Constituency') ||
        c.mla === 'Pending Election' ||
        c.mla === 'N/A' ||
        c.mla.includes('MLA') ||
        c.mla.includes('Candidate')
      ) {
        stateMlaStats[stateId].placeholder++;
      } else {
        stateMlaStats[stateId].real++;
      }
    });
  });

  console.log('MLA Realism Stats by State:');
  console.table(stateMlaStats);
}

main().catch(err => console.error(err));
