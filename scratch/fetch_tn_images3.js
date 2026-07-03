// fetch_tn_images3.js – final pass for remaining TN districts
const https = require('https');

const TN_DISTRICTS3 = {
  salem:          'Salem, Tamil Nadu',
  tanjavur:       'Thanjavur',
  theni:          'Theni',
  thiruvarur:     'Thiruvarur',
  tiruppur:       'Tiruppur',
  thoothukudi:    'Thoothukudi',
  tiruchirappalli:'Tiruchirappalli',
  tirunelveli:    'Tirunelveli',
  tirupattur:     'Tirupattur',
  tiruvallur:     'Tiruvallur',
  tiruvannamalai: 'Tiruvannamalai',
  vellore:        'Vellore',
  viluppuram:     'Villupuram',
  virudhunagar:   'Virudhunagar',
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
  for (const [id, title] of Object.entries(TN_DISTRICTS3)) {
    const url = await fetchThumb(title);
    console.log(`  ${id.padEnd(16)}: ${url ? `'${url}',` : '// NOT FOUND'}`);
    await new Promise(r => setTimeout(r, 150));
  }
}

main();
