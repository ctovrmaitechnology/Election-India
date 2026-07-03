import React from 'react';

export default function KPICards({ stats }) {
  const { major, minor, candidates, visited, notVisited } = stats;
  const total = major + minor;
  const visitedTotal = visited + notVisited;

  const majorPct   = total > 0        ? ((major / total) * 100).toFixed(1)         : '0.0';
  const minorPct   = total > 0        ? ((minor / total) * 100).toFixed(1)         : '0.0';
  const visitedPct = visitedTotal > 0 ? ((visited / visitedTotal) * 100).toFixed(1) : '0.0';
  const notVisPct  = visitedTotal > 0 ? ((notVisited / visitedTotal) * 100).toFixed(1) : '0.0';

  return (
    <section className="kpi-cards-grid">

      {/* Major Problems */}
      <div className="kpi-card purple-theme">
        <div className="kpi-card-header">
          <div className="kpi-icon-container">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Major Problems</span>
            <span className="kpi-value">{major.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card-footer">
          <span className="kpi-percentage">{majorPct}%</span>
          <span className="kpi-footer-subtext">of Total</span>
        </div>
      </div>

      {/* Minor Problems */}
      <div className="kpi-card orange-theme">
        <div className="kpi-card-header">
          <div className="kpi-icon-container">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Minor Problems</span>
            <span className="kpi-value">{minor.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card-footer">
          <span className="kpi-percentage">{minorPct}%</span>
          <span className="kpi-footer-subtext">of Total</span>
        </div>
      </div>



      {/* Visited */}
      <div className="kpi-card green-theme">
        <div className="kpi-card-header">
          <div className="kpi-icon-container">
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Visited</span>
            <span className="kpi-value">{visited.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card-footer">
          <span className="kpi-percentage">{visitedPct}%</span>
          <span className="kpi-footer-subtext">of Total</span>
        </div>
      </div>

      {/* Not Visited */}
      <div className="kpi-card red-theme">
        <div className="kpi-card-header">
          <div className="kpi-icon-container">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Not Visited</span>
            <span className="kpi-value">{notVisited.toLocaleString()}</span>
          </div>
        </div>
        <div className="kpi-card-footer">
          <span className="kpi-percentage">{notVisPct}%</span>
          <span className="kpi-footer-subtext">of Total</span>
        </div>
      </div>

    </section>
  );
}

