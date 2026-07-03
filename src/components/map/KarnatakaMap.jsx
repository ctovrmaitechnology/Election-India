import React, { useState, useEffect, useRef } from 'react';
import { districtsData } from '../../data/mockData.js';
import { getRiskColor } from '../../utils/helpers';
import MapTooltip from './MapTooltip';

// ─── Correct SVG path ID → district ID mapping ──────────────────────────────
const PATH_TO_DISTRICT = {
  "_x31_97":  "bengaluru_urban",
  "path1058": "ballari",
  "_x31_67":  "bidar",
  "_x34_27":  "dharwad",
  "path3029": "ramanagara",
  "_x31_93":  "hassan",
  "_x34_28":  "vijayanagara",
  "path1068": "udupi",
  "path1065": "uttara_kannada",
  "_x34_35":  "davanagere",
  "_x34_32":  "mysuru",
  "_x31_73":  "kalaburagi",
  "path1075": "dakshina_kannada",
  "path3032": "yadgir",
  "_x34_34":  "shivamogga",
  "_x32_00":  "kodagu",
  "_x34_33":  "chamarajanagar",
  "path1072": "raichur",
  "_x34_22":  "chikkaballapur",
  "_x31_81":  "belagavi",
  "_x31_92":  "chikmagalur",
  "_x34_26":  "vijayapura",
  "_x31_98":  "mandya",
  "_x34_29":  "gadag",
  "_x34_25":  "bagalkot",
  "_x31_91":  "kolar",
  "path1069": "koppal",
  "path1026": "haveri",
  "path1040": "chitradurga",
  "path3193": "tumakuru",
  "_x31_94":  "bengaluru_rural",
};

