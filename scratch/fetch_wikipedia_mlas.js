/**
 * fetch_wikipedia_mlas.js
 * Scrapes Wikipedia pages for the MLAs and constituencies of 18 missing states.
 * Saves results to scratch/fetched_mlas.json.
 */

const fs = require('fs');
const path = require('path');

const MISSING_STATES = {
  'IN-KL': { name: 'Kerala', page: '15th_Kerala_Assembly' },
  'IN-TG': { name: 'Telangana', page: '2023_Telangana_Legislative_Assembly_election' },
  'IN-AP': { name: 'Andhra Pradesh', page: '16th_Andhra_Pradesh_Legislative_Assembly' },
  'IN-BR': { name: 'Bihar', page: '18th_Bihar_Legislative_Assembly' },
  'IN-UP': { name: 'Uttar Pradesh', page: '18th_Uttar_Pradesh_Legislative_Assembly' },
  'IN-PB': { name: 'Punjab', page: '16th_Punjab_Legislative_Assembly' },
  'IN-HR': { name: 'Haryana', page: '15th_Haryana_Legislative_Assembly' },
  'IN-HP': { name: 'Himachal Pradesh', page: '14th_Himachal_Pradesh_Legislative_Assembly' },
  'IN-UT': { name: 'Uttarakhand', page: '5th_Uttarakhand_Legislative_Assembly' },
  'IN-AS': { name: 'Assam', page: '15th_Assam_Legislative_Assembly' },
  'IN-TR': { name: 'Tripura', page: '13th_Tripura_Legislative_Assembly' },
  'IN-MN': { name: 'Manipur', page: '12th_Manipur_Legislative_Assembly' },
  'IN-ML': { name: 'Meghalaya', page: '11th_Meghalaya_Legislative_Assembly' },
  'IN-MZ': { name: 'Mizoram', page: '9th_Mizoram_Legislative_Assembly' },
  'IN-NL': { name: 'Nagaland', page: '14th_Nagaland_Legislative_Assembly' },
  'IN-AR': { name: 'Arunachal Pradesh', page: '8th_Arunachal_Pradesh_Legislative_Assembly' },
  'IN-SK': { name: 'Sikkim', page: '11th_Sikkim_Legislative_Assembly' },
  'IN-JK': { name: 'Jammu and Kashmir', page: 'Jammu_and_Kashmir_Legislative_Assembly' }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function parseHtmlTable(tableHtml) {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  
  const grid = [];
  let rIdx = 0;
  let rowMatch;
  
  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    let cIdx = 0;
    let cellMatch;
    
    if (!grid[rIdx]) grid[rIdx] = [];
    cellRegex.lastIndex = 0;
    
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellTagHtml = cellMatch[0];
      const cellInnerHtml = cellMatch[1];
      
      const rowspanMatch = cellTagHtml.match(/rowspan=["']?(\d+)["']?/i);
      const colspanMatch = cellTagHtml.match(/colspan=["']?(\d+)["']?/i);
      
      const rowspan = rowspanMatch ? parseInt(rowspanMatch[1], 10) : 1;
      const colspan = colspanMatch ? parseInt(colspanMatch[1], 10) : 1;
      
      const cleanText = cellInnerHtml
        .replace(/<[^>]+>/g, '') // remove HTML tags
        .replace(/\[\d+\]/g, '') // remove references
        .replace(/\s+/g, ' ')    // collapse whitespaces
        .trim();
      
      while (grid[rIdx][cIdx] !== undefined) {
        cIdx++;
      }
      
      for (let r = 0; r < rowspan; r++) {
        if (!grid[rIdx + r]) grid[rIdx + r] = [];
        for (let c = 0; c < colspan; c++) {
          grid[rIdx + r][cIdx + c] = cleanText;
        }
      }
      cIdx += colspan;
    }
    rIdx++;
  }
  return grid;
}

function extractMemberTable(html, stateId) {
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  let bestResults = null;
  let maxCount = 0;
  
  while ((match = tableRegex.exec(html)) !== null) {
    const tableHtml = match[0];
    const tableBody = match[1];
    
    if (!tableHtml.includes('class="wikitable') && !tableHtml.includes("class='wikitable")) {
      continue;
    }
    
    const grid = parseHtmlTable(tableBody);
    if (grid.length < 5) continue;
    
    let constCol = -1;
    let nameCol = -1;
    let partyCol = -1;
    let distCol = -1;
    
    const searchLimit = Math.min(grid.length, 5);
    
    // 1. Find District
    for (let r = 0; r < searchLimit; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (/district/i.test(grid[r][c])) {
          distCol = c;
          break;
        }
      }
      if (distCol !== -1) break;
    }
    
    // 2. Find Constituency
    for (let r = 0; r < searchLimit; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const val = grid[r][c];
        if (/constituency/i.test(val) || /const\./i.test(val) || val === 'Seat') {
          if (r + 1 < grid.length && (/^no\.?$/i.test(grid[r+1][c]) || grid[r+1][c] === '#')) {
            continue;
          }
          constCol = c;
          break;
        }
      }
      if (constCol !== -1) break;
    }
    if (constCol === -1) {
      for (let r = 0; r < searchLimit; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] === 'Name' && grid[r][c-1] === 'No.') {
            constCol = c;
            break;
          }
        }
        if (constCol !== -1) break;
      }
    }
    
    // 3. Find MLA Name
    for (let r = 0; r < searchLimit; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const val = grid[r][c].toLowerCase();
        if ((val.includes('candidate') || val.includes('winner') || val.includes('member') || val.includes('mla') || val.includes('representative')) && c !== constCol) {
          nameCol = c;
          break;
        }
      }
      if (nameCol !== -1) break;
    }
    if (nameCol === -1) {
      for (let r = 0; r < searchLimit; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (/name/i.test(grid[r][c]) && c !== constCol) {
            nameCol = c;
            break;
          }
        }
        if (nameCol !== -1) break;
      }
    }
    
    // 4. Find Party
    for (let r = 0; r < searchLimit; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (/party/i.test(grid[r][c]) || grid[r][c] === 'Party') {
          partyCol = c;
          break;
        }
      }
      if (partyCol !== -1) break;
    }
    
    if (constCol !== -1 && nameCol !== -1 && partyCol !== -1) {
      const results = [];
      for (let i = 1; i < grid.length; i++) {
        const row = grid[i];
        if (!row) continue;
        
        const maxCol = Math.max(constCol, nameCol, partyCol, distCol);
        if (row.length <= maxCol) continue;
        
        let constituency = row[constCol];
        let mla = row[nameCol];
        let party = row[partyCol];
        const district = distCol !== -1 ? row[distCol] : '';
        
        if (!party && partyCol + 1 < row.length) party = row[partyCol + 1];
        if (!mla && nameCol + 1 < row.length) mla = row[nameCol + 1];
        
        if (!constituency || !mla || !party) continue;
        
        // Skip header repetitions
        const cLower = constituency.toLowerCase();
        const mLower = mla.toLowerCase();
        const pLower = party.toLowerCase();
        if (cLower === 'constituency' || cLower === 'constituency name' || mLower === 'name' || mLower === 'member name' || mLower === 'candidate' || pLower === 'party' || cLower === 'seat') {
          continue;
        }
        
        results.push({
          district,
          constituency,
          mla,
          party
        });
      }
      
      if (results.length > maxCount) {
        maxCount = results.length;
        bestResults = results;
      }
    }
  }
  return bestResults;
}

