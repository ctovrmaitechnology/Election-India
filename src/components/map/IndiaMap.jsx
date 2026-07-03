import React, { useState, useEffect, useRef } from 'react';
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
  'jk': 'IN-JK'
};

const VALID_SVG_IDS = new Set(Object.keys(SVG_TO_STATE));

// Exact colors matching the user's reference image
const HIGH_RED = '#d32f2f';
const MED_YELLOW = '#e5a93c';
const LOW_BLUE = '#3182bd';

const MAP_STATE_COLORS = {
  // Red (High)
  'ka': HIGH_RED,
  'ap': HIGH_RED,
  'jk': HIGH_RED,
  'pb': HIGH_RED,
  'up': HIGH_RED,
  'br': HIGH_RED,
  'ar': HIGH_RED,
  'as': HIGH_RED,
  'ml': HIGH_RED,
  'nl': HIGH_RED,
  'mz': HIGH_RED,
  'tr': HIGH_RED,
  'dl': HIGH_RED,

  // Yellow (Med)
  'tn': MED_YELLOW,
  'kl': MED_YELLOW,
  'mh': MED_YELLOW,
  'mp': MED_YELLOW,
  'gj': MED_YELLOW,
  'or': MED_YELLOW,
  'wb': MED_YELLOW,
  'hp': MED_YELLOW,
  'mn': MED_YELLOW,

  // Blue (Low)
  'tg': LOW_BLUE,
  'ct': LOW_BLUE,
  'jh': LOW_BLUE,
  'rj': LOW_BLUE,
  'hr': LOW_BLUE,
  'ut': LOW_BLUE,
  'sk': LOW_BLUE,
  'ga': LOW_BLUE,
  'an': LOW_BLUE,
  'ld': LOW_BLUE,
  'py': LOW_BLUE,
  'ch': LOW_BLUE,
  'dn': LOW_BLUE,
  'dd': LOW_BLUE,
};

const SOUTH_STATE_COLORS = MAP_STATE_COLORS;

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
  'IN-JK': 'Jammu & Kashmir'
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
  'dd': 'DNH & DD'
};

// Returns the exact risk color matching the user's reference image
function getStateColor(stateId) {
  return MAP_STATE_COLORS[stateId.toLowerCase()] || '#cbd5e1';
}