export default function KarnatakaMap({ selectedDistrict, onDistrictClick, loadedStates, onBackToIndia }) {
  const containerRef = useRef(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Use live data from loadedStates if available, else fall back to static districtsData
  const districtsList = (loadedStates && loadedStates.get('IN-KA')?.length)
    ? loadedStates.get('IN-KA')
    : districtsData;

  // Calculate relative thresholds per state for balanced, colorful visual distribution
  const complaintTotals = districtsList.map(d => (d.complaintsMajor || 0) + (d.complaintsMinor || 0)).sort((a, b) => a - b);
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

  // Calculate counts
  const counts = { major: 0, minor: 0, low: 0 };
  districtsList.forEach(d => {
    const total = (d.complaintsMajor || 0) + (d.complaintsMinor || 0);
    if (total > highThreshold) counts.major++;
    else if (total > lowThreshold) counts.minor++;
    else counts.low++;
  });

  // Clear tooltip on scroll or tap outside
  useEffect(() => {
    const handleScrollOrTap = (e) => {
      if (e.type === 'scroll' || (containerRef.current && !containerRef.current.contains(e.target))) {
        setHoverInfo(null);
      }
    };
    window.addEventListener('scroll', handleScrollOrTap, { passive: true });
    document.addEventListener('touchstart', handleScrollOrTap, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrTap);
      document.removeEventListener('touchstart', handleScrollOrTap);
    };
  }, []);

  // Load SVG once
  useEffect(() => {
    fetch('/karnataka_map.svg')
      .then(res => res.text())
      .then(svgText => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = svgText;

        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 1633.9257 2366.7335');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.background = 'transparent';
        svg.style.backgroundColor = 'transparent';

        // Remove all background rect elements that cause the color mismatch
        const rects = svg.querySelectorAll('rect');
        rects.forEach(rect => {
          rect.style.fill = 'transparent';
          rect.style.stroke = 'none';
          rect.setAttribute('fill', 'transparent');
        });

        // Also clear any polygon backgrounds
        const polygons = svg.querySelectorAll('polygon');
        polygons.forEach(poly => {
          poly.style.fill = 'transparent';
        });

        svg.addEventListener('mousemove', (e) => {
          setMousePos({ x: e.clientX, y: e.clientY });
        });

        let currentHoverPath = null;
        svg.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            setMousePos({ x: touch.clientX, y: touch.clientY });
            
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (el && el.tagName === 'path' && el.getAttribute('id') && PATH_TO_DISTRICT[el.getAttribute('id')]) {
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
        }, { passive: true });

        svg.addEventListener('touchend', () => {
           if (currentHoverPath) {
              currentHoverPath.dispatchEvent(new Event('mouseleave'));
              currentHoverPath = null;
           }
        });

        // Style all paths
        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
          const pathId = path.getAttribute('id');
          const districtId = PATH_TO_DISTRICT[pathId];

          if (districtId) {
            const district = districtsList.find(d => d.id === districtId);
            const totalComplaints = district
              ? (district.complaintsMajor || 0) + (district.complaintsMinor || 0)
              : 0;

            path.style.fill = resolveRiskColor(totalComplaints);
            path.style.stroke = '#ffffff';
            path.style.strokeWidth = '3px';
            path.style.cursor = 'pointer';
            path.style.transition = 'fill 0.2s, stroke-width 0.2s, filter 0.2s';
            path.setAttribute('title', `${district ? district.name : 'Unknown'} (${totalComplaints} complaints)`);

            path.addEventListener('mouseenter', (e) => {
              path.style.filter = 'brightness(1.2) drop-shadow(0 3px 8px rgba(0,0,0,0.25))';
              const risk = totalComplaints > highThreshold ? 'High' : (totalComplaints > lowThreshold ? 'Medium' : 'Low');
              setHoverInfo({
                name: district ? district.name : 'Unknown',
                major: district ? district.complaintsMajor : 0,
                minor: district ? district.complaintsMinor : 0,
                risk
              });
              setMousePos({ x: e.clientX, y: e.clientY });
            });
            path.addEventListener('mouseleave', () => {
              path.style.filter = 'none';
              setHoverInfo(null);
            });

            path.addEventListener('click', () => {
              onDistrictClick(districtId);
            });
          } else {
            // Non-district decorative paths â€” must NOT intercept mouse events
            path.style.pointerEvents = 'none';
            if (pathId === 'path1097') {
              path.style.fill = 'transparent';
              path.style.stroke = 'transparent';
              path.style.strokeWidth = '0px';
            } else {
              path.style.fill = 'transparent';
              path.style.stroke = '#e2e8f0';
              path.style.strokeWidth = '2px';
            }
          }
        });

        // Style text labels
        const texts = svg.querySelectorAll('text');
        texts.forEach(text => {
          text.style.fontFamily = "'Inter', sans-serif";
          text.style.fontWeight = '700';
          text.style.fontSize = '30px';
          text.style.fill = '#1e293b';
          text.style.pointerEvents = 'none';
        });

        setSvgLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load map:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p style="text-align:center;padding:20px;color:#64748b;">Map failed to load.</p>';
        }
      });
  }, []);

  // Re-highlight selected district whenever it changes
  useEffect(() => {
    if (!svgLoaded || !containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('path').forEach(path => {
      const pathId = path.getAttribute('id');
      const districtId = PATH_TO_DISTRICT[pathId];
      if (!districtId) return;

      const district = districtsList.find(d => d.id === districtId);
      const totalComplaints = district
        ? (district.complaintsMajor || 0) + (district.complaintsMinor || 0)
        : 0;

      if (selectedDistrict === districtId) {
        path.style.strokeWidth = '6px';
        path.style.stroke = '#ffffff';
        path.style.filter = 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.2))';
      } else {
        path.style.fill = resolveRiskColor(totalComplaints);
        path.style.strokeWidth = '3px';
        path.style.stroke = '#ffffff';
        path.style.filter = 'none';
      }
    });
  }, [selectedDistrict, svgLoaded]);

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
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Karnataka</span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            {districtsList.length} Districts &middot; Click a district to view details, click again to explore
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
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Karnataka Map</h3>
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
              {counts.major} Major
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></span>
              {counts.minor} Minor
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
              {counts.low} Low Risk
            </span>
          </div>
        </div>

        <div ref={containerRef} className="map-svg-viewport" style={{ width: '100%', flex: 1, minHeight: 0 }} />
      </div>

      <MapTooltip hoverInfo={hoverInfo} mousePos={mousePos} type="district" />
    </div>
  );
}
