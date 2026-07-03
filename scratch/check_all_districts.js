const { newStatesConstituencyData } = require('./src/data/newStatesMockData.js');
const { districtsData } = require('./src/data/mockData.js');

console.log('KARNATAKA DISTRICTS:');
districtsData.forEach(d => console.log(` - ${d.id} (${d.name})`));

// In the application, districts from other states are loaded. Let's see how they are structured.
// Let's read the keys of newStatesConstituencyData
const districtIds = Object.keys(newStatesConstituencyData);
console.log('\nOTHER DISTRICTS (' + districtIds.length + '):');
districtIds.forEach(id => {
  console.log(` - ${id}`);
});
