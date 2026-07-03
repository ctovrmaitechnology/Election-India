import React from 'react';
import DistrictCard from './DistrictCard';

export default function DistrictGrid({ districts, onDistrictClick }) {
  return (
    <div className="premium-district-grid">
      {districts.map((district, index) => (
        <DistrictCard
          key={district.id}
          district={district}
          index={index}
          onClick={() => onDistrictClick(district)}
        />
      ))}
    </div>
  );
}
