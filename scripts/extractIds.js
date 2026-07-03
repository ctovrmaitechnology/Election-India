const fs = require('fs');

const states = [
  { name: 'tamilnadu',     jsonFile: 'public/data/tamilnadu_districts.json',     svgFile: 'public/maps/tamilnadu.svg' },
  { name: 'kerala',        jsonFile: 'public/data/kerala_districts.json',         svgFile: 'public/maps/kerala.svg' },
  { name: 'telangana',     jsonFile: 'public/data/telangana_districts.json',      svgFile: 'public/maps/telangana.svg' },
  { name: 'andhrapradesh', jsonFile: 'public/data/andhrapradesh_districts.json',  svgFile: 'public/maps/andhrapradesh.svg' },
];

states.forEach(({ name, jsonFile, svgFile }) => {
  const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const jsonIds = new Set(json.map(d => d.id));

  const svgContent = fs.readFileSync(svgFile, 'utf8');
  const pathMatches = svgContent.match(/<path[^>]*id="([^"]+)"[^>]*/g) || [];
  const svgIds = pathMatches.map(m => { const r = m.match(/id="([^"]+)"/); return r ? r[1] : null; }).filter(Boolean);

  const matched   = svgIds.filter(id => jsonIds.has(id));
  const unmatched = svgIds.filter(id => !jsonIds.has(id));
  const missing   = [...jsonIds].filter(id => !svgIds.includes(id));

  console.log(`\n=== ${name.toUpperCase()} ===`);
  console.log(`  SVG paths: ${svgIds.length} | JSON districts: ${jsonIds.size}`);
  console.log(`  ✅ Matched (${matched.length}): ${matched.join(', ')}`);
  if (unmatched.length) console.log(`  ❌ SVG IDs not in JSON (${unmatched.length}): ${unmatched.join(', ')}`);
  if (missing.length)   console.log(`  ⚠️  JSON IDs not in SVG  (${missing.length}): ${missing.join(', ')}`);
});
