import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchWithRetry, getRiskColor } from '../../utils/helpers';
import MapTooltip from './MapTooltip';

// Mapping from india.svg lowercase path IDs to our system's state IDs
const SVG_TO_STATE = {
  'ka': 'IN-KA',
  'tn': 'IN-TN',
  'kl': 'IN-KL',
  'ap': 'IN-AP',
  'tg': 'IN-TG',
  'mh': 'IN-MH',
  'ct': 'IN-CG',
  'or': 'IN-OD',
  'gj': 'IN-GJ',
  'mp': 'IN-MP',
  'wb': 'IN-WB',
  'py': 'IN-PY',
  'jh': 'IN-JH',
  'rj': 'IN-RJ',
  'ga': 'IN-GA',
  'an': 'IN-AN',
  'ld': 'IN-LD',
  'dn': 'IN-DN',
  'dd': 'IN-DN',
  'br': 'IN-BR',
  'up': 'IN-UP',
  'pb': 'IN-PB',
  'hr': 'IN-HR',
  'hp': 'IN-HP',
  'ut': 'IN-UT',
  'as': 'IN-AS',
  'tr': 'IN-TR',
  'mn': 'IN-MN',
  'ml': 'IN-ML',
  'mz': 'IN-MZ',
  'nl': 'IN-NL',
  'ar': 'IN-AR',
  'sk': 'IN-SK',
  'jk': 'IN-JK',
  'dl': 'IN-DL'
};

const VALID_SVG_IDS = new Set(Object.keys(SVG_TO_STATE));

// Vibrant categorical colors for each state
const STATE_COLORS = {
  'ap': '#3b82f6', // blue-500
  'ar': '#10b981', // emerald-500
  'as': '#f59e0b', // amber-500
  'br': '#ef4444', // red-500
  'ct': '#8b5cf6', // violet-500
  'ga': '#14b8a6', // teal-500
  'gj': '#f97316', // orange-500
  'hr': '#06b6d4', // cyan-500
  'hp': '#6366f1', // indigo-500
  'jk': '#ec4899', // pink-500
  'jh': '#84cc16', // lime-500
  'ka': '#f43f5e', // rose-500
  'kl': '#0ea5e9', // sky-500
  'mp': '#d946ef', // fuchsia-500
  'mh': '#eab308', // yellow-500
  'mn': '#22c55e', // green-500
  'ml': '#64748b', // slate-500
  'mz': '#a855f7', // purple-500
  'nl': '#f59e0b', // amber-500
  'or': '#ef4444', // red-500
  'pb': '#3b82f6', // blue-500
  'rj': '#10b981', // emerald-500
  'sk': '#8b5cf6', // violet-500
  'tn': '#f97316', // orange-500
  'tg': '#14b8a6', // teal-500
  'tr': '#06b6d4', // cyan-500
  'up': '#6366f1', // indigo-500
  'ut': '#ec4899', // pink-500
  'wb': '#84cc16', // lime-500
  'an': '#64748b', // slate-500
  'ch': '#a855f7', // purple-500
  'dn': '#f43f5e', // rose-500
  'dd': '#f43f5e', // rose-500
  'dl': '#0ea5e9', // sky-500
  'ld': '#d946ef', // fuchsia-500
  'py': '#eab308'  // yellow-500
};

const resolveStateColor = (svgId) => {
  return STATE_COLORS[svgId] || '#cbd5e1';
};

