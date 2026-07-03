const fs = require('fs');
const states = ['tamilnadu', 'kerala', 'telangana', 'andhrapradesh'];

states.forEach(state => {
  const content = fs.readFileSync(`public/maps/${state}.svg`, 'utf8');
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const widthMatch = content.match(/\swidth="([^"]+)"/);
  const heightMatch = content.match(/\sheight="([^"]+)"/);
  console.log(`\n${state}:`);
  console.log('  viewBox:', vbMatch ? vbMatch[1] : 'none');
  console.log('  width:', widthMatch ? widthMatch[1] : 'none');
  console.log('  height:', heightMatch ? heightMatch[1] : 'none');
  
  // Count total paths
  const pathCount = (content.match(/<path/g) || []).length;
  console.log('  path count:', pathCount);
});
