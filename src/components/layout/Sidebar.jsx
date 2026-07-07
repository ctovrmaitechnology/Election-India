import React from 'react';

function AppLogo() {
  return (
    <div style={{
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
  );
}

export default function Sidebar({
  activePage,
  onNavClick,
  user,
  onLogout,
  isOpen,
  onClose,
  selectedState,
  loadedStates,
  selectedDistrict,
  onDistrictClick
}) {
  const stateNames = {
    'IN-KA': 'KARNATAKA',
    'IN-TN': 'TAMIL NADU',
    'IN-KL': 'KERALA',
    'IN-TG': 'TELANGANA',
    'IN-AP': 'ANDHRA PRADESH',
    'IN-MH': 'MAHARASHTRA',
    'IN-CG': 'CHHATTISGARH',
    'IN-OD': 'ODISHA',
    'IN-GJ': 'GUJARAT',
    'IN-MP': 'MADHYA PRADESH',
    'IN-WB': 'WEST BENGAL',
    'IN-PY': 'PUDUCHERRY',
    'IN-JH': 'JHARKHAND',
    'IN-RJ': 'RAJASTHAN',
    'IN-GA': 'GOA',
    'IN-AN': 'ANDAMAN & NICOBAR',
    'IN-LD': 'LAKSHADWEEP',
    'IN-DN': 'DADRA & NAGAR HAVELI',
    'IN-BR': 'BIHAR',
    'IN-UP': 'UTTAR PRADESH',
    'IN-PB': 'PUNJAB',
    'IN-HR': 'HARYANA',
    'IN-HP': 'HIMACHAL PRADESH',
    'IN-UT': 'UTTARAKHAND',
    'IN-AS': 'ASSAM',
    'IN-TR': 'TRIPURA',
    'IN-MN': 'MANIPUR',
    'IN-ML': 'MEGHALAYA',
    'IN-MZ': 'MIZORAM',
    'IN-NL': 'NAGALAND',
    'IN-AR': 'ARUNACHAL PRADESH',
    'IN-SK': 'SIKKIM',
    'IN-JK': 'JAMMU & KASHMIR',
    'All': 'INDIA CAMPAIGN'
  };

  const currentStateName = stateNames[selectedState] || 'INDIA CAMPAIGN';

  const navItems = [
    { id: 'overview',    label: 'Overview Map',       icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></> },
    { id: 'districts',   label: selectedState === 'All' ? 'States' : 'Districts', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
    { id: 'settings',    label: 'Settings',           icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
  ];

  // Resolve districts list for current selected state
  const districtsList = (loadedStates && loadedStates.get(selectedState)) || [];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="sidebar-header">
          <div className="app-logo">
            <AppLogo />
          </div>
          <div>
            <h1 className="logo-text">{selectedState === 'IN-GA' ? 'GOA' : 'INDIA'}</h1>
            <p className="logo-subtitle">{selectedState === 'IN-GA' ? 'PEOPLE CONNECT' : 'REGIONAL DASHBOARD'}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav" style={{ flex: 'none', marginBottom: '16px' }}>
          {navItems.map(item => (
            <a
              key={item.id}
              href="#"
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); onNavClick(item.id); if(onClose) onClose(); }}
            >
              <svg viewBox="0 0 24 24">{item.icon}</svg>
              {item.label}
            </a>
          ))}
        </nav>


        {/* ─── Admin Profile & Sign Out ─── */}
        <div className="sidebar-admin-card" style={{ marginTop: 'auto' }}>
          <div className="sidebar-admin-top">
            <img
              className="sidebar-admin-avatar"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
              alt="Admin"
            />
            <div className="sidebar-admin-meta">
              <span className="sidebar-admin-name">{user ? user.name : 'Admin'}</span>
              <span className="sidebar-admin-role">{user ? user.role : 'Super Admin'}</span>
            </div>
          </div>
          {user?.email && (
            <div className="sidebar-admin-email">{user.email}</div>
          )}
          <button className="sidebar-signout-btn" onClick={onLogout}>
            <svg viewBox="0 0 24 24" className="sidebar-signout-icon">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
