import React, { useState, useEffect, useRef } from 'react';
import { districtsData, constituencyWardsData } from '../../data/mockData.js';
import ExcelUploadModal from '../ui/ExcelUploadModal';

export default function TopHeader({ user, onLogout, activePage, onSearchSelect, onBack, onNext, canGoBack, canGoNext, onToggleMenu, stateName = 'India Campaign', districts = [], allDistricts = [] }) {
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');

  const isOverview = activePage === 'overview';

  let headerTitle = "Overview Dashboard";
  let headerSubtitle = "Grievance Management Summary";

  if (activePage === 'districts') {
    const regionText = stateName === 'India Campaign' ? 'India Campaign Region' : `${stateName} State`;
    headerTitle = `All Districts - ${stateName}`;
    headerSubtitle = `${regionText} — ${districts.length} Districts · Click a district to explore`;
  } else if (activePage === 'hierarchy') {
    headerTitle = "Constituency Hierarchy";
    headerSubtitle = "Interactive Constituency & Ward Map";
  } else if (activePage === 'settings') {
    headerTitle = "System Settings";
    headerSubtitle = "Manage your profile, credentials, and preferences";
  }

  // --- Search Logic ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    
    // Find matching district in the search source (global if available, otherwise fallback)
    const searchSource = allDistricts.length > 0 ? allDistricts : districts;
    const matchedDistricts = searchSource.filter(d => d.name.toLowerCase().includes(lowerQuery));
    
    let results = matchedDistricts.map(d => ({
      id: d.id,
      distObj: d,
      type: 'District',
      label: d.name
    }));

    if (results.length === 0) {
      Object.entries(constituencyWardsData).forEach(([distId, constituencies]) => {
         const matchingConst = constituencies.find(c => c.name.toLowerCase().includes(lowerQuery));
         if (matchingConst && results.length < 5) {
            const d = searchSource.find(x => x.id === distId);
            if (d) {
              results.push({
                 id: distId + matchingConst.name,
                 distObj: d,
                 type: 'Constituency',
                 label: `${matchingConst.name} (in ${d.name})`
              });
            }
         }
      });
    }

    setSearchResults(results);
    setIsSearchOpen(true);
  }, [searchQuery, districts, allDistricts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0];
      setIsSearchOpen(false);
      setSearchQuery('');
      if (onSearchSelect) onSearchSelect(bestMatch.distObj);
    }
  };

  return (
    <header className="top-header">
      <div className="header-titles" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
        {/* Hamburger Menu Toggle */}
        <button className="mobile-menu-btn" onClick={onToggleMenu} aria-label="Toggle Menu" style={{ marginTop: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        {/* Back and Next Arrows */}
        <div className="nav-arrows" style={{ display: 'flex', gap: '8px', marginRight: '8px', marginTop: '2px' }}>
          <button 
            onClick={onBack} 
            disabled={!canGoBack}
            title="Go Back"
            style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', background: canGoBack ? '#fff' : '#f8fafc', color: canGoBack ? '#1e293b' : '#cbd5e1', cursor: canGoBack ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: canGoBack ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={onNext} 
            disabled={!canGoNext}
            title="Go Forward"
            style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', background: canGoNext ? '#fff' : '#f8fafc', color: canGoNext ? '#1e293b' : '#cbd5e1', cursor: canGoNext ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: canGoNext ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <h2 className="overview-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', wordBreak: 'break-word' }}>
            {headerTitle}
            {activePage === 'districts' && (
              <span className="districts-count-badge" style={{ fontSize: '11px', padding: '4px 10px', height: 'fit-content', whiteSpace: 'nowrap' }}>
                {districts.length} Districts
              </span>
            )}
          </h2>
          <p className="overview-subtitle">{headerSubtitle}</p>
        </div>
      </div>
      
      <div className="top-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Excel Upload Icon (ONLY on Constituency Hierarchy page) */}
        {activePage === 'hierarchy' && (
          <div className="excel-upload-container" style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setIsExcelModalOpen(true)}
              title="Bulk Upload Excel Template (Constituency, Ward, Booth, Area, Citizen, ID)"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 16px', height: '38px', background: '#10b981', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', fontWeight: '600', fontSize: '13px' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="13" x2="15" y2="19"></line>
                <line x1="15" y1="13" x2="9" y2="19"></line>
              </svg>
              Excel Upload
            </button>
          </div>
        )}

        {/* Global Search Bar (Right Side) - hidden on overview */}
        {!isOverview && (
          <div className="global-search-container" ref={searchRef} style={{ position: 'relative' }}>
            <div className="global-search-input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', width: '100%', transition: 'all 0.2s' }}>
              <button 
                type="button"
                onClick={handleSearchSubmit}
                style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', marginRight: '8px' }}
                title="Search"
              >
                <svg viewBox="0 0 24 24" className="search-icon" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <input 
                type="text" 
                placeholder="Search district, constituency..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setIsSearchOpen(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#1e293b' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 4px', fontSize: '16px' }}>&times;</button>
              )}
            </div>

            {isSearchOpen && searchResults.length > 0 && (
              <div className="search-results-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '300px', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, overflow: 'hidden' }}>
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="search-result-item" 
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
                    onMouseDown={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      if (onSearchSelect) onSearchSelect(result.distObj);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{result.label}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{result.type} Match &middot; Click to view</span>
                  </div>
                ))}
              </div>
            )}
            {isSearchOpen && searchResults.length === 0 && searchQuery.length >= 2 && (
              <div className="search-results-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '300px', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 1000, padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No districts or constituencies found.
              </div>
            )}
          </div>
        )}

        {isOverview && (
          <div className="date-selector" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" className="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="date-input-field" 
            />
            <span className="date-separator">—</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="date-input-field" 
            />
          </div>
        )}
      </div>

      {/* Excel Upload Modal */}
      <ExcelUploadModal 
        isOpen={isExcelModalOpen} 
        onClose={() => setIsExcelModalOpen(false)} 
        onUploadSuccess={(distId) => {
          const dist = districtsData.find(d => d.id === distId);
          if (dist && onSearchSelect) {
             onSearchSelect(dist);
          }
        }}
      />
    </header>
  );
}
