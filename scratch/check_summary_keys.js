const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '..', 'public', 'data', 'stateSummary.json');
const content = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

console.log('Keys in stateSummary.json:', Object.keys(content));
console.log('Sample key (IN-KA):', content['IN-KA']);
