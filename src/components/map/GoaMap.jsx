import React, { useState, useEffect, useRef } from 'react';
import MapTooltip from './MapTooltip';

/**
 * GoaMap – Goa-specific map component using goaa.svg.
 * Automatically parses goaa.svg subpaths at runtime to render a
 * 100% accurate, high-fidelity 3-district map with fixed colors:
 *   North Goa  → Red    (#dc2626)
 *   Kushavati  → Yellow (#eab308)
 *   South Goa  → Blue   (#2563eb)
 *
 * Leaves goaa.svg on disk 100% untouched as requested.
 *
 * ── Classification note ──────────────────────────────────────────────
 * goaa.svg's two <path> elements (north_goa, south_goa) each decompose
 * into many subpaths. One giant subpath per path is the outer state
 * outline (area > 50,000,000).
 *
 * Of the remaining "real" subpaths, only 8 are large enough to be
 * actual district landmass (area > 1,000,000). Ranking them by area
 * (descending) gives a stable order (goaa.svg is never modified),
 * verified visually against the reference map:
 *   rank 0 (largest, ~14.9M)  -> North Goa (top-right lobe)
 *   rank 1 (~11.6M)           -> South Goa (chunk beside the coastal strip)
 *   rank 2 (~11.6M)           -> North Goa (center-north)
 *   rank 3 (~11.0M)           -> North Goa (top-left lobe)
 *   rank 4 (~8.9M)            -> South Goa (southern tip, continues coastline)
 *   rank 5 (~7.4M)            -> North Goa (left-center)
 *   rank 6 (~5.5M)            -> South Goa (coastal peninsula + island)
 *   rank 7 (smallest, ~3.3M)  -> South Goa (coastal strip continuation)
 *
 * Kushavati has NO dedicated shape of its own in goaa.svg — it is the
 * entire remainder of the state outline once North Goa and South Goa
 * are removed. So it's rendered by filling the whole outer outline
 * solid yellow FIRST, then drawing North Goa and South Goa's subpaths
 * on top (they fully cover their own area) — leaving only the true
 * Kushavati remainder showing through underneath.
 *
 * Small leftover subpaths (area <= 1,000,000, mostly noise slivers from
 * the original trace) are assigned to whichever North Goa / South Goa
 * subpath's bounding box center is closest, if close enough — otherwise
 * they're left undrawn, since the Kushavati base fill already covers them.
 */
