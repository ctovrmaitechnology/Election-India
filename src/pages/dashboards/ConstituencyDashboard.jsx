import React from 'react';
import DrilldownList from '../../components/ui/DrilldownList';

export default function ConstituencyDashboard({ constituency, wards, onWardClick }) {
  const totalComplaints = wards.reduce((sum, w) => sum + w.totalIssues, 0);
  const visitedCount = wards.filter(w => w.visited).length;
  const notVisitedCount = wards.length - visitedCount;
  
  const visitedComplaints = wards.filter(w => w.visited).reduce((sum, w) => sum + w.totalIssues, 0);
  const notVisitedComplaints = totalComplaints - visitedComplaints;

  return (
    <div className="hierarchy-dashboard">
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-title">Total People Complaints</div>
          <div className="kpi-value">{totalComplaints}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Across {wards.length} Wards</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Visited Wards Complaints</div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{visitedComplaints}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>In {visitedCount} Visited Wards</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Not Visited Wards Complaints</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>{notVisitedComplaints}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>In {notVisitedCount} Not Visited Wards</div>
        </div>
      </div>

      <div className="ai-insights-card" style={{ background: 'linear-gradient(145deg, #ffffff, #f8fafc)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0' }}>
          <span style={{ fontSize: '22px' }}>✨</span> AI Insights: {constituency.name}
        </h3>
        <div className="insights-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Critical Issues</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {constituency.aiInsights.topIssues.map((issue, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#334155' }}>{issue.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: '20px' }}>
                    {issue.count} complaints
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Critical Area</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{constituency.aiInsights.criticalArea}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Root Cause Analysis</span>
              <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>{constituency.aiInsights.reason}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                 Recommended Action
              </span>
              <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#b91c1c' }}>{constituency.aiInsights.action}</span>
            </div>
          </div>
        </div>
      </div>

      <DrilldownList 
        title="Wards with Most Problems"
        items={wards}
        columns={[
          { header: 'Ward Name',    field: 'name',        align: 'left',   width: '35%' },
          { header: 'Corporator',   field: 'corporator',  align: 'left',   width: '25%',
            render: (w) => w.corporator.replace('Corporator ', '')
          },
          { header: 'Booths',       field: 'booths',      align: 'center',  width: '12%' },
          { 
            header: 'Visited', 
            field: 'visited', 
            align: 'center', 
            width: '14%',
            render: (w) => w.visited ? (
              <span style={{ backgroundColor: '#10b981', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            ) : (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </span>
            )
          },
          { header: 'Total Issues', field: 'totalIssues', align: 'center', width: '14%',
            render: (w) => (
              <span style={{ color: w.totalIssues >= 4 ? '#ef4444' : w.totalIssues === 3 ? '#f97316' : '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                {w.totalIssues}
              </span>
            )
          }
        ]}
        onRowClick={onWardClick}
      />
    </div>
  );
}

