import React, { useState } from 'react';
import DrilldownList from '../../components/ui/DrilldownList';

export default function WardDashboard({ ward, booths, onBoothClick, onToggleVisited }) {
  const [issueFilter, setIssueFilter] = React.useState('total');

  return (
    <div className="hierarchy-dashboard">
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-title">Total Ward Problems</div>
          <div className="kpi-value">{ward.totalIssues}</div>
        </div>
        <div className="kpi-card visited-status-card">
          <div>
            <div className="kpi-title">Visited Status</div>
            <div className="kpi-value" style={{ color: ward.visited ? '#10b981' : '#dc2626', fontSize: '24px', marginTop: '4px' }}>
              {ward.visited ? 'Visited' : 'Not Visited'}
            </div>
          </div>
          <button 
            onClick={() => onToggleVisited(ward.id)}
            className={`toggle-visited-btn ${ward.visited ? 'unvisited' : ''}`}
            style={{ padding: '8px 16px', fontSize: '12.5px', width: 'fit-content', alignSelf: 'flex-start', marginTop: '12px', borderRadius: '8px', fontWeight: '600' }}
          >
            {ward.visited ? 'Cancel, Mark Not Visited' : 'Yes, Mark as Visited'}
          </button>
        </div>
      </div>

      <div className="ward-issues-grid">
        <div className="interactive-table-card" style={{ alignSelf: 'start' }}>
          <div className="card-header border-bottom">
            <h3 className="card-title">Top Issues Overview</h3>
            <select 
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: '600', outline: 'none', color: '#334155', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
            >
              <option value="total">All Issues</option>
              <option value="major">Major Only</option>
              <option value="minor">Minor Only</option>
            </select>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {(() => {
              const filtered = ward.topIssues.filter(issue => issueFilter === 'total' || issue.severity === issueFilter);
              if (filtered.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No issues found.</div>;
              const maxCount = Math.max(...filtered.map(i => i.count), 1);
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {filtered.map((issue, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: issue.severity === 'major' ? '#ef4444' : '#f59e0b', flexShrink: 0 }}></span>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>{issue.type}</span>
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: issue.severity === 'major' ? '#b91c1c' : '#b45309', background: issue.severity === 'major' ? '#fef2f2' : '#fffbeb', padding: '4px 10px', borderRadius: '12px' }}>
                          {issue.count} complaints
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(issue.count / maxCount) * 100}%`, height: '100%', background: issue.severity === 'major' ? 'linear-gradient(90deg, #f87171, #dc2626)' : 'linear-gradient(90deg, #fbbf24, #d97706)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        <DrilldownList 
          title="Booth-wise Issue Count"
          items={booths}
          columns={[
            { header: 'Booth Name',       field: 'name',     align: 'left',   width: '38%' },
            { header: 'Incharge',         field: 'incharge', align: 'left',   width: '26%' },
            { header: 'Registered Voters', field: 'voters',  align: 'center', width: '20%' },
            { header: 'Issues',           field: 'issues',   align: 'center', width: '16%' }
          ]}
          onRowClick={onBoothClick}
        />
      </div>
    </div>
  );
}

