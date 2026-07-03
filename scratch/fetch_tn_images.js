// fetch_tn_images.js
// Fetches the main Wikipedia thumbnail URL for each Tamil Nadu district landmark.
// Run: node scratch/fetch_tn_images.js

const https = require('https');

// Map district id → Wikipedia article title for that district's iconic landmark/page
const TN_DISTRICTS = {
  dindigul:       'Dindigul',
  erode:          'Erode',
  kanchipuram:    'Kanchipuram',
  kallakurichi:   'Kallakurichi district',
  kanyakumari:    'Kanyakumari',
  karaikal:       'Karaikal',
  karur:          'Karur',
  krishnagiri:    'Krishnagiri district',
  madurai:        'Madurai',
  mayiladuthurai: 'Mayiladuthurai',
  nagapattinam:   'Nagapattinam',
  namakkal:       'Namakkal',
  nilgiris:       'Ooty',
  perambalur:     'Perambalur',
  pudukkottai:    'Pudukkottai',
  ramanathapuram: 'Rameswaram',
  ranipet:        'Ranipet district',
  salem:          'Salem, Tamil Nadu',
  sivagangai:     'Sivaganga district',
  tenkasi:        'Courtallam',
  tanjavur:       'Brihadisvara Temple',
  theni:          'Theni district',
  thiruvarur:     'Thiruvarur',
  tiruppur:       'Tiruppur',
  thoothukudi:    'Thoothukudi',
  tiruchirappalli:'Rockfort',
  tirunelveli:    'Tirunelveli',
  tirupattur:     'Tirupathur district',
  tiruvallur:     'Tiruvallur district',
  tiruvannamalai: 'Arunachalesvarar Temple',
  vellore:        'Vellore Fort',
  viluppuram:     'Gingee Fort',
  virudhunagar:   'Virudhunagar district',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'TN-District-Image-Fetcher/1.0 (election-campaign-app)' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function fetchThumb(title) {
  const encoded = encodeURIComponent(title);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=800&redirects=1`;
  try {
    const json = await fetchJson(url);
    const pages = json.query?.pages || {};
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch(e) {
    return null;
  }
}

async function main() {
  const results = {};
  for (const [id, title] of Object.entries(TN_DISTRICTS)) {
    const url = await fetchThumb(title);
    results[id] = url;
    console.log(`  ${id}: ${url ? '✓' : '✗'} ${url || '(not found)'}`);
    // Small delay to be polite to Wikipedia API
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\n--- PASTE INTO DistrictCard.jsx ---\n');
  for (const [id, url] of Object.entries(results)) {
    if (url) {
      console.log(`  ${id.padEnd(16)}: '${url}',`);
    }
  }
}

main();
