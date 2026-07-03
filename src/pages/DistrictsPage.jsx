import React from 'react';
import DistrictGrid from '../components/ui/DistrictGrid';

export default function DistrictsPage({ districts = [], onDistrictClick }) {
  const sorted = [...districts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="districts-page">
      <DistrictGrid districts={sorted} onDistrictClick={onDistrictClick} />
    </div>
  );
}