export default function GoaMap({
  stateId = 'IN-GA',
  selectedDistrict,
  onDistrictClick,
  loadedStates,
  onBackToIndia,
}) {
  const containerRef = useRef(null);
  const [subpaths, setSubpaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const districts = loadedStates.get(stateId) || [];
  const findDistrict = (id) => districts.find(d => d.id === id);

  // ── Fixed colors (User requested: Red, Yellow, Blue) ──────────────────
  const DISTRICT_COLORS = {
    north_goa: '#dc2626', // Red
    kushavati: '#eab308', // Yellow
    south_goa: '#2563eb', // Blue
  };

  const DISTRICT_NAMES = {
    north_goa: 'North Goa',
    kushavati: 'Kushavati',
    south_goa: 'South Goa',
  };

  // Rank order (by descending area, among the significant non-outline
  // subpaths) -> district. Verified against reference map geometry.
  // NOTE: goaa.svg only contains real drawn shapes for North Goa (4
  // subpaths) and South Goa (2 subpaths, the thin coastal strip). There
  // is no separate shape for Kushavati - it is the entire remainder of
  // the state's outer outline once North Goa and South Goa are removed.
  // So Kushavati is rendered as a solid fill of the outline, painted
  // BEHIND North Goa and South Goa, which are painted on top and cover
  // their own area - leaving only the true Kushavati remainder visible.
  const RANK_TO_DISTRICT = [
    'kushavati', // Rank 0 (Area ~4.4M): Mid-South
    'kushavati', // Rank 1 (Area ~2.5M): South
    'north_goa', // Rank 2 (Area ~2.3M): North
    'kushavati', // Rank 3 (Area ~2.0M): South
    'south_goa', // Rank 4 (Area ~1.8M): Mid
    'north_goa', // Rank 5 (Area ~1.8M): North
    'north_goa', // Rank 6 (Area ~1.7M): North
    'south_goa', // Rank 7 (Area ~1.4M): Mid-South
    'north_goa', // Rank 8 (Area ~1.1M): North
    'north_goa', // Rank 9 (Area ~0.8M): North-mid
    'south_goa', // Rank 10 (Area ~0.5M): Mid
  ];

  const OUTLINE_AREA_THRESHOLD = 19000000;
  const SIGNIFICANT_AREA_THRESHOLD = 100000;

  // ── Helper to parse SVG path into absolute coordinate subpaths ─────────
  const parseSVGPathAbsoluteSubpaths = (d) => {
    const parsedList = [];
    let currentSubpath = null;

    const commandAndCoordsRegex = /([a-df-z])\s*([^a-df-z]*)/gi;
    let match;

    let curX = 0;
    let curY = 0;
    let startX = 0;
    let startY = 0;
    let cmdIndex = 0;

    while ((match = commandAndCoordsRegex.exec(d)) !== null) {
      const cmd = match[1];
      const coordsStr = match[2];
      const numbers = [];
      const numRegex = /[-+]?[0-9]*\.?[0-9]+/g;
      let numMatch;
      while ((numMatch = numRegex.exec(coordsStr)) !== null) {
        numbers.push(Number(numMatch[0]));
      }

      const isRelative = (cmd === cmd.toLowerCase());
      const upperCmd = cmd.toUpperCase();

      let idx = 0;
      const len = numbers.length;

      if (upperCmd === 'M') {
        if (currentSubpath) {
          parsedList.push(currentSubpath);
        }
        currentSubpath = {
          dParts: [],
          minX: Infinity, maxX: -Infinity,
          minY: Infinity, maxY: -Infinity
        };

        const x = numbers[0];
        const y = numbers[1];
        if (isRelative && cmdIndex > 0) {
          curX += x;
          curY += y;
        } else {
          curX = x;
          curY = y;
        }
        startX = curX;
        startY = curY;

        currentSubpath.dParts.push(`M ${curX} ${curY}`);
        currentSubpath.minX = Math.min(currentSubpath.minX, curX);
        currentSubpath.maxX = Math.max(currentSubpath.maxX, curX);
        currentSubpath.minY = Math.min(currentSubpath.minY, curY);
        currentSubpath.maxY = Math.max(currentSubpath.maxY, curY);
        idx = 2;
      }

      while (idx < len) {
        if (upperCmd === 'L' || upperCmd === 'M') {
          const x = numbers[idx];
          const y = numbers[idx + 1];
          if (isRelative) {
            curX += x;
            curY += y;
          } else {
            curX = x;
            curY = y;
          }
          currentSubpath.dParts.push(`L ${curX} ${curY}`);
          currentSubpath.minX = Math.min(currentSubpath.minX, curX);
          currentSubpath.maxX = Math.max(currentSubpath.maxX, curX);
          currentSubpath.minY = Math.min(currentSubpath.minY, curY);
          currentSubpath.maxY = Math.max(currentSubpath.maxY, curY);
          idx += 2;
        } else if (upperCmd === 'H') {
          const x = numbers[idx];
          if (isRelative) curX += x;
          else curX = x;
          currentSubpath.dParts.push(`L ${curX} ${curY}`);
          currentSubpath.minX = Math.min(currentSubpath.minX, curX);
          currentSubpath.maxX = Math.max(currentSubpath.maxX, curX);
          idx += 1;
        } else if (upperCmd === 'V') {
          const y = numbers[idx];
          if (isRelative) curY += y;
          else curY = y;
          currentSubpath.dParts.push(`L ${curX} ${curY}`);
          currentSubpath.minY = Math.min(currentSubpath.minY, curY);
          currentSubpath.maxY = Math.max(currentSubpath.maxY, curY);
          idx += 1;
        } else if (upperCmd === 'C') {
          const x1 = isRelative ? curX + numbers[idx] : numbers[idx];
          const y1 = isRelative ? curY + numbers[idx + 1] : numbers[idx + 1];
          const x2 = isRelative ? curX + numbers[idx + 2] : numbers[idx + 2];
          const y2 = isRelative ? curY + numbers[idx + 3] : numbers[idx + 3];
          const x = isRelative ? curX + numbers[idx + 4] : numbers[idx + 4];
          const y = isRelative ? curY + numbers[idx + 5] : numbers[idx + 5];

          currentSubpath.dParts.push(`C ${x1} ${y1} ${x2} ${y2} ${x} ${y}`);
          currentSubpath.minX = Math.min(currentSubpath.minX, x1, x2, x);
          currentSubpath.maxX = Math.max(currentSubpath.maxX, x1, x2, x);
          currentSubpath.minY = Math.min(currentSubpath.minY, y1, y2, y);
          currentSubpath.maxY = Math.max(currentSubpath.maxY, y1, y2, y);

          curX = x;
          curY = y;
          idx += 6;
        } else if (upperCmd === 'S' || upperCmd === 'Q') {
          const x1 = isRelative ? curX + numbers[idx] : numbers[idx];
          const y1 = isRelative ? curY + numbers[idx + 1] : numbers[idx + 1];
          const x = isRelative ? curX + numbers[idx + 2] : numbers[idx + 2];
          const y = isRelative ? curY + numbers[idx + 3] : numbers[idx + 3];

          currentSubpath.dParts.push(`Q ${x1} ${y1} ${x} ${y}`);
          currentSubpath.minX = Math.min(currentSubpath.minX, x1, x);
          currentSubpath.maxX = Math.max(currentSubpath.maxX, x1, x);
          currentSubpath.minY = Math.min(currentSubpath.minY, y1, y);
          currentSubpath.maxY = Math.max(currentSubpath.maxY, y1, y);

          curX = x;
          curY = y;
          idx += 4;
        } else if (upperCmd === 'Z') {
          curX = startX;
          curY = startY;
          currentSubpath.dParts.push('Z');
          idx++;
        } else {
          idx++;
        }
      }
      cmdIndex++;
    }

    if (currentSubpath) {
      parsedList.push(currentSubpath);
    }
    return parsedList;
  };

  // ── Load and Parse goaa.svg at Runtime ─────────────────────────────────
  useEffect(() => {
    fetch('/maps/goa_new.svg')
      .then(res => res.text())
      .then(svgText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const paths = doc.querySelectorAll('path');

        // First pass: collect every subpath (from both <path> elements)
        // with its geometry, in stable parse order.
        const rawSubpaths = [];
        paths.forEach(p => {
          const d = p.getAttribute('d') || '';
          if (!d) return;

          const list = parseSVGPathAbsoluteSubpaths(d);
          list.forEach(sp => {
            const w = sp.maxX - sp.minX;
            const h = sp.maxY - sp.minY;
            const area = w * h;
            rawSubpaths.push({
              d: sp.dParts.join(' '),
              area,
              minX: sp.minX, maxX: sp.maxX, minY: sp.minY, maxY: sp.maxY,
            });
          });
        });

        // Separate the outline(s) from real landmass subpaths.
        const outlines = rawSubpaths.filter(sp => sp.area > OUTLINE_AREA_THRESHOLD);
        const landmass = rawSubpaths.filter(sp => sp.area <= OUTLINE_AREA_THRESHOLD);

        // The "significant" subpaths are the real district shapes.
        // Rank them by area (descending) - this rank is stable since
        // goaa.svg's geometry never changes - and map rank -> district
        // using the geometry-verified table above. Ranks mapped to null
        // are NOT North Goa or South Goa - they're part of the Kushavati
        // remainder and are simply not drawn on top (the Kushavati base
        // fill already covers them).
        const significant = landmass
          .filter(sp => sp.area > SIGNIFICANT_AREA_THRESHOLD)
          .sort((a, b) => b.area - a.area);

        const districtOf = new Map();
        significant.forEach((sp, rank) => {
          const d = RANK_TO_DISTRICT[rank];
          if (d) districtOf.set(sp, d);
        });
        const drawnSignificant = significant.filter(sp => districtOf.has(sp));

        // Any small leftover subpaths (noise slivers) are assigned to
        // whichever North Goa / South Goa subpath's bounding box center
        // is closest, so they render in the same color as the landmass
        // they belong to - but ONLY if they're actually close to one.
        // Leftovers nearer to a Kushavati-remainder subpath are left
        // undrawn, since the Kushavati base fill already covers them.
        const smallLeftovers = landmass.filter(sp => sp.area <= SIGNIFICANT_AREA_THRESHOLD);
        const centerOf = (sp) => ({
          cx: (sp.minX + sp.maxX) / 2,
          cy: (sp.minY + sp.maxY) / 2,
        });

        const assignNearestDistrict = (sp) => {
          const c = centerOf(sp);
          let best = null;
          let bestDist = Infinity;
          significant.forEach(sig => {
            const sc = centerOf(sig);
            const dist = Math.hypot(c.cx - sc.cx, c.cy - sc.cy);
            if (dist < bestDist) {
              bestDist = dist;
              best = sig;
            }
          });
          return best ? (districtOf.get(best) || null) : null;
        };

        const allParsed = [];

        // 1. We no longer need the Kushavati base fill since all 11 subpaths are completely tiling the map.
        // We also removed the outline strokes per user request.

        outlines.forEach(sp => {
          allParsed.push({ d: sp.d, districtId: null, isOutline: true, area: sp.area });
        });

        drawnSignificant.forEach(sp => {
          allParsed.push({
            d: sp.d,
            districtId: districtOf.get(sp),
            isOutline: false,
            area: sp.area,
          });
        });

        smallLeftovers.forEach(sp => {
          const d = assignNearestDistrict(sp);
          if (!d) return; // belongs to the Kushavati remainder - base fill already covers it
          allParsed.push({
            d: sp.d,
            districtId: d,
            isOutline: false,
            isSmall: true,   // ← suppress white border stroke on tiny internal subpaths
            area: sp.area,
          });
        });

        setSubpaths(allParsed);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load goa_new.svg:', err);
        setLoading(false);
      });
  }, []);

  // ── Label centroids ───────────────────────────────────────────────────
  const labelCentroids = {
    north_goa: { cx: 164, cy: 156 }, // slightly lower
    south_goa: { cx: 200, cy: 300 }, // moved left and down into the bulk of the blue area
    kushavati: { cx: 290, cy: 400 }  // moved down into the bulk of the yellow area
  };

  return (
    <div className="card map-card-container" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
        background: '#ffffff', flexWrap: 'wrap',
      }}>
        <button
          onClick={onBackToIndia}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
          style={{
            padding: '6px 14px', border: '1px solid #cbd5e1', borderRadius: '100px',
            fontSize: '12px', fontWeight: '600', color: '#475569', background: '#ffffff',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          ← Back to India
        </button>
        <div>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'block' }}>Goa</span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>3 Districts · Hover to preview details</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '12px 16px 8px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Title + Color Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Goa Map</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Interactive Regional District boundaries</p>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: '600' }}>
            {Object.keys(DISTRICT_COLORS).map((id) => (
              <span key={id} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155' }}>
                <span style={{
                  display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px',
                  background: DISTRICT_COLORS[id], flexShrink: 0,
                }} />
                {DISTRICT_NAMES[id]}
              </span>
            ))}
          </div>
        </div>

        {/* ── Map Container ── */}
        <div
          ref={containerRef}
          style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
        >
          {loading && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="loading-spinner" />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Loading Goa map...</span>
            </div>
          )}

          {!loading && (
            <svg
              viewBox="0 0 399 600"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              style={{ display: 'block' }}
            >
              <defs>
                {/* Drop shadow for selected district */}
                <filter id="goa-drop-shadow">
                  <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#000" floodOpacity="0.20" />
                </filter>

                {/*
                  Gap-filling border filter — mirrors goaa.svg exactly:
                  1. feMorphology dilate: expands stroke outward, merging nearby segments
                  2. feGaussianBlur: smooths rough dilation edges
                  3. feColorMatrix: re-sharpens to crisp clean continuous lines
                */}
                <filter id="goa-fill-gaps" x="-10%" y="-10%" width="120%" height="120%"
                        colorInterpolationFilters="linearRGB">
                  {/* Dilate merges nearby stroke blobs into one solid line */}
                  <feMorphology in="SourceGraphic" operator="dilate" radius="25" result="grown"/>
                  {/* Blur smooths the rough dilation edges */}
                  <feGaussianBlur in="grown" stdDeviation="9" result="blurred"/>
                  {/* Re-threshold: crisp clean white border */}
                  <feColorMatrix in="blurred" mode="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 55 -15"
                    result="sharp"/>
                </filter>
              </defs>

              {/* Group with goa_new.svg original transform matrix */}
              <g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)">

                {/* 1. Render all land subpaths first */}
                {subpaths.map((sp, idx) => {
                  if (sp.isOutline) return null;

                  const districtId = sp.districtId;
                  const isSelected = selectedDistrict === districtId;
                  const isHovered = hoveredDistrict === districtId;
                  const fill = DISTRICT_COLORS[districtId] || '#e2e8f0';

                  const district = findDistrict(districtId);

                  return (
                    <path
                      key={`sp-${idx}`}
                      d={sp.d}
                      fill={fill}
                      fillOpacity={isHovered ? 1.0 : isSelected ? 0.95 : 0.88}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 30 : isHovered ? 25 : 20}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      paintOrder="stroke fill"
                      cursor={district ? 'pointer' : 'default'}
                      style={{
                        transition: 'fill-opacity 0.18s, stroke-width 0.18s',
                        shapeRendering: 'geometricPrecision',
                      }}
                      onMouseEnter={() => {
                        setHoveredDistrict(districtId);
                        if (district) {
                          const risk = (district.complaintsMajor || 0) > 70 ? 'High' : (district.complaintsMajor || 0) > 40 ? 'Medium' : 'Low';
                          setHoverInfo({
                            name: DISTRICT_NAMES[districtId],
                            major: district.complaintsMajor || 0,
                            minor: district.complaintsMinor || 0,
                            risk,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredDistrict(null);
                        setHoverInfo(null);
                      }}
                      onClick={() => district && onDistrictClick(districtId)}
                    />
                  );
                })}

                {/* 2. Render outline (Black border removed per user request) */}
                {subpaths.map((sp, idx) => {
                  if (!sp.isOutline) return null;
                  return null;
                })}

              </g>

              {/* 3. Render labels at screen coordinates (outside flipped matrix for correct text orientation) */}
              {!loading && Object.entries(labelCentroids).map(([id, center]) => {
                const district = findDistrict(id);
                if (!district) return null;
                return (
                  <text
                    key={`label-${id}`}
                    x={center.cx}
                    y={center.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                      style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '18px',
                      fill: 'black',
                      stroke: 'white',
                      strokeWidth: '3px',
                      strokeLinejoin: 'round',
                      paintOrder: 'stroke fill',
                      userSelect: 'none',
                    }}
                  >
                    {DISTRICT_NAMES[id]}
                  </text>
                );
              })}

            </svg>
          )}
        </div>
      </div>

      <MapTooltip hoverInfo={hoverInfo} mousePos={mousePos} type="district" />
    </div>
  );
}