// State names for tooltip display
const STATE_DISPLAY_NAMES = {
  'IN-KA': 'Karnataka',
  'IN-TN': 'Tamil Nadu',
  'IN-KL': 'Kerala',
  'IN-AP': 'Andhra Pradesh',
  'IN-TG': 'Telangana',
  'IN-MH': 'Maharashtra',
  'IN-CG': 'Chhattisgarh',
  'IN-OD': 'Odisha',
  'IN-GJ': 'Gujarat',
  'IN-MP': 'Madhya Pradesh',
  'IN-WB': 'West Bengal',
  'IN-PY': 'Puducherry',
  'IN-JH': 'Jharkhand',
  'IN-RJ': 'Rajasthan',
  'IN-GA': 'Goa',
  'IN-AN': 'Andaman & Nicobar Islands',
  'IN-LD': 'Lakshadweep',
  'IN-DN': 'Dadra & Nagar Haveli and Daman & Diu',
  'IN-BR': 'Bihar',
  'IN-UP': 'Uttar Pradesh',
  'IN-PB': 'Punjab',
  'IN-HR': 'Haryana',
  'IN-HP': 'Himachal Pradesh',
  'IN-UT': 'Uttarakhand',
  'IN-AS': 'Assam',
  'IN-TR': 'Tripura',
  'IN-MN': 'Manipur',
  'IN-ML': 'Meghalaya',
  'IN-MZ': 'Mizoram',
  'IN-NL': 'Nagaland',
  'IN-AR': 'Arunachal Pradesh',
  'IN-SK': 'Sikkim',
  'IN-JK': 'Jammu & Kashmir',
  'IN-DL': 'Delhi'
};

// Short names for clean labeling on the map
const STATE_LABEL_NAMES = {
  'ap': 'Andhra Pradesh',
  'ar': 'Arunachal Pradesh',
  'as': 'Assam',
  'br': 'Bihar',
  'ct': 'Chhattisgarh',
  'gj': 'Gujarat',
  'hr': 'Haryana',
  'hp': 'Himachal Pradesh',
  'jk': 'Jammu & Kashmir',
  'jh': 'Jharkhand',
  'ka': 'Karnataka',
  'kl': 'Kerala',
  'mp': 'Madhya Pradesh',
  'mh': 'Maharashtra',
  'mn': 'Manipur',
  'ml': 'Meghalaya',
  'mz': 'Mizoram',
  'nl': 'Nagaland',
  'or': 'Odisha',
  'pb': 'Punjab',
  'rj': 'Rajasthan',
  'sk': 'Sikkim',
  'tn': 'Tamil Nadu',
  'tg': 'Telangana',
  'tr': 'Tripura',
  'up': 'Uttar Pradesh',
  'ut': 'Uttarakhand',
  'wb': 'West Bengal',
  'py': 'Puducherry',
  'ga': 'Goa',
  'an': 'Andaman & Nicobar',
  'ld': 'Lakshadweep',
  'dn': 'DNH & DD',
  'dd': 'DNH & DD',
  'dl': 'Delhi'
};

// Returns a default color for unmapped SVG paths
function getStateColor(stateId) {
  return resolveStateColor(stateId);
}

