import React from 'react';

/**
 * Reusable map tooltip component.
 * Props:
 *  - hoverInfo: { name, major, minor, total?, risk, districts? }
 *  - mousePos:  { x, y }
 *  - type:      'state' | 'district'
 */
export default function MapTooltip({ hoverInfo, mousePos, type = 'district' }) {
  if (!hoverInfo) return null;

  const left = typeof window !== 'undefined'
    ? Math.max(10, Math.min(mousePos.x + 18, window.innerWidth - 240))
    : mousePos.x + 18;

  const flipUp = typeof window !== 'undefined' && mousePos.y >= 160;
  const top    = typeof window !== 'undefined'
    ? (flipUp ? mousePos.y - 15 : mousePos.y + 22)
    : mousePos.y + 22;

  if (hoverInfo.isNonSouth) {
    return (
      <div
        className="map-tooltip premium-shadow"
        style={{
          position:      'fixed',
          left,
          top,
          transform:     flipUp ? 'translateY(-100%)' : 'none',
          background:    'rgba(255,255,255,0.97)',
          backdropFilter:'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding:       '12px 16px',
          borderRadius:  '12px',
          pointerEvents: 'none',
          zIndex:        9999,
          border:        '1px solid #e2e8f0',
          minWidth:      '180px',
          maxWidth:      '260px',
          boxShadow:     '0 10px 30px rgba(0,0,0,0.12)',
          animation:     'tooltipFadeIn 0.12s ease',
        }}
      >
        <div style={{
          fontWeight:    800,
          fontSize:      '14px',
          color:         '#0f172a',
          marginBottom:  '4px',
          display:       'flex',
          alignItems:    'center',
          gap:           '6px',
        }}>
          <span style={{ fontSize: '15px' }}>🗺️</span>
          {hoverInfo.name}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
          Region outside active campaign workspace
        </div>
      </div>
    );
  }

  const riskColor = hoverInfo.risk === 'High'
    ? '#dc2626'
    : hoverInfo.risk === 'Medium'
      ? '#eab308'
      : '#2563eb';

  const riskBg = hoverInfo.risk === 'High'
    ? '#fee2e2'
    : hoverInfo.risk === 'Medium'
      ? '#fef9c3'
      : '#dbeafe';

  return (
    <div
      className="map-tooltip premium-shadow"
      style={{
        position:      'fixed',
        left,
        top,
        transform:     flipUp ? 'translateY(-100%)' : 'none',
        background:    'rgba(255,255,255,0.97)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding:       '14px 18px',
        borderRadius:  '12px',
        pointerEvents: 'none',
        zIndex:        9999,
        border:        '1px solid #e2e8f0',
        minWidth:      '210px',
        maxWidth:      '280px',
        boxShadow:     '0 10px 30px rgba(0,0,0,0.12)',
        animation:     'tooltipFadeIn 0.12s ease',
      }}
    >
      {/* Title */}
      <div style={{
        fontWeight:    800,
        fontSize:      '15px',
        color:         '#0f172a',
        marginBottom:  '10px',
        borderBottom:  '1px solid #f1f5f9',
        paddingBottom: '8px',
        display:       'flex',
        alignItems:    'center',
        gap:           '6px',
      }}>
        <span style={{ fontSize: '16px' }}>{type === 'state' ? '🗺️' : '📍'}</span>
        {hoverInfo.name}
      </div>

      {/* Stats rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <StatRow label="Major Issues" value={hoverInfo.major} color="#dc2626" />
        <StatRow label="Minor Issues" value={hoverInfo.minor} color="#eab308" />
        {type === 'state' && hoverInfo.total != null && (
          <StatRow label="Total Complaints" value={hoverInfo.total} color="#1e293b" bold />
        )}
        {type === 'state' && hoverInfo.districts != null && (
          <StatRow label="Districts" value={hoverInfo.districts} color="#7c3aed" />
        )}
      </div>

      {/* Risk badge */}
      <div style={{
        marginTop:     '10px',
        paddingTop:    '8px',
        borderTop:     '1px solid #f1f5f9',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
      }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Risk Level</span>
        <span style={{
          fontSize:       '11px',
          fontWeight:     800,
          color:          riskColor,
          background:     riskBg,
          padding:        '3px 10px',
          borderRadius:   '20px',
          letterSpacing:  '0.3px',
        }}>
          {hoverInfo.risk}
        </span>
      </div>

      {/* Click hint */}
      <div style={{
        marginTop:  '8px',
        fontSize:   '10.5px',
        color:      '#94a3b8',
        textAlign:  'center',
        fontStyle:  'italic',
      }}>
        Click to drill down ↓
      </div>
    </div>
  );
}

function StatRow({ label, value, color, bold }) {
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      fontSize:       '12.5px',
    }}>
      <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
      <strong style={{ color, fontWeight: bold ? 800 : 700, fontSize: bold ? '13px' : '12.5px' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </strong>
    </div>
  );
}
