import React from 'react';

export default function ProblemsTable({ title, color, problems, baseDenominator, totalCount }) {
  return (
    <div className="card problems-card" style={{ border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', borderRadius: '12px', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-info">
          <h3 className="card-title" style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span className="bullet-dot" style={{ backgroundColor: color, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${color}60` }}></span>
            {title}
          </h3>
        </div>
      </div>
      <div className="problems-list-container" style={{ padding: '0' }}>
        <table className="problems-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problem</th>
              <th className="text-right" style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaints</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => {
              const ratio = baseDenominator > 0 ? totalCount / baseDenominator : 0;
              const complaints = totalCount > 0 ? Math.max(1, Math.round(p.complaints * ratio)) : 0;
              return (
                <tr 
                  key={i} 
                  style={{ borderBottom: i === problems.length - 1 ? 'none' : '1px solid #f1f5f9' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                    {p.problem}
                  </td>
                  <td className="text-right" style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: `${color}15`, 
                      color: color, 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      fontSize: '13px', 
                      display: 'inline-block', 
                      minWidth: '60px', 
                      textAlign: 'center' 
                    }}>
                      {complaints.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
