const fs = require('fs');
const path = require('path');

const TN_DISTRICTS = [
  'ariyalur','chengalpattu','chennai','coimbatore','cuddalore','dharmapuri','dindigul','erode',
  'kallakurichi','kanchipuram','kanyakumari','karaikal','karur','krishnagiri','madurai','mayiladuthurai',
  'nagapattinam','namakkal','nilgiris','perambalur','pudukkottai','ramanathapuram','ranipet','salem',
  'sivagangai','tenkasi','tanjavur','theni','thiruvarur','tiruppur','thoothukudi','tiruchirappalli',
  'tirunelveli','tirupattur','tiruvallur','tiruvannamalai','vellore','viluppuram','virudhunagar'
];

const filePath = path.join(__dirname, '..', 'src', 'data', 'newStatesMockData.js');
const content = fs.readFileSync(filePath, 'utf8');

const keysMatch = content.match(/export const newStatesConstituencyData = \{([\s\S]+?)\};/);
if (keysMatch) {
  const innerText = keysMatch[1];
  const lines = innerText.split('\n');
  const keys = new Set();
  lines.forEach(line => {
    const m = line.match(/^  "([^"]+)"\s*:\s*\[/);
    if (m) keys.add(m[1]);
  });
  
  console.log('Checking TN districts in mock data:');
  TN_DISTRICTS.forEach(d => {
    console.log(`- ${d}: ${keys.has(d) ? 'FOUND' : 'NOT FOUND'}`);
  });
}