async function searchWikipediaPage(stateName) {
  const query = `List of members of the ${stateName} Legislative Assembly`;
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ElectionCampaignDashboardBot/1.0 (admin@electioncampaigndash.org)' } });
    const data = await res.json();
    if (data.query?.search?.length > 0) {
      return data.query.search[0].title;
    }
  } catch (err) {
    console.error(`Search failed for ${stateName}:`, err.message);
  }
  return null;
}

async function fetchPageWithFallback(stateId, stateName, initialPage) {
  let page = initialPage;
  let url = `https://en.wikipedia.org/wiki/${page}`;
  console.log(`[${stateId}] Fetching ${url}...`);
  
  try {
    let res = await fetch(url, { headers: { 'User-Agent': 'ElectionCampaignDashboardBot/1.0 (admin@electioncampaigndash.org)' } });
    if (res.status === 404) {
      console.log(`[${stateId}] 404. Searching Wikipedia...`);
      const searchTitle = await searchWikipediaPage(stateName);
      if (searchTitle) {
        page = searchTitle.replace(/\s+/g, '_');
        url = `https://en.wikipedia.org/wiki/${page}`;
        console.log(`[${stateId}] Found: ${searchTitle}. Fetching ${url}...`);
        res = await fetch(url, { headers: { 'User-Agent': 'ElectionCampaignDashboardBot/1.0 (admin@electioncampaigndash.org)' } });
      }
    }
    
    if (res.status === 200) {
      const html = await res.text();
      const mlas = extractMemberTable(html, stateId);
      if (mlas && mlas.length > 5) {
        console.log(`[${stateId}] Successfully extracted ${mlas.length} MLAs`);
        return mlas;
      }
      
      console.log(`[${stateId}] No matching table in ${page}. Trying search fallback...`);
      const searchTitle = await searchWikipediaPage(stateName);
      if (searchTitle && searchTitle.replace(/\s+/g, '_') !== page) {
        page = searchTitle.replace(/\s+/g, '_');
        url = `https://en.wikipedia.org/wiki/${page}`;
        console.log(`[${stateId}] Fetching search fallback: ${url}...`);
        const res2 = await fetch(url, { headers: { 'User-Agent': 'ElectionCampaignDashboardBot/1.0 (admin@electioncampaigndash.org)' } });
        if (res2.status === 200) {
          const html2 = await res2.text();
          const mlas2 = extractMemberTable(html2, stateId);
          if (mlas2 && mlas2.length > 5) {
            console.log(`[${stateId}] Successfully extracted ${mlas2.length} MLAs from fallback`);
            return mlas2;
          }
        }
      }
    }
  } catch (err) {
    console.error(`[${stateId}] Error:`, err.message);
  }
  
  console.log(`[${stateId}] Failed to fetch MLA list.`);
  return null;
}

async function main() {
  const allFetched = {};
  
  for (const [stateId, info] of Object.entries(MISSING_STATES)) {
    const mlas = await fetchPageWithFallback(stateId, info.name, info.page);
    if (mlas) {
      allFetched[stateId] = mlas;
    }
    await delay(1000);
  }
  
  const destFile = path.join(__dirname, 'fetched_mlas.json');
  fs.writeFileSync(destFile, JSON.stringify(allFetched, null, 2), 'utf8');
  console.log(`\nCompleted fetching. Saved results to ${destFile}`);
}

main().catch(err => console.error(err));
module.exports = { parseHtmlTable };
