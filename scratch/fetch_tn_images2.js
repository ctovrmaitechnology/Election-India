// fetch_tn_images2.js – second pass for districts that didn't resolve
const https = require('https');

const TN_DISTRICTS2 = {
  nagapattinam:   'Nagapattinam district',
  namakkal:       'Namakkal district',
  nilgiris:       'Nilgiris district',
  perambalur:     'Perambalur district',
  pudukkottai:    'Pudukkottai district',
  ramanathapuram: 'Pamban Bridge',
  ranipet:        'Ranipet district',
  salem:          'Salem district, Tamil Nadu',
  sivagangai:     'Sivaganga district',
  tenkasi:        'Tenkasi district',
  tanjavur:       'Brihadisvara Temple, Thanjavur',
  theni:          'Theni district',
  thiruvarur:     'Thiruvarur district',
  tiruppur:       'Tiruppur district',
  thoothukudi:    'Thoothukudi district',
  tiruchirappalli:'Rock Fort, Tiruchirappalli',
  tirunelveli:    'Tirunelveli district',
  tirupattur:     'Tirupattur district',
  tiruvallur:     'Tiruvallur district',
  tiruvannamalai: 'Tiruvannamalai',
  vellore:        'Vellore Fort',
  viluppuram:     'Gingee Fort',
  virudhunagar:   'Virudhunagar district',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'TN-District-Image-Fetcher/1.0' }
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
  for (const [id, title] of Object.entries(TN_DISTRICTS2)) {
    const url = await fetchThumb(title);
    results[id] = url;
    console.log(`  ${id}: ${url ? '✓' : '✗'} ${url || '(not found)'}`);
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('\n--- PASTE INTO DistrictCard.jsx ---\n');
  for (const [id, url] of Object.entries(results)) {
    if (url) console.log(`  ${id.padEnd(16)}: '${url}',`);
    else      console.log(`  // ${id}: NOT FOUND`);
  }
}

main();