export default function IndiaMap({ selectedState, onStateClick, loadedStates }) {
  const containerRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cleanupRef = useRef(null);

  // Initialize and load the SVG and summary
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    async function initMap() {
      setLoading(true);
      setError(null);
      try {
        const [svgText, summaryData] = await Promise.all([
          fetchWithRetry('/maps/india.svg', { signal }).then(r => r.text()),
          fetchWithRetry('/data/stateSummary.json', { signal }).then(r => r.json())
        ]);

        if (signal.aborted) return;
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

        // Apply distinct brand color for each South Indian state to vary them
        const baseColor = SOUTH_STATE_COLORS[svgPathId] || '#cbd5e1';
        path.style.fill = baseColor;
        path.style.stroke = '#ffffff';
        path.style.strokeWidth = '1.2px';
        path.style.cursor = 'pointer';
        path.style.transition = 'fill 0.2s, filter 0.2s, stroke-width 0.2s';

        // Mouse Enter
        const handleMouseEnter = (e) => {
          path.style.filter = 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.22))';
          path.style.strokeWidth = '2px';

          const risk = totalComplaints > 20000 ? 'High' : (totalComplaints > 10000 ? 'Medium' : 'Low');
          const stateDistricts = loadedStates.has(stateId) ? loadedStates.get(stateId).length : null;
          setHoverInfo({
            name:      STATE_DISPLAY_NAMES[stateId] || stateInfo.name || stateId,
            major:     majorCount,
            minor:     minorCount,
            total:     totalComplaints,
            districts: stateDistricts,
            risk,
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
            line.setAttribute('stroke', '#0f766e');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '2,2');
            markerGroup.appendChild(line);

            // Pulsing marker outer ring
            const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pulse.setAttribute('cx', '243');
            pulse.setAttribute('cy', '588');
            pulse.setAttribute('r', '5');
            pulse.setAttribute('stroke', '#14b8a6');
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
            center.setAttribute('fill', '#14b8a6');
            center.setAttribute('stroke', '#ffffff');
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
              fill: #0f766e;
              user-select: none;
              text-shadow: 0 1px 3px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.9);
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
              const risk = totalComplaints > 20000 ? 'High' : (totalComplaints > 10000 ? 'Medium' : 'Low');
              const stateDistricts = loadedStates.has(stateId) ? loadedStates.get(stateId).length : null;
              setHoverInfo({
                name: 'Puducherry',
                major: majorCount,
                minor: minorCount,
                total: totalComplaints,
                districts: stateDistricts,
                risk,
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
          if (!name) return;

          // Skip micro UTs where labels are unreadable
          if (['ch', 'dl', 'dn', 'dd'].includes(id)) return;

          // Hardcoded label centers in SVG viewBox (0 0 612 696) coordinates
          // for every state — avoids relying on getBBox() timing issues.
          const LABEL_POS = {
            'an': { x: 553, y: 640 },
            'ap': { x: 232, y: 535 },
            'ar': { x: 548, y: 243 },
            'as': { x: 506, y: 272 },
            'br': { x: 368, y: 265 },
            'ct': { x: 298, y: 382 },
            'ga': { x: 131, y: 514 },
            'gj': { x: 100, y: 342 },
            'hp': { x: 207, y: 139 },
            'hr': { x: 182, y: 196 },
            'jh': { x: 368, y: 322 },
            'jk': { x: 183, y: 84  },
            'ka': { x: 170, y: 510 },
            'kl': { x: 169, y: 605 },
            'ld': { x: 97,  y: 614 },
            'ml': { x: 487, y: 285 },
            'mn': { x: 537, y: 306 },
            'mp': { x: 246, y: 306 },
            'mh': { x: 188, y: 412 },
            'mz': { x: 519, y: 340 },
            'nl': { x: 543, y: 262 },
            'or': { x: 354, y: 390 },
            'pb': { x: 158, y: 157 },
            'rj': { x: 132, y: 245 },
            'sk': { x: 428, y: 236 },
            'tn': { x: 206, y: 595 },
            'tg': { x: 228, y: 462 },
            'tr': { x: 509, y: 340 },
            'up': { x: 248, y: 230 },
            'ut': { x: 237, y: 162 },
            'wb': { x: 405, y: 340 },
            'py': null, // handled separately above
          };

          const pos = LABEL_POS[id];
          if (!pos) return;

          const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textEl.setAttribute('class', 'state-label');
          textEl.setAttribute('x', pos.x);
          textEl.setAttribute('y', pos.y);
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('dominant-baseline', 'middle');
          textEl.style.fontFamily = "'Inter', sans-serif";
          
          // Large states use 10.5px for high visibility; small/clustered states use 8px
          const smallStates = ['as', 'ml', 'mn', 'mz', 'nl', 'tr', 'sk', 'ga', 'an', 'ld', 'py'];
          const fontSize = smallStates.includes(id) ? '8px' : '10.5px';
          
          textEl.style.fontSize = fontSize;
          textEl.style.fontWeight = '700';
          textEl.style.fill = '#1e293b';
          textEl.style.pointerEvents = 'none';
          textEl.style.textShadow = '0 1px 3px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.9)';
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
  }, [loadedStates]); // Re-render & bind listeners when loadedStates changes to reflect live statistics!

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
      let totalComplaints = 0;
      
      if (loadedStates.has(stateId)) {
        const districts = loadedStates.get(stateId);
        districts.forEach(d => {
          totalComplaints += (d.complaintsMajor || 0) + (d.complaintsMinor || 0);
        });
      } else if (summary && summary[stateId]) {
        totalComplaints = summary[stateId].totalComplaints || 0;
      }

      const baseColor = SOUTH_STATE_COLORS[svgPathId] || '#cbd5e1';
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
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            padding: '6px 12px',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              <span style={{ background: '#d32f2f', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }} />
              11 High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              <span style={{ background: '#e5a93c', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }} />
              11 Med
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              <span style={{ background: '#3182bd', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }} />
              15 Low
            </span>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="india-map-hint" style={{ position: 'absolute', bottom: '14px', left: '14px', zIndex: 10, fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.82)', padding: '4px 10px', borderRadius: '6px', pointerEvents: 'none' }}>
          Click an active state to drill down ↓
        </div>

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
