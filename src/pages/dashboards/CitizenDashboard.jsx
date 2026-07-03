import React from 'react';
import DrilldownList from '../../components/ui/DrilldownList';

export default function CitizenDashboard({ citizen, problems, onProblemClick }) {
  return (
    <div className="hierarchy-dashboard">
      <div className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-title">Total Complaints</div>
          <div className="kpi-value">{citizen.problemsCount}</div>
        </div>
      </div>

      <DrilldownList 
        title="Problems Logged by Citizen"
        items={problems}
        columns={[
          { header: 'ID', field: 'id', width: '15%' },
          { header: 'Problem Type', field: 'type', width: '35%' },
          { header: 'Priority', field: 'priority', width: '25%' },
          { header: 'Status', field: 'status', width: '25%' }
        ]}
        onRowClick={onProblemClick}
      />
    </div>
  );
}

