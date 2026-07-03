import React from 'react';

export default function DrilldownList({ title, items, columns, onRowClick }) {
  return (
    <div className="interactive-table-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span style={{ fontSize: '12px', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
          {items.length} {items.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="drilldown-table">
          <colgroup>
            <col style={{ width: '60px' }} />
            {columns.map((col, i) => (
              <col key={i} style={{ width: col.width || 'auto' }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
              {columns.map((col, i) => (
                <th key={i} style={{ textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} onClick={() => onRowClick(item)} className="clickable-row">
                <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>{i + 1}</td>
                {columns.map((col, j) => (
                  <td key={j} style={{ textAlign: col.align || 'left', fontWeight: j === 0 ? '600' : '500', color: j === 0 ? '#111827' : '#374151' }}>
                    {col.render ? col.render(item) : item[col.field]}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8', fontSize: '14px' }}>
                  📋 No records found at this level.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

