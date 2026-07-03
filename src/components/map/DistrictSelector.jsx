import React from 'react';
import { districtsData } from '../../data/mockData.js';

export default function DistrictSelector({ selectedDistrict, onChange }) {
  const sorted = [...districtsData].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="district-selector-bar">
      <label htmlFor="district-select" className="selector-label">Filter District:</label>
      <select
        id="district-select"
        className="map-select"
        value={selectedDistrict}
        onChange={e => onChange(e.target.value)}
      >
        <option value="All">All Districts</option>
        {sorted.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      {selectedDistrict !== 'All' && (
        <button className="clear-btn" onClick={() => onChange('All')}>✕ Clear</button>
      )}
    </div>
  );
}

