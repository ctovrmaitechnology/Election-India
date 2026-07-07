import React from 'react';
import KarnatakaMap from './KarnatakaMap';
import StateMap from './StateMap';
import GoaMap from './GoaMap';

// State-specific SVG configurations for non-Karnataka states
const STATE_CONFIGS = {
  'IN-TN': { svgUrl: '/maps/tamilnadu.svg',          viewBox: '7623.34 -1356.27 411.3 562.00',   title: 'Tamil Nadu' },
  'IN-KL': { svgUrl: '/maps/kerala.svg',              viewBox: '38.00 12.00 1392.00 2490.00',      title: 'Kerala' },
  'IN-TG': { svgUrl: '/maps/telangana.svg',           viewBox: '0 0 1000.00 1010.00',              title: 'Telangana' },
  'IN-AP': { svgUrl: '/maps/andhrapradesh.svg',       viewBox: '7676.11 -1916.63 800.36 665.00',  title: 'Andhra Pradesh' },
  'IN-MH': { svgUrl: '/maps/maharashtra.svg',         viewBox: '1167.80 -662.00 2240.60 1767.80', title: 'Maharashtra' },
  'IN-CG': { svgUrl: '/maps/chhattisgarh.svg',        viewBox: '0 0 656.80 1010.00',               title: 'Chhattisgarh' },
  'IN-OD': { svgUrl: '/maps/odisha.svg',              viewBox: '0 0 1000.00 790.00',               title: 'Odisha' },
  'IN-GJ': { svgUrl: '/maps/gujarat.svg',             viewBox: '0 0 1000 730.00',                  title: 'Gujarat' },
  'IN-MP': { svgUrl: '/maps/madhyapradesh.svg',       viewBox: '0 0 1000.00 670.00',               title: 'Madhya Pradesh' },
  'IN-WB': { svgUrl: '/maps/westbengal.svg',          viewBox: '0 0 706.77 1010.00',               title: 'West Bengal' },
  'IN-PY': { svgUrl: '/maps/puducherry.svg',          viewBox: '0 0 200 200',                      title: 'Puducherry' },
  'IN-JH': { svgUrl: '/maps/jharkhand.svg',           viewBox: '0 0 1000.00 740.00',               title: 'Jharkhand' },
  'IN-RJ': { svgUrl: '/maps/rajasthan.svg',           viewBox: '0 0 1000 812.45',                  title: 'Rajasthan' },
  'IN-AN': { svgUrl: '/maps/andaman.svg',             viewBox: '497 516 47 184',                   title: 'Andaman & Nicobar Islands' },
  'IN-LD': { svgUrl: '/maps/lakshadweep.svg',         viewBox: '76 585 44 84',                     title: 'Lakshadweep' },
  'IN-DN': { svgUrl: '/maps/dadra_nagar_haveli.svg',  viewBox: '42 377 74 41',                     title: 'Dadra & Nagar Haveli and Daman & Diu' },
  'IN-BR': { svgUrl: '/maps/bihar.svg',               viewBox: '0 0 1000.00 838.41',               title: 'Bihar' },
  'IN-UP': { svgUrl: '/maps/uttarpradesh.svg',        viewBox: '0 0 1000.00 837.41',               title: 'Uttar Pradesh' },
  'IN-PB': { svgUrl: '/maps/punjab.svg',              viewBox: '0 0 1000.00 875.27',               title: 'Punjab' },
  'IN-HR': { svgUrl: '/maps/haryana.svg',             viewBox: '0 0 1000.00 769.14',               title: 'Haryana' },
  'IN-HP': { svgUrl: '/maps/himachalpradesh.svg',     viewBox: '0 0 1000.00 882.24',               title: 'Himachal Pradesh' },
  'IN-UT': { svgUrl: '/maps/uttarakhand.svg',         viewBox: '0 0 1000.00 689.80',               title: 'Uttarakhand' },
  'IN-AS': { svgUrl: '/maps/assam.svg',               viewBox: '0 0 1000.00 541.71',               title: 'Assam' },
  'IN-TR': { svgUrl: '/maps/tripura.svg',             viewBox: '0 0 1000.00 1000.00',              title: 'Tripura' },
  'IN-MN': { svgUrl: '/maps/manipur.svg',             viewBox: '0 0 1000.00 1000.00',              title: 'Manipur' },
  'IN-ML': { svgUrl: '/maps/meghalaya.svg',           viewBox: '0 0 1000.00 737.55',               title: 'Meghalaya' },
  'IN-MZ': { svgUrl: '/maps/mizoram.svg',             viewBox: '0 0 1000.00 1000.00',              title: 'Mizoram' },
  'IN-NL': { svgUrl: '/maps/nagaland.svg',            viewBox: '0 0 1000.00 880.66',               title: 'Nagaland' },
  'IN-AR': { svgUrl: '/maps/arunachalpradesh.svg',    viewBox: '0 0 1000.00 649.96',               title: 'Arunachal Pradesh' },
  'IN-SK': { svgUrl: '/maps/sikkim.svg',              viewBox: '0 0 1000.00 1000.00',              title: 'Sikkim' },
  'IN-JK': { svgUrl: '/maps/jammu_kashmir.svg',       viewBox: '0 0 1000.00 808.66',               title: 'Jammu & Kashmir' },
};


export default function StateMapRouter({ stateId, selectedDistrict, onDistrictClick, loadedStates, onBackToIndia }) {
  // Karnataka: use the original KarnatakaMap (preserved alignment & styling)
  if (stateId === 'IN-KA') {
    return (
      <KarnatakaMap
        selectedDistrict={selectedDistrict}
        onDistrictClick={onDistrictClick}
        loadedStates={loadedStates}
        onBackToIndia={onBackToIndia}
      />
    );
  }

  // Goa: use custom runtime-parsed GoaMap component
  if (stateId === 'IN-GA') {
    return (
      <GoaMap
        selectedDistrict={selectedDistrict}
        onDistrictClick={onDistrictClick}
        loadedStates={loadedStates}
        onBackToIndia={onBackToIndia}
      />
    );
  }

  const config = STATE_CONFIGS[stateId];

  if (!config) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '520px' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Please select a valid state map.</p>
      </div>
    );
  }

  return (
    <StateMap
      stateId={stateId}
      svgUrl={config.svgUrl}
      viewBox={config.viewBox}
      title={config.title}
      pathToDistrict={config.pathToDistrict || null}
      selectedDistrict={selectedDistrict}
      onDistrictClick={onDistrictClick}
      loadedStates={loadedStates}
      onBackToIndia={onBackToIndia}
      strokeWidth={config.strokeWidth}
    />
  );
}
