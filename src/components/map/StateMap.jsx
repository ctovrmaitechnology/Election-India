import React, { useState, useEffect, useRef } from 'react';
import { fetchWithRetry, getRiskColor } from '../../utils/helpers';
import MapTooltip from './MapTooltip';

export default function StateMap({
  stateId,
  svgUrl,
  viewBox,
  title,
  pathToDistrict = null,
  selectedDistrict,
  onDistrictClick,
  loadedStates,
  onBackToIndia,
}) {
  const containerRef   = useRef(null);
  const cleanupRef     = useRef(null);
  const loadedRef      = useRef(loadedStates); // keep a live ref so closures see latest value
  const [svgReady, setSvgReady]   = useState(false);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos,  setMousePos]  = useState({ x: 0, y: 0 });

  // Keep ref in sync
  loadedRef.current = loadedStates;

  const districts = loadedStates.get(stateId) || [];
  
  // Calculate relative thresholds per state for balanced, colorful visual distribution
  const complaintTotals = districts.map(d => (d.complaintsMajor || 0) + (d.complaintsMinor || 0)).sort((a, b) => a - b);
  const lowThreshold = complaintTotals.length > 0
    ? complaintTotals[Math.floor(complaintTotals.length * 0.33)]
    : 150;
  const highThreshold = complaintTotals.length > 0
    ? complaintTotals[Math.floor(complaintTotals.length * 0.67)]
    : 400;

  const resolveRiskColor = (total) => {
    if (total > highThreshold) return '#dc2626'; // High Risk (Red)
    if (total > lowThreshold)  return '#eab308'; // Medium Risk (Yellow)
    return '#2563eb';                            // Low Risk (Blue)
  };

  // Legend counts
  const counts = { high: 0, medium: 0, low: 0 };
  districts.forEach(d => {
    const t = (d.complaintsMajor || 0) + (d.complaintsMinor || 0);
    if (t > highThreshold)      counts.high++;
    else if (t > lowThreshold) counts.medium++;
    else                        counts.low++;
  });

  // Helper: SVG path id → district id
  const resolveId = (pathId) =>
    pathToDistrict ? (pathToDistrict[pathId] || null) : pathId;

  // JS-based SVG path bounding box calculator to bypass layout engine
  const getPathBBox = (d) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    const commandRegex = /[a-df-z]/gi;
    const commands = d.match(commandRegex) || [];
    const commandCoords = d.split(commandRegex);
    if (commandCoords[0] === '') commandCoords.shift();

    let curX = 0;
    let curY = 0;

    const updateBBox = (x, y) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const coordsStr = commandCoords[i] || '';
      const numbers = [];
      const numRegex = /[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g;
      let match;
      while ((match = numRegex.exec(coordsStr)) !== null) {
        numbers.push(Number(match[0]));
      }
      
      const isRelative = (cmd === cmd.toLowerCase());
      const upperCmd = cmd.toUpperCase();

      let idx = 0;
      const len = numbers.length;

      if (upperCmd === 'Z') {
        continue;
      }

      while (idx < len) {
        if (upperCmd === 'M' || upperCmd === 'L' || upperCmd === 'T') {
          if (idx + 1 >= len) break;
          const x = numbers[idx];
          const y = numbers[idx + 1];
          if (isRelative) {
            curX += x;
            curY += y;
          } else {
            curX = x;
            curY = y;
          }
          updateBBox(curX, curY);
          idx += 2;
        } else if (upperCmd === 'H') {
          const x = numbers[idx];
          if (isRelative) {
            curX += x;
          } else {
            curX = x;
          }
          updateBBox(curX, curY);
          idx += 1;
        } else if (upperCmd === 'V') {
          const y = numbers[idx];
          if (isRelative) {
            curY += y;
          } else {
            curY = y;
          }
          updateBBox(curX, curY);
          idx += 1;
        } else if (upperCmd === 'C') {
          if (idx + 5 >= len) break;
          const x1 = numbers[idx];
          const y1 = numbers[idx + 1];
          const x2 = numbers[idx + 2];
          const y2 = numbers[idx + 3];
          const x = numbers[idx + 4];
          const y = numbers[idx + 5];

          const absX1 = isRelative ? curX + x1 : x1;
          const absY1 = isRelative ? curY + y1 : y1;
          const absX2 = isRelative ? curX + x2 : x2;
          const absY2 = isRelative ? curY + y2 : y2;
          const absX = isRelative ? curX + x : x;
          const absY = isRelative ? curY + y : y;

          updateBBox(absX1, absY1);
          updateBBox(absX2, absY2);
          updateBBox(absX, absY);

          curX = absX;
          curY = absY;
          idx += 6;
        } else if (upperCmd === 'S' || upperCmd === 'Q') {
          if (idx + 3 >= len) break;
          const x1 = numbers[idx];
          const y1 = numbers[idx + 1];
          const x = numbers[idx + 2];
          const y = numbers[idx + 3];

          const absX1 = isRelative ? curX + x1 : x1;
          const absY1 = isRelative ? curY + y1 : y1;
          const absX = isRelative ? curX + x : x;
          const absY = isRelative ? curY + y : y;

          updateBBox(absX1, absY1);
          updateBBox(absX, absY);

          curX = absX;
          curY = absY;
          idx += 4;
        } else if (upperCmd === 'A') {
          if (idx + 6 >= len) break;
          const x = numbers[idx + 5];
          const y = numbers[idx + 6];

          const absX = isRelative ? curX + x : x;
          const absY = isRelative ? curY + y : y;

          updateBBox(absX, absY);

          curX = absX;
          curY = absY;
          idx += 7;
        } else {
          idx++;
        }
      }
    }

    if (minX === Infinity || minY === Infinity) {
      return null;
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // ─── Load SVG once per svgUrl ─────────────────────────────────────────────
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    setSvgReady(false);
    setLoading(true);
    setError(null);
    setHoverInfo(null);

    fetchWithRetry(svgUrl, { signal })
      .then(r => r.text())
      .then(svgText => {
        if (signal.aborted || !containerRef.current) return;

        // Cleanup previous
        if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
        containerRef.current.replaceChildren();

        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) throw new Error('Invalid SVG');

        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.backgroundColor = 'transparent';
        svg.style.background = 'transparent';

        // Kill background rects & polygons
        svg.querySelectorAll('rect').forEach(r => {
          r.style.fill = 'transparent'; r.style.stroke = 'none'; r.setAttribute('fill', 'transparent');
        });
        svg.querySelectorAll('polygon').forEach(p => p.style.fill = 'transparent');

        // Tooltip mouse position tracking
        let frameId = null;
        const handleMouseMove = e => {
          if (frameId) cancelAnimationFrame(frameId);
          frameId = requestAnimationFrame(() => setMousePos({ x: e.clientX, y: e.clientY }));
        };
        svg.addEventListener('mousemove', handleMouseMove);

        // Touch support
        let hoverPath = null;
        const handleTouchMove = e => {
          if (!e.touches?.length) return;
          const t = e.touches[0];
          setMousePos({ x: t.clientX, y: t.clientY });
          const el = document.elementFromPoint(t.clientX, t.clientY);
          if (el?.tagName === 'path') {
            const dId = resolveId(el.getAttribute('id'));
            const districtsList = loadedRef.current.get(stateId) || [];
            if (dId && districtsList.find(d => d.id === dId)) {
              if (hoverPath !== el) {
                hoverPath?.dispatchEvent(new Event('mouseleave'));
                hoverPath = el;
                hoverPath.dispatchEvent(new MouseEvent('mouseenter', { clientX: t.clientX, clientY: t.clientY, bubbles: true }));
              }
            } else { hoverPath?.dispatchEvent(new Event('mouseleave')); hoverPath = null; }
          } else { hoverPath?.dispatchEvent(new Event('mouseleave')); hoverPath = null; }
        };
        const handleTouchEnd = () => { hoverPath?.dispatchEvent(new Event('mouseleave')); hoverPath = null; };
        svg.addEventListener('touchmove', handleTouchMove, { passive: true });
        svg.addEventListener('touchend', handleTouchEnd);

        // ── Style each path ───────────────────────────────────────────────
        const listeners = [];
        svg.querySelectorAll('path').forEach(path => {
          const pathId = path.getAttribute('id');
          const districtId = resolveId(pathId);

          // Use loadedRef to get live district data
          const districtsList = loadedRef.current.get(stateId) || [];
          const district = districtsList.find(d => d.id === districtId);

          if (!district) {
            path.style.fill = 'transparent';
            path.style.stroke = '#dde3ec';
            path.style.strokeWidth = '0.8px';
            path.style.pointerEvents = 'none';
            return;
          }

          const totalComplaints = (district.complaintsMajor || 0) + (district.complaintsMinor || 0);
          path.style.fill = resolveRiskColor(totalComplaints);
          path.style.stroke = '#ffffff';
          path.style.strokeWidth = '2.5px';
          path.style.cursor = 'pointer';
          path.style.transition = 'fill 0.2s, filter 0.2s, stroke-width 0.2s';

          const onEnter = e => {
            path.style.filter = 'brightness(1.2) drop-shadow(0 4px 10px rgba(0,0,0,0.28))';
            path.style.strokeWidth = '4px';
            const risk = totalComplaints > highThreshold ? 'High' : totalComplaints > lowThreshold ? 'Medium' : 'Low';
            setHoverInfo({ name: district.name, major: district.complaintsMajor || 0, minor: district.complaintsMinor || 0, risk });
            setMousePos({ x: e.clientX, y: e.clientY });
          };
          const onLeave = () => {
            path.style.filter = 'none';
            path.style.strokeWidth = '2.5px';
            setHoverInfo(null);
          };
          const onClick = () => onDistrictClick(districtId);

          path.addEventListener('mouseenter', onEnter);
          path.addEventListener('mouseleave', onLeave);
          path.addEventListener('click', onClick);
          listeners.push({ path, onEnter, onLeave, onClick });
        });

        // Generate and append dynamic, high-contrast labels at the center of each district path
        const viewBoxStr = svg.getAttribute('viewBox') || '';
        const parts = viewBoxStr.split(/[\s,]+/);
        let viewBoxWidth = 1000;
        let viewBoxHeight = 1000;
        if (parts.length >= 4) {
          viewBoxWidth = parseFloat(parts[2]) || 1000;
          viewBoxHeight = parseFloat(parts[3]) || 1000;
        }

        const containerWidth = containerRef.current.clientWidth || 600;
        const containerHeight = containerRef.current.clientHeight || 500;
        const scaleFactor = Math.min(containerWidth / viewBoxWidth, containerHeight / viewBoxHeight);
        const labelFontSize = Math.max(11.5 / scaleFactor, 8);

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('id', 'district-labels');

        const districtsList = loadedRef.current.get(stateId) || [];

        svg.querySelectorAll('path').forEach(path => {
          const pathId = path.getAttribute('id');
          const districtId = resolveId(pathId);
          const district = districtsList.find(d => d.id === districtId);
          if (!district) return;

          try {
            const bbox = getPathBBox(path.getAttribute('d') || '');
            if (bbox && bbox.width >= 0 && bbox.height >= 0) {
              const cx = bbox.x + bbox.width / 2;
              const cy = bbox.y + bbox.height / 2;

              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', cx);
              text.setAttribute('y', cy);
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('dominant-baseline', 'middle');
              text.setAttribute('style', `
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                font-size: ${labelFontSize}px;
                fill: #0f172a;
                pointer-events: none;
                text-shadow: 0 1px 2px rgba(255,255,255,0.85);
              `);
              text.textContent = district.name;
              labelGroup.appendChild(text);
            }
          } catch (e) {
            console.warn('Failed to calculate JS-based bbox for path:', pathId, e);
          }
        });
        svg.appendChild(labelGroup);

        // Style pre-existing text labels if any
        svg.querySelectorAll('text').forEach(t => {
          if (t.parentNode !== labelGroup) {
            t.setAttribute('style', `
              font-family: 'Outfit', 'Inter', sans-serif;
              font-weight: 700;
              fill: #0f172a;
              pointer-events: none;
              text-shadow: 0 1px 2px rgba(255,255,255,0.85);
            `);
          }
        });

        // Append final SVG to DOM after fully building it in memory
        containerRef.current.appendChild(svg);
        setSvgReady(true);
        setLoading(false);

        cleanupRef.current = () => {
          if (frameId) cancelAnimationFrame(frameId);
          svg.removeEventListener('mousemove', handleMouseMove);
          svg.removeEventListener('touchmove', handleTouchMove);
          svg.removeEventListener('touchend', handleTouchEnd);
          listeners.forEach(({ path, onEnter, onLeave, onClick }) => {
            path.removeEventListener('mouseenter', onEnter);
            path.removeEventListener('mouseleave', onLeave);
            path.removeEventListener('click', onClick);
          });
        };
      })
      .catch(err => {
        if (!signal.aborted) {
          console.error('StateMap SVG load failed:', err);
          setError(err.message || 'Failed to load map.');
          setLoading(false);
        }
      });

    return () => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
      abortController.abort();
    };
  // Re-render only when the SVG URL or viewBox changes (i.e. new state selected)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId, svgUrl, viewBox]);

  // ─── Re-color districts when data loads or selection changes ─────────────
  useEffect(() => {
    if (!svgReady || !containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    const districtsList = loadedStates.get(stateId) || [];

    svg.querySelectorAll('path').forEach(path => {
      const pathId = path.getAttribute('id');
      const districtId = resolveId(pathId);
      const district = districtsList.find(d => d.id === districtId);
      if (!district) return;

      const total = (district.complaintsMajor || 0) + (district.complaintsMinor || 0);
      const isSelected = selectedDistrict === districtId || (selectedDistrict === 'mayiladuthurai' && districtId === 'nagapattinam');
      if (isSelected) {
        path.style.strokeWidth = '6px';
        path.style.filter = 'brightness(1.15) drop-shadow(0 6px 16px rgba(0,0,0,0.25))';
      } else {
        path.style.fill = resolveRiskColor(total);
        path.style.strokeWidth = '2.5px';
        path.style.filter = 'none';
        path.style.pointerEvents = 'auto';
      }
    });
  }, [svgReady, selectedDistrict, loadedStates, stateId]);

  // ─── Inject district name labels when SVG and data are both ready ─────────
  useEffect(() => {
    if (!svgReady || !containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    const districtsList = loadedStates.get(stateId) || [];
    console.log('[DEBUG] label-injection useEffect starting...', {
      stateId,
      districtsCount: districtsList.length,
      pathsCount: svg.querySelectorAll('path').length
    });
    if (districtsList.length === 0) return;

    // Remove any existing label group and rebuild
    const existing = svg.querySelector('#district-labels');
    if (existing) {
      console.log('[DEBUG] Removing existing district labels group');
      existing.remove();
    }

    // Parse viewBox to get overall scale reference
    const viewBoxStr = svg.getAttribute('viewBox') || '';
    const vbParts = viewBoxStr.split(/[\s,]+/);
    let viewBoxX = 0;
    let viewBoxY = 0;
    let viewBoxWidth = 1000;
    let viewBoxHeight = 1000;
    if (vbParts.length >= 4) {
      viewBoxX = parseFloat(vbParts[0]) || 0;
      viewBoxY = parseFloat(vbParts[1]) || 0;
      viewBoxWidth = parseFloat(vbParts[2]) || 1000;
      viewBoxHeight = parseFloat(vbParts[3]) || 1000;
    }
    // Base font size relative to viewBox (scale factor adjusted to target ~11.5px on screen)
    const baseFontSize = Math.max(viewBoxWidth * 0.026, 8);
    // Minimum district area fraction to show a label (skip tiny slivers)
    const minBBoxArea = (viewBoxWidth * viewBoxHeight) * 0.0008;

    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelGroup.setAttribute('id', 'district-labels');

    const rectsOverlap = (r1, r2, padding = 4) => {
      return !(r1.right + padding < r2.left ||
               r1.left - padding > r2.right ||
               r1.bottom + padding < r2.top ||
               r1.top - padding > r2.bottom);
    };

    const hardcodedOffsets = {
      'alappuzha': { dx: -viewBoxWidth * 0.018, dy: -viewBoxHeight * 0.02 },
      'pathanamthitta': { dx: viewBoxWidth * 0.012, dy: viewBoxHeight * 0.015 },
      'kottayam': { dx: -viewBoxWidth * 0.005, dy: -viewBoxHeight * 0.02 },
      'eranakulam': { dx: -viewBoxWidth * 0.015, dy: -viewBoxHeight * 0.01 },
      'ernakulam': { dx: -viewBoxWidth * 0.015, dy: -viewBoxHeight * 0.01 },
      'thiruvananthapuram': { dx: 0, dy: viewBoxHeight * 0.015 }
    };

    const districtsWithBBox = [];
    svg.querySelectorAll('path').forEach(path => {
      const pathId = path.getAttribute('id');
      const districtId = resolveId(pathId);
      const district = districtsList.find(d => d.id === districtId);
      if (!district) {
        console.log('[DEBUG] No district matched for path ID:', pathId, 'resolved:', districtId);
        return;
      }

      const dAttr = path.getAttribute('d') || '';
      if (!dAttr) return;

      try {
        const bbox = getPathBBox(dAttr);
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          districtsWithBBox.push({ path, district, districtId, bbox });
        }
      } catch (e) {
        console.warn('[DEBUG] Failed getPathBBox for:', pathId, e);
      }
    });

    console.log('[DEBUG] districtsWithBBox successfully parsed:', districtsWithBBox.length);

    // Group by districtId and keep only the largest path per district to avoid duplicate/island labeling
    const uniqueDistrictsMap = new Map();
    districtsWithBBox.forEach(item => {
      const existing = uniqueDistrictsMap.get(item.districtId);
      const area = item.bbox.width * item.bbox.height;
      if (!existing || area > (existing.bbox.width * existing.bbox.height)) {
        uniqueDistrictsMap.set(item.districtId, item);
      }
    });

    const uniqueDistrictsList = Array.from(uniqueDistrictsMap.values());
    console.log('[DEBUG] Unique districts to label:', uniqueDistrictsList.length);

    // Sort by area descending so larger districts get labeled first
    uniqueDistrictsList.sort((a, b) => (b.bbox.width * b.bbox.height) - (a.bbox.width * a.bbox.height));

    const placedLabels = [];

    uniqueDistrictsList.forEach(({ path, district, districtId, bbox }) => {

      let cx = bbox.x + bbox.width / 2;
      let cy = bbox.y + bbox.height / 2;

      // Apply hardcoded offsets if present
      const normId = districtId ? districtId.toLowerCase() : '';
      if (hardcodedOffsets[normId]) {
        cx += hardcodedOffsets[normId].dx;
        cy += hardcodedOffsets[normId].dy;
      }

      const name = district.name;
      const words = name.split(' ');

      const charWidth = baseFontSize * 0.55;
      const maxCharsPerLine = Math.max(Math.floor(bbox.width / charWidth), 3);

      let fontSize = baseFontSize;
      let lines = [name];

      if (name.length > maxCharsPerLine) {
        if (words.length > 1) {
          const mid = Math.ceil(words.length / 2);
          const line1 = words.slice(0, mid).join(' ');
          const line2 = words.slice(mid).join(' ');
          const longestLine = Math.max(line1.length, line2.length);
          const fittedFontSize = Math.min(baseFontSize, (bbox.width / (longestLine * 0.55)));
          
          if (bbox.height >= fontSize * 2.5) {
            lines = [line1, line2];
            fontSize = Math.max(fittedFontSize, baseFontSize * 0.75);
          } else {
            fontSize = Math.max(
              Math.min(baseFontSize, bbox.width / (name.length * 0.55)),
              baseFontSize * 0.75
            );
            lines = [name];
          }
        } else {
          fontSize = Math.max(
            Math.min(baseFontSize, bbox.width / (name.length * 0.55)),
            baseFontSize * 0.75
          );
        }
      } else {
        fontSize = Math.max(fontSize, baseFontSize * 0.75);
      }

      const textWidth = Math.max(...lines.map(l => l.length)) * fontSize * 0.55;
      const textHeight = lines.length * fontSize * 1.2;

      // Clamp candidates to keep text fully within the viewBox boundaries
      // 2% padding of viewBox + half of text width/height
      const paddingX = viewBoxWidth * 0.02 + textWidth / 2;
      const paddingY = viewBoxHeight * 0.02 + textHeight / 2;

      const clampX = (val) => Math.max(viewBoxX + paddingX, Math.min(viewBoxX + viewBoxWidth - paddingX, val));
      const clampY = (val) => Math.max(viewBoxY + paddingY, Math.min(viewBoxY + viewBoxHeight - paddingY, val));

      // Programmatic candidates for collision evasion
      const candidates = [
        { x: clampX(cx), y: clampY(cy) },
        { x: clampX(cx - bbox.width * 0.08), y: clampY(cy - bbox.height * 0.08) },
        { x: clampX(cx + bbox.width * 0.08), y: clampY(cy + bbox.height * 0.08) },
        { x: clampX(cx), y: clampY(cy - bbox.height * 0.12) },
        { x: clampX(cx), y: clampY(cy + bbox.height * 0.12) },
        { x: clampX(cx - bbox.width * 0.12), y: clampY(cy) },
        { x: clampX(cx + bbox.width * 0.12), y: clampY(cy) }
      ];

      let bestPos = { x: clampX(cx), y: clampY(cy) };
      let minOverlaps = Infinity;

      for (const cand of candidates) {
        const left = cand.x - textWidth / 2;
        const right = cand.x + textWidth / 2;
        const top = cand.y - textHeight / 2;
        const bottom = cand.y + textHeight / 2;
        const candRect = { left, right, top, bottom };

        let overlaps = 0;
        for (const placed of placedLabels) {
          if (rectsOverlap(candRect, placed, 2)) {
            overlaps++;
          }
        }

        if (overlaps === 0) {
          bestPos = cand;
          minOverlaps = 0;
          break;
        }

        if (overlaps < minOverlaps) {
          minOverlaps = overlaps;
          bestPos = cand;
        }
      }

      // Record placed label box
      const finalLeft = bestPos.x - textWidth / 2;
      const finalRight = bestPos.x + textWidth / 2;
      const finalTop = bestPos.y - textHeight / 2;
      const finalBottom = bestPos.y + textHeight / 2;
      placedLabels.push({ left: finalLeft, right: finalRight, top: finalTop, bottom: finalBottom });

      const strokeWidth = fontSize * 0.18;
      const lineHeight = fontSize * 1.2;

      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', String(bestPos.x));
      textEl.setAttribute('y', String(bestPos.y));
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.setAttribute('style', [
        "font-family: 'Inter', sans-serif",
        'font-weight: 700',
        `font-size: ${fontSize}px`,
        'fill: #1e293b',
        'stroke: #ffffff',
        `stroke-width: ${strokeWidth}px`,
        'stroke-linejoin: round',
        'paint-order: stroke fill',
        'pointer-events: none',
        'user-select: none',
      ].join('; '));

      if (lines.length === 1) {
        textEl.textContent = lines[0];
      } else {
        const yOffset = -(lineHeight / 2);
        lines.forEach((line, i) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', String(bestPos.x));
          tspan.setAttribute('dy', i === 0 ? String(yOffset) : String(lineHeight));
          tspan.textContent = line;
          textEl.appendChild(tspan);
        });
      }

      labelGroup.appendChild(textEl);
    });

    svg.appendChild(labelGroup);
  }, [svgReady, loadedStates, stateId]);
  return (

    <div className="card map-card-container" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Card Header Bar matching screenshot ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#ffffff',
        flexWrap: 'wrap'
      }}>

        <button
          onClick={onBackToIndia}
          style={{
            padding: '6px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            background: '#ffffff',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
        >
          ← Back to India
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{title}</span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            {districts.length} Districts &middot; Click a district to view details, click again to explore
          </span>
        </div>
      </div>

      <div className="map-inner-wrapper" style={{ 
        padding: '4px 8px 8px 8px', 
        position: 'relative', 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        
        {/* Map Title and Legend Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          width: '100%'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{title} Map</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Interactive Regional District boundaries</p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#334155'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span>
              {counts.high} Major
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></span>
              {counts.medium} Minor
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
              {counts.low} Low Risk
            </span>
          </div>
        </div>

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)', zIndex: 5, gap: '12px' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Loading {title} map…</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 5, gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>{error}</p>
            <button onClick={() => { setError(null); setLoading(true); }} style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
              Retry
            </button>
          </div>
        )}

        <div ref={containerRef} className="map-svg-viewport" style={{ width: '100%', flex: 1, minHeight: 0 }} />
      </div>

      <MapTooltip hoverInfo={hoverInfo} mousePos={mousePos} type="district" />
    </div>
  );
}
