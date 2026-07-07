const fs = require('fs');
const svg = fs.readFileSync('public/goa_map.svg', 'utf8');

// Extract all paths
const pathRegex = /<path\s+id=\"([^\"]+)\"\s+class=\"[^\"]+\"\s+data-taluka=\"([^\"]+)\"\s+d=\"([^\"]+)\"\s+fill=\"[^\"]+\"\s+stroke=\"[^\"]+\"\s+stroke-width=\"([^\"]+)\"\s+stroke-linejoin=\"([^\"]+)\"\s+stroke-linecap=\"([^\"]+)\"\/>/g;
let match;
const paths = [];
while ((match = pathRegex.exec(svg)) !== null) {
  paths.push({
    id: match[1],
    taluka: match[2],
    d: match[3]
  });
}

const componentCode = `
import React, { useState, useRef, useMemo } from 'react';
import MapTooltip from './MapTooltip';

const TALUKA_COLORS = {
  'pernem': '#f59e0b',
  'bardez': '#3b82f6',
  'bicholim': '#10b981',
  'satari': '#ec4899',
  'tiswadi': '#ef4444',
  'mormugao': '#8b5cf6',
  'ponda': '#f97316',
  'dharbandora': '#14b8a6',
  'salcette': '#6366f1',
  'sanguem': '#84cc16',
  'quepem': '#d946ef',
  'canacona': '#eab308'
};

const TALUKA_DISPLAY_NAMES = {
  'pernem': 'Pernem',
  'bardez': 'Bardez',
  'bicholim': 'Bicholim',
  'satari': 'Satari',
  'tiswadi': 'Tiswadi',
  'mormugao': 'Mormugao',
  'ponda': 'Ponda',
  'dharbandora': 'Dharbandora',
  'salcette': 'Salcette',
  'sanguem': 'Sanguem',
  'quepem': 'Quepem',
  'canacona': 'Canacona'
};

// Tweaks for label placement
const TWEAKS = {
  'mormugao': { dx: 15, dy: 10 },
  'bardez': { dx: -10, dy: 5 },
  'tiswadi': { dx: 5, dy: -5 },
  'quepem': { dx: 10, dy: -15 },
  'sanguem': { dx: -10, dy: 10 },
  'satari': { dx: 10, dy: 5 }
};

const GOA_PATHS = ${JSON.stringify(paths, null, 2)};

export default function GoaMap({ onTalukaClick }) {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // We need to calculate bounding boxes after render to place labels.
  // For React inline SVG, we can either use ref to calculate them on mount, or roughly hardcode centers.
  // Let's use a ref and effect to place labels.
  const [labelPositions, setLabelPositions] = useState({});

  React.useEffect(() => {
    if (!svgRef.current) return;
    const pathEls = svgRef.current.querySelectorAll('path');
    const positions = {};
    pathEls.forEach(p => {
      const id = p.getAttribute('id');
      const bbox = p.getBBox();
      let cx = bbox.x + bbox.width / 2;
      let cy = bbox.y + bbox.height / 2;
      if (TWEAKS[id]) {
        cx += TWEAKS[id].dx;
        cy += TWEAKS[id].dy;
      }
      positions[id] = { x: cx, y: cy };
    });
    setLabelPositions(positions);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 670.76 1000.00" 
        width="100%" 
        height="100%"
        style={{ maxWidth: '100%', maxHeight: '100%', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.15))' }}
      >
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eaf5fc"/>
            <stop offset="100%" stopColor="#cfe6f5"/>
          </linearGradient>
        </defs>
        <rect x="-50" y="-50" width="850" height="1150" fill="url(#seaGrad)"/>
        <g>
          {GOA_PATHS.map((path) => {
            const isHovered = hoverInfo && hoverInfo.talukaId === path.id;
            return (
              <path
                key={path.id}
                id={path.id}
                d={path.d}
                fill={TALUKA_COLORS[path.id] || '#cbd5e1'}
                stroke="#ffffff"
                strokeWidth={isHovered ? "2.5" : "1"}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'brightness(1.15) drop-shadow(0 4px 10px rgba(0,0,0,0.25))' : 'none'
                }}
                onMouseEnter={(e) => {
                  setHoverInfo({ name: TALUKA_DISPLAY_NAMES[path.id], talukaId: path.id });
                  handleMouseMove(e);
                  // bring to front hack in react: not easily doable without reordering array, 
                  // but strokeWidth change and filter is usually enough.
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverInfo(null)}
                onClick={() => onTalukaClick && onTalukaClick(path.id, TALUKA_DISPLAY_NAMES[path.id])}
              />
            );
          })}
          {/* Render labels on top of all paths */}
          {Object.keys(labelPositions).map(id => (
            <text
              key={\`label-\${id}\`}
              x={labelPositions[id].x}
              y={labelPositions[id].y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                pointerEvents: 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                fill: '#ffffff',
                userSelect: 'none',
                textShadow: '0px 1px 3px rgba(0,0,0,0.6), 0px 2px 8px rgba(0,0,0,0.4)'
              }}
            >
              {TALUKA_DISPLAY_NAMES[id]}
            </text>
          ))}
        </g>
      </svg>
      {hoverInfo && (
        <MapTooltip 
          info={hoverInfo}
          x={mousePos.x}
          y={mousePos.y}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/map/GoaMap.jsx', componentCode);
console.log('Successfully embedded SVG into GoaMap.jsx. Total paths:', paths.length);
