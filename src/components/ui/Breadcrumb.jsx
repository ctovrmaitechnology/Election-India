import React from 'react';

export default function Breadcrumb({ path, onNavigate, prefixCrumbs = [] }) {
  const getIcon = (level) => {
    switch (level) {
      case 'india': return '🌏';
      case 'state': return '🗺️';
      case 'district': return '📍';
      case 'constituency': return '🏛️';
      case 'ward': return '🏨️';
      case 'booth': return '🗳️';
      case 'area': return '🛣️';
      case 'citizen': return '👤';
      case 'problem': return '⚠️';
      default: return '📍';
    }
  };

  const allCrumbs = [
    ...prefixCrumbs.map(c => ({ ...c, isPrefix: true })),
    ...path.map((step, index) => ({ ...step, originalIndex: index, isPrefix: false }))
  ];

  return (
    <div className="breadcrumb-container premium-shadow" style={{ flexWrap: 'wrap' }}>
      {allCrumbs.map((crumb, i) => {
        const isLast = i === allCrumbs.length - 1;
        return (
          <React.Fragment key={i}>
            <button
              className={`breadcrumb-pill ${isLast ? 'active' : ''}`}
              onClick={() => {
                if (crumb.isPrefix) {
                  crumb.onClick && crumb.onClick();
                } else {
                  onNavigate(crumb.originalIndex);
                }
              }}
            >
              <span className="breadcrumb-icon">{getIcon(crumb.level)}</span>
              <span className="breadcrumb-text">{crumb.label}</span>
            </button>
            {!isLast && <span className="breadcrumb-separator">›</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
