import React from 'react';
import DrilldownList from '../../components/ui/DrilldownList';
import InfluencerCard from '../../components/ui/InfluencerCard';

export default function AreaDashboard({ area, citizens, onCitizenClick }) {
  return (
    <div className="hierarchy-dashboard">
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-title">Local Population</div>
          <div className="kpi-value">{area.population.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Active Volunteers</div>
          <div className="kpi-value">{area.activeVolunteers}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Complaints</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>{area.issues}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Top Discussed Issue</div>
          <div className="kpi-value" style={{ fontSize: '14px', lineHeight: '1.3' }}>{area.topDiscussed}</div>
        </div>
      </div>

      <div className="card problems-card mt-4">
        <div className="card-header border-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">Influencers / Local Leaders</h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{area.influencers.length} contacts</span>
        </div>
        <div style={{ padding: '16px' }}>
          {area.influencers.map((inf, idx) => (
            <InfluencerCard key={idx} inf={inf} />
          ))}
        </div>
      </div>

      <DrilldownList 
        title="Citizens with Complaints"
        items={citizens}
        columns={[
          { header: 'Citizen Name', field: 'name',          align: 'left',   width: '40%' },
          { header: 'Phone',        field: 'phone',         align: 'left',   width: '40%' },
          { header: 'Complaints',   field: 'problemsCount', align: 'center', width: '20%' }
        ]}
        onRowClick={onCitizenClick}
      />
    </div>
  );
}