export default function IndiaMap({ selectedState, onStateClick, loadedStates }) {
  const containerRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cleanupRef = useRef(null);
  const cachedData = useRef({ svgText: null, summaryData: null });

  // Removing riskStats logic

  // Initialize and load the SVG and summary
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    async function initMap() {
      if (!cachedData.current.svgText || !cachedData.current.summaryData) {
        setLoading(true);
        setError(null);
        try {
          const [svgText, summaryData] = await Promise.all([
            fetchWithRetry('/maps/india.svg', { signal }).then(r => r.text()),
            fetchWithRetry('/data/stateSummary.json', { signal }).then(r => r.json())
          ]);

          if (signal.aborted) return;
          cachedData.current = { svgText, summaryData };
          setSummary(summaryData);
          renderSvg(svgText, summaryData);
          setLoading(false);
        } catch (err) {
          if (!signal.aborted) {
            console.error('Failed to initialize India map:', err);
            setError(err.message || 'Failed to load map data.');
            setLoading(false);
          }
        }
      } else {
        renderSvg(cachedData.current.svgText, cachedData.current.summaryData);
      }
    }

    function renderSvg(svgText, summaryData) {
      if (!containerRef.current) return;
      
      // Cleanup previous listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Clear existing content to prevent stacking
      containerRef.current.replaceChildren();

      // Sanitize and parse SVG text using DOMParser
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) {
        throw new Error('Invalid SVG content.');
      }

      // Configure SVG attributes
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.style.backgroundColor = 'transparent';

      // Mousemove event for tooltip
      let frameId = null;
      const handleMouseMove = (e) => {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          setMousePos({ x: e.clientX, y: e.clientY });
        });
      };
      svg.addEventListener('mousemove', handleMouseMove);

      // Touchmove event for mobile hover/tooltip support
      let currentHoverPath = null;
      const handleTouchMove = (e) => {
        if (e.touches && e.touches.length > 0) {
          const touch = e.touches[0];
          setMousePos({ x: touch.clientX, y: touch.clientY });

          const el = document.elementFromPoint(touch.clientX, touch.clientY);
          if (el && el.tagName === 'path' && el.getAttribute('id')) {
            const pathId = el.getAttribute('id');
            if (currentHoverPath !== el) {
              if (currentHoverPath) {
                currentHoverPath.dispatchEvent(new Event('mouseleave'));
              }
              currentHoverPath = el;
              const event = new MouseEvent('mouseenter', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
              });
              currentHoverPath.dispatchEvent(event);
            }
          } else if (currentHoverPath) {
            currentHoverPath.dispatchEvent(new Event('mouseleave'));
            currentHoverPath = null;
          }
        }
      };

      const handleTouchEnd = () => {
        if (currentHoverPath) {
          currentHoverPath.dispatchEvent(new Event('mouseleave'));
          currentHoverPath = null;
        }
      };

      svg.addEventListener('touchmove', handleTouchMove, { passive: true });
      svg.addEventListener('touchend', handleTouchEnd);

      const paths = svg.querySelectorAll('path');
      const listeners = [];

      paths.forEach(path => {
        const svgPathId = path.getAttribute('id');
        const stateName = path.getAttribute('aria-label') || svgPathId;
        
        // ─── Non-South Indian States (Vibrant Pastel base colors, only hoverable) ───
        if (!VALID_SVG_IDS.has(svgPathId)) {
          path.style.fill = getStateColor(svgPathId);
          path.style.stroke = '#ffffff';
          path.style.strokeWidth = '0.8px';
          path.style.transition = 'fill 0.2s, filter 0.2s';
          
          const handleMouseEnter = (e) => {
            path.style.filter = 'brightness(1.08) drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
            setHoverInfo({
              name: stateName,
              isNonSouth: true
            });
            setMousePos({ x: e.clientX, y: e.clientY });
          };

          const handleMouseLeave = () => {
            path.style.filter = 'none';
            setHoverInfo(null);
          };

          path.addEventListener('mouseenter', handleMouseEnter);
          path.addEventListener('mouseleave', handleMouseLeave);
          listeners.push({ path, handleMouseEnter, handleMouseLeave });
          return;
        }

        // ─── South Indian States (Interactive, colored by risk) ───
        const stateId = SVG_TO_STATE[svgPathId];
        const stateInfo = summaryData[stateId] || {};
        
        // Dynamic stats aggregation: Live store takes precedence, falls back to summary
        let totalComplaints = 0;
        let majorCount = 0;
        let minorCount = 0;
        
        if (loadedStates.has(stateId)) {
          const districts = loadedStates.get(stateId);
          districts.forEach(d => {
            majorCount += d.complaintsMajor || 0;
            minorCount += d.complaintsMinor || 0;
          });
          totalComplaints = majorCount + minorCount;
        } else {
          totalComplaints = stateInfo.totalComplaints || 0;
          majorCount = stateInfo.complaintsMajor || 0;
          minorCount = stateInfo.complaintsMinor || 0;
        }

        // Apply color based on state identity
        const baseColor = resolveStateColor(svgPathId);
        path.style.fill = baseColor;
        path.style.strokeWidth = '1.2px';
        path.style.cursor = 'pointer';
        path.style.transition = 'fill 0.2s, filter 0.2s, stroke-width 0.2s';

        // Mouse Enter
        const handleMouseEnter = (e) => {
          path.style.filter = 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.22))';
          path.style.strokeWidth = '2px';

          const stateDistricts = loadedStates.has(stateId) ? loadedStates.get(stateId).length : null;
          setHoverInfo({
            name:      STATE_DISPLAY_NAMES[stateId] || stateInfo.name || stateId,
            major:     majorCount,
            minor:     minorCount,
            total:     totalComplaints,
            districts: stateDistricts,
          });
          setMousePos({ x: e.clientX, y: e.clientY });
        };

        // Mouse Leave
        const handleMouseLeave = () => {
          path.style.filter = 'none';
          path.style.strokeWidth = '1.2px';
          setHoverInfo(null);
        };

        // Click handler to select state
        const handleClick = () => {
          onStateClick(stateId);
        };

        path.addEventListener('mouseenter', handleMouseEnter);
        path.addEventListener('mouseleave', handleMouseLeave);
        path.addEventListener('click', handleClick);

        listeners.push({ path, handleMouseEnter, handleMouseLeave, handleClick });
      });

      // Append SVG to the container
      containerRef.current.appendChild(svg);

      // Render clean State Text Labels overlaid directly on top of the SVG paths
      setTimeout(() => {
        if (!containerRef.current) return;
        const appendedSvg = containerRef.current.querySelector('svg');
        if (!appendedSvg) return;

        // Clean any stale labels and custom markers
        appendedSvg.querySelectorAll('text.state-label').forEach(el => el.remove());
        appendedSvg.querySelectorAll('g.py-interactive-marker').forEach(el => el.remove());

        appendedSvg.querySelectorAll('path').forEach(p => {
          const id = p.getAttribute('id');

          // Handle Puducherry with a custom interactive marker group in the Bay of Bengal
          if (id === 'py') {
            const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            markerGroup.setAttribute('class', 'py-interactive-marker');
            markerGroup.style.cursor = 'pointer';

            // Leader line from main Puducherry enclave (243, 588) to label (274, 588)
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '243');
            line.setAttribute('y1', '588');
            line.setAttribute('x2', '274');
            line.setAttribute('y2', '588');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '2,2');
            markerGroup.appendChild(line);

            // Pulsing marker outer ring
            const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulse.setAttribute('cx', '243');
            pulse.setAttribute('cy', '588');
            pulse.setAttribute('r', '5');
            pulse.setAttribute('fill', 'none');
            pulse.setAttribute('stroke-width', '1.5');
            
            const animR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animR.setAttribute('attributeName', 'r');
            animR.setAttribute('values', '3;8;3');
            animR.setAttribute('dur', '2s');
            animR.setAttribute('repeatCount', 'indefinite');
            pulse.appendChild(animR);

            const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animOp.setAttribute('attributeName', 'opacity');
            animOp.setAttribute('values', '1;0;1');
            animOp.setAttribute('dur', '2s');
            animOp.setAttribute('repeatCount', 'indefinite');
            pulse.appendChild(animOp);
            
            markerGroup.appendChild(pulse);

            // Solid inner dot
            const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            center.setAttribute('cx', '243');
            center.setAttribute('cy', '588');
            center.setAttribute('r', '2.5');
            center.setAttribute('stroke-width', '0.8');
            markerGroup.appendChild(center);

            // Label text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '277');
            text.setAttribute('y', '588');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('style', `
              font-family: 'Inter', sans-serif;
              font-weight: 700;
              font-size: 8px;
              user-select: none;
            `);
            text.textContent = 'Puducherry';
            markerGroup.appendChild(text);

            // Interactive state variables matching the main path loop
            const stateId = 'IN-PY';
            const stateInfo = summaryData[stateId] || {};
            
            let totalComplaints = 0;
            let majorCount = 0;
            let minorCount = 0;
            if (loadedStates.has(stateId)) {
              const districts = loadedStates.get(stateId);
              districts.forEach(d => {
                majorCount += d.complaintsMajor || 0;
                minorCount += d.complaintsMinor || 0;
              });
              totalComplaints = majorCount + minorCount;
            } else {
              totalComplaints = stateInfo.totalComplaints || 0;
              majorCount = stateInfo.complaintsMajor || 0;
              minorCount = stateInfo.complaintsMinor || 0;
            }

            const handleMouseEnter = (e) => {
              p.style.filter = 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.22))';
              p.style.strokeWidth = '2px';
              const stateDistricts = loadedStates.has(stateId) ? loadedStates.get(stateId).length : null;
              setHoverInfo({
                name: 'Puducherry',
                major: majorCount,
                minor: minorCount,
                total: totalComplaints,
                districts: stateDistricts,
              });
              setMousePos({ x: e.clientX, y: e.clientY });
            };

            const handleMouseLeave = () => {
              p.style.filter = 'none';
              p.style.strokeWidth = '1.2px';
              setHoverInfo(null);
            };

            const handleClick = () => {
              onStateClick(stateId);
            };

            markerGroup.addEventListener('mouseenter', handleMouseEnter);
            markerGroup.addEventListener('mouseleave', handleMouseLeave);
            markerGroup.addEventListener('click', handleClick);

            listeners.push({ path: markerGroup, handleMouseEnter, handleMouseLeave, handleClick });
            appendedSvg.appendChild(markerGroup);
            return;
          }

          const name = STATE_LABEL_NAMES[id];
          // Skip micro UTs where labels are unreadable
          if (['ch', 'dn', 'dd'].includes(id)) return;

          // Calculate true geometric center of the state's bounding box using getBBox()
          // This is completely robust to SVG transforms and scaling!
          let posX = 0, posY = 0;
          let boxW = 0, boxH = 0;

          try {
            const bbox = p.getBBox();
            if (bbox && bbox.width > 0 && bbox.height > 0) {
              posX = bbox.x + bbox.width / 2;
              posY = bbox.y + bbox.height / 2;
              boxW = bbox.width;
              boxH = bbox.height;
            }
          } catch (e) {
            console.warn('Failed to get BBox for', id);
          }

          if (!posX || !posY) return;

          // Relative tweaks applied to the perfectly accurate getBBox center!
          // dx, dy shift the text relative to the geometric center into the thickest part of the state.
          // fs sets a specific font size so it NEVER spills out of tiny/narrow borders.
          const STATE_TWEAKS = {
            // Concave/Weirdly shaped states need their center shifted into the thickest part of the landmass
            'ap': { dx: -45, dy: 15, fs: 6.5 }, // Shift down-right into the curve
            'ar': { dx: 8, dy: 2, fs: 4.5 },
            'as': { dx: -5, dy: 5, fs: 5 }, // Shift left into the thicker body
            'gj': { dx: -10, dy: -10, fs: 8 }, // Shift left towards the thick mainland
            'kl': { dx: 3, dy: 5, fs: 5 },
            'wb': { dx: 2, dy: 25, fs: 5 }, // Shift heavily down into the southern bulb

            // Small states just need tiny fonts to fit cleanly inside
            'ga': { dx: -5, dy: 0, fs: 4 },
            'sk': { dx: 0, dy: 2, fs: 4 },
            'tr': { dx: 0, dy: 0, fs: 4 },
            'ml': { dx: 0, dy: 0, fs: 4.5 },
            'mn': { dx: 0, dy: 0, fs: 4.5 },
            'mz': { dx: 0, dy: 0, fs: 4.5 },
            'nl': { dx: 0, dy: 0, fs: 4.5 },
            
            // Standard states that just need specific font sizes to prevent spilling
            'br': { dx: 0, dy: 5, fs: 7 },
            'ct': { dx: -15, dy: -5, fs: 6.5 },
            'hp': { dx: 0, dy: 2, fs: 6 },
            'hr': { dx: -2, dy: 2, fs: 6 },
            'jh': { dx: 0, dy: 5, fs: 7 },
            'jk': { dx: 0, dy: 15, fs: 7.5 },
            'ka': { dx: -16, dy: 5, fs: 8 },
            'mh': { dx: -20, dy: -15, fs: 9 }, // Move slightly up to center in main body
            'mp': { dx: 0, dy: 25, fs: 9.5 },
            'or': { dx: 0, dy: -5, fs: 8 },
            'pb': { dx: -5, dy: -5, fs: 6.5 },
            'rj': { dx: -10, dy: 0, fs: 9 },
            'tg': { dx: 0, dy: 5, fs: 8 },
            'tn': { dx: 5, dy: 0, fs: 7.5 },
            'up': { dx: 0, dy: 5, fs: 9 },
            'ut': { dx: -5, dy: 5, fs: 6 },
            'an': { dx: 0, dy: 0, fs: 5 },
            'ld': { dx: 0, dy: 0, fs: 5 },
            'dl': { dx: 0, dy: 0, fs: 3 }, // Very tiny for Delhi
          };

          let finalFontSize = 9; // default
          const tweak = STATE_TWEAKS[id];

          if (tweak) {
             posX += tweak.dx;
             posY += tweak.dy;
             finalFontSize = tweak.fs;
          } else {
             // Dynamic font sizing as absolute fallback
             if (boxW > 0) {
               const maxAllowedWidth = boxW * 0.85;
               const estTextWidthPerPx = name.length * 0.55;
               finalFontSize = Math.max(4.5, Math.min(maxAllowedWidth / estTextWidthPerPx, 9.5));
             }
          }

          const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textEl.setAttribute('class', 'state-label');
          textEl.setAttribute('x', posX);
          textEl.setAttribute('y', posY);
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('dominant-baseline', 'middle');
          
          // Crisp, professional halo for readability on dark backgrounds without being chunky
          textEl.setAttribute('paint-order', 'stroke fill');
          textEl.setAttribute('stroke', '#ffffff');
          textEl.setAttribute('stroke-width', '2px');
          textEl.setAttribute('stroke-linecap', 'round');
          textEl.setAttribute('stroke-linejoin', 'round');

          textEl.style.fontFamily = "'Inter', Arial, sans-serif";
          textEl.style.fontSize = `${finalFontSize}px`;
          textEl.style.letterSpacing = '0.2px';
          textEl.style.fontWeight = '700'; // Bold and professional
          textEl.style.fill = '#000000'; // Pitch black for maximum contrast
          textEl.style.pointerEvents = 'none';

          textEl.textContent = name;

          appendedSvg.appendChild(textEl);
        });
      }, 50);

      // Define cleanup function to avoid leaks
      cleanupRef.current = () => {
        if (frameId) cancelAnimationFrame(frameId);
        svg.removeEventListener('mousemove', handleMouseMove);
        svg.removeEventListener('touchmove', handleTouchMove);
        svg.removeEventListener('touchend', handleTouchEnd);
        listeners.forEach(({ path, handleMouseEnter, handleMouseLeave, handleClick }) => {
          path.removeEventListener('mouseenter', handleMouseEnter);
          path.removeEventListener('mouseleave', handleMouseLeave);
          if (handleClick) path.removeEventListener('click', handleClick);
        });
      };
    }

    initMap();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      abortController.abort();
    };
  }, [loadedStates, summary]); // Re-render & bind listeners when loadedStates changes to reflect live statistics!

  // Re-highlight the selected state on state selection change
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('path').forEach(path => {
      const svgPathId = path.getAttribute('id');
      
      // Keep base colors of non-South Indian states consistent
      if (!VALID_SVG_IDS.has(svgPathId)) {
        path.style.fill = getStateColor(svgPathId);
        return;
      }

      const stateId = SVG_TO_STATE[svgPathId];
      const baseColor = resolveStateColor(svgPathId);
      if (selectedState === stateId) {
        path.style.strokeWidth = '3px';
        path.style.stroke = '#ffffff';
        path.style.filter = 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.25))';
        path.style.fill = baseColor;
      } else {
        path.style.fill = baseColor;
        path.style.stroke = '#ffffff';
        path.style.strokeWidth = '1.2px';
        path.style.filter = 'none';
      }
    });
  }, [selectedState, loading, summary, loadedStates]);

  return (
    <div className="card map-card-container" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div className="map-inner-wrapper">

        {/* Top-right Title and Legend */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', pointerEvents: 'none' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
            India Map Overview
          </h3>

        </div>

        {/* Bottom hint
        <div className="india-map-hint" style={{ position: 'absolute', bottom: '14px', left: '14px', zIndex: 10, fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.82)', padding: '4px 10px', borderRadius: '6px', pointerEvents: 'none' }}>
          Click an active state to drill down ↓
        </div> */}

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 5, gap: '12px' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>Loading India map…</p>
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 5, gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>{error}</p>
            <button
              onClick={() => { setSummary(null); }}
              style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
            >
              Retry Loading Map
            </button>
          </div>
        )}

        <div ref={containerRef} className="map-svg-viewport" style={{ width: '100%', height: '100%' }} />
      </div>

      <MapTooltip hoverInfo={hoverInfo} mousePos={mousePos} type="state" />
    </div>
  );
}
