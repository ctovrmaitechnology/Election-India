import React from 'react';
import StateMapRouter from '../map/StateMapRouter';
import ProblemsTable from '../ui/ProblemsTable';
import KPICards from '../ui/KPICards';
import { majorProblemsDefault, minorProblemsDefault } from '../../data/mockData';

export default function StateOverviewPanel({
  stateId,
  stateName,
  selectedDistrict,
  onDistrictClick,
  loadedStates,
  stats,
  onBackToIndia,
}) {
  return (
    <div className="state-overview-panel">
      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <KPICards stats={stats} />

      {/* ── 3-Column layout matching the screenshot ───────────────────────── */}
      <div className="map-problems-grid state-map-full">
        <StateMapRouter
          stateId={stateId}
          selectedDistrict={selectedDistrict}
          onDistrictClick={onDistrictClick}
          loadedStates={loadedStates}
          onBackToIndia={onBackToIndia}
        />

        <ProblemsTable
          title={`Major Problems — ${stateName}`}
          color="#dc2626"
          problems={majorProblemsDefault}
          baseDenominator={3426}
          totalCount={stats.major}
        />
        
        <ProblemsTable
          title={`Minor Problems — ${stateName}`}
          color="#eab308"
          problems={minorProblemsDefault}
          baseDenominator={1248}
          totalCount={stats.minor}
        />
      </div>
    </div>
  );
}
