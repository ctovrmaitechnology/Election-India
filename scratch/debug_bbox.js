const fs = require('fs');
const path = require('path');

const svgText = fs.readFileSync(path.join(__dirname, '..', 'public', 'maps', 'india.svg'), 'utf8');

const pathRegex = /<path([\s\S]*?)\/>/g;
let m;
while ((m = pathRegex.exec(svgText)) !== null) {
  const attrs = m[1];
  const idMatch = attrs.match(/id="([^"]+)"/);
  if (idMatch && idMatch[1] === 'an') {
    const dMatch = attrs.match(/d="([\s\S]*?)"/);
    if (dMatch) {
      const d = dMatch[1];
      console.log('--- Original d attribute sample ---');
      console.log(d.substring(0, 150));
      
      const commandRegex = /[a-df-z]/gi;
      const commands = d.match(commandRegex) || [];
      const commandCoords = d.split(commandRegex);
      
      console.log('Commands count:', commands.length);
      console.log('CommandCoords count:', commandCoords.length);
      console.log('First 5 commands:', commands.slice(0, 5));
      console.log('First 5 commandCoords raw:', commandCoords.slice(0, 5));
      
      if (commandCoords[0] === '') commandCoords.shift();
      console.log('After shift, CommandCoords count:', commandCoords.length);
      
      const coordsStr = commandCoords[0];
      const numbers = [];
      const numRegex = /[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g;
      let numMatch;
      while ((numMatch = numRegex.exec(coordsStr)) !== null) {
        numbers.push(Number(numMatch[0]));
      }
      console.log('First command numbers:', numbers);
      break;
    }
  }
}
