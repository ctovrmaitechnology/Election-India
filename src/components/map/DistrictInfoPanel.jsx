import React from 'react';
import { districtsData } from '../../data/mockData.js';
import { getRiskColor } from '../../utils/helpers';

export default function DistrictInfoPanel({ districtId }) {
  if (!districtId || districtId === 'All') return null;
  const d = districtsData.find(x => x.id === districtId);
  if (!d) return null;
  const total = d.complaintsMajor + d.complaintsMinor;
  const risk  = total > 400 ? 'Major Risk' : total > 150 ? 'Minor Risk' : 'Low Risk';
  const color = getRiskColor(total);

  return (
    <div className="district-info-panel" style={{ borderLeftColor: color }}>
      <div className="district-info-header">
        <h4 className="district-info-name">{d.name}</h4>
        <span className="district-info-hq">HQ: {d.hq}</span>
      </div>
      <div className="district-info-stats">
        <div className="dist-stat"><span className="dist-stat-val">{d.population.toLocaleString()}</span><span className="dist-stat-lbl">Population</span></div>
        <div className="dist-stat"><span className="dist-stat-val">{d.constituenciesCount}</span><span className="dist-stat-lbl">Constituencies</span></div>
        <div className="dist-stat"><span className="dist-stat-val">{d.wardsCount}</span><span className="dist-stat-lbl">Wards</span></div>
        <div className="dist-stat"><span className="dist-stat-val">{d.engaged.toLocaleString()}</span><span className="dist-stat-lbl">Engaged</span></div>
      </div>
    </div>
  );
}

