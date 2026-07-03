async function main() {
  const data = await import('../src/data/newStatesMockData.js');
  const consData = data.newStatesConstituencyData;

  let placeholderCount = 0;
  let realCount = 0;
  const placeholderDistricts = [];

  Object.entries(consData).forEach(([dist, list]) => {
    let hasPlaceholder = false;
    list.forEach(c => {
      if (
        c.name.includes('Constituency') ||
        c.mla === 'Pending Election' ||
        c.mla === 'N/A' ||
        c.mla.includes('MLA') ||
        c.mla.includes('Candidate')
      ) {
        hasPlaceholder = true;
        placeholderCount++;
      } else {
        realCount++;
      }
    });
    if (hasPlaceholder) {
      placeholderDistricts.push(dist);
    }
  });

  console.log('Total constituencies audited:', placeholderCount + realCount);
  console.log('Constituencies with real MLA/Name:', realCount);
  console.log('Constituencies with placeholders:', placeholderCount);
  console.log('Districts containing placeholders:', placeholderDistricts.length, 'out of', Object.keys(consData).length);
  if (placeholderDistricts.length > 0) {
    console.log('Sample placeholder districts (first 10):', placeholderDistricts.slice(0, 10));
  }
}

main().catch(err => console.error(err));
