const fs = require('fs');

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
        .replace(/\[\d+\]/g, '') // remove references like [1]
        .replace(/\s+/g, ' ')    // collapse whitespaces
        .trim();
      
      // Find first empty cell in grid[rIdx]
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

async function run() {
  const res = await fetch('https://en.wikipedia.org/wiki/15th_Kerala_Assembly', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = tableRegex.exec(html)) !== null) {
    const tableHtml = match[0];
    if (tableHtml.length > 50000) {
      console.log('Found table! Parsing grid...');
      const grid = parseHtmlTable(match[1]);
      console.log('Grid length:', grid.length);
      console.log('Row 0:', grid[0]);
      console.log('Row 1:', grid[1]);
      console.log('Row 2:', grid[2]);
      
      // Check column index matching
      let constCol = -1, nameCol = -1, partyCol = -1, distCol = -1;
      const row = grid[0] || [];
      row.forEach((cell, idx) => {
        if (/constituency/i.test(cell) || /const\./i.test(cell) || cell === 'Seat') constCol = idx;
        if (/name/i.test(cell) || /member/i.test(cell) || /mla/i.test(cell) || /representative/i.test(cell) || /winner/i.test(cell)) nameCol = idx;
        if (/party/i.test(cell) || cell === 'Party') partyCol = idx;
        if (/district/i.test(cell)) distCol = idx;
      });
      console.log('Matched columns: constituency:', constCol, 'name:', nameCol, 'party:', partyCol, 'district:', distCol);
    }
  }
}

run();
