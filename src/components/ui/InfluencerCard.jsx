import React from 'react';

export default function InfluencerCard({ inf }) {
  const supportColor = inf.support === 'Supportive' || inf.support === 'Enthusiastic'
    ? '#10b981' : inf.support === 'Neutral' ? '#eab308' : '#dc2626';
  const influenceColor = inf.influence === 'High' ? '#7c3aed' : '#3b82f6';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
      padding: '14px 18px', background: '#f8fafc', marginBottom: '10px',
      borderRadius: '10px', border: '1px solid #e2e8f0', gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '800', fontSize: '16px', flexShrink: 0
        }}>
          {inf.name.charAt(inf.name.indexOf(' ') + 1) || inf.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{inf.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{inf.role}</div>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px', fontWeight: '600' }}>{inf.phone}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          background: influenceColor + '18', color: influenceColor,
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
        }}>{inf.influence} Influence</span>
        <span style={{
          background: supportColor + '18', color: supportColor,
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
        }}>{inf.support}</span>
      </div>
    </div>
  );
}

