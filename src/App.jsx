import React, { useState, useEffect } from 'react';
import {
  districtsData,
  majorProblemsDefault,
  minorProblemsDefault
} from './data/mockData.js';

import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import KPICards from './components/ui/KPICards';
import IndiaMap from './components/map/IndiaMap';
import StateMapRouter from './components/map/StateMapRouter';
import StateOverviewPanel from './components/map/StateOverviewPanel';
import ProblemsTable from './components/ui/ProblemsTable';
import DistrictsPage from './pages/DistrictsPage';
import HierarchyManager from './pages/dashboards/HierarchyManager';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import { fetchStateDistricts } from './utils/statesData';
import { fetchWithRetry } from './utils/helpers';

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('grievance_user');
    return saved ? JSON.parse(saved) : null;
  });

  // History tracking for browser-like navigation
  const [history, setHistory] = useState(() => {
    const saved = sessionStorage.getItem('app_history');
    return saved ? JSON.parse(saved) : [{ page: 'overview', state: 'All', dist: 'All', hier: null }];
  });
  const [historyIndex, setHistoryIndex] = useState(() => {
    const saved = sessionStorage.getItem('app_historyIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Keep track of loaded state data (Option A live store)
  const [loadedStates, setLoadedStates] = useState(() => {
    const initial = new Map();
    const karnatakaWithState = districtsData.map(d => ({ ...d, stateId: 'IN-KA' }));
    initial.set('IN-KA', karnatakaWithState); // Karnataka is pre-loaded by default
    return initial;
  });

  const [summary, setSummary] = useState(null);
  const [loadingStateId, setLoadingStateId] = useState(null);

  // Synchronize history session storage
  useEffect(() => {
    sessionStorage.setItem('app_history', JSON.stringify(history));
    sessionStorage.setItem('app_historyIndex', historyIndex.toString());
  }, [history, historyIndex]);

  // Load stateSummary.json and pre-load all state districts on startup for instant global search and zero-delay navigation!
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    async function initAppData() {
      try {
        // Load summary
        const res = await fetchWithRetry('/data/stateSummary.json', { signal });
        const summaryData = await res.json();
        if (summaryData['IN-TN']) {
          summaryData['IN-TN'].complaintsMajor *= 10;
          summaryData['IN-TN'].complaintsMinor *= 10;
          summaryData['IN-TN'].totalComplaints = summaryData['IN-TN'].complaintsMajor + summaryData['IN-TN'].complaintsMinor;
        }
        setSummary(summaryData);

        // Pre-load all other states in parallel
        const statesToLoad = [
          { id: 'IN-TN', file: 'tamilnadu' },
          { id: 'IN-KL', file: 'kerala' },
          { id: 'IN-TG', file: 'telangana' },
          { id: 'IN-AP', file: 'andhrapradesh' },
          { id: 'IN-MH', file: 'maharashtra' },
          { id: 'IN-CG', file: 'chhattisgarh' },
          { id: 'IN-OD', file: 'odisha' },
          { id: 'IN-GJ', file: 'gujarat' },
          { id: 'IN-MP', file: 'madhyapradesh' },
          { id: 'IN-WB', file: 'westbengal' },
          { id: 'IN-PY', file: 'puducherry' },
          { id: 'IN-JH', file: 'jharkhand' },
          { id: 'IN-RJ', file: 'rajasthan' },
          { id: 'IN-GA', file: 'goa' },
          { id: 'IN-AN', file: 'andaman' },
          { id: 'IN-LD', file: 'lakshadweep' },
          { id: 'IN-DN', file: 'dadra_nagar_haveli' },
          { id: 'IN-BR', file: 'bihar' },
          { id: 'IN-UP', file: 'uttarpradesh' },
          { id: 'IN-PB', file: 'punjab' },
          { id: 'IN-HR', file: 'haryana' },
          { id: 'IN-HP', file: 'himachalpradesh' },
          { id: 'IN-UT', file: 'uttarakhand' },
          { id: 'IN-AS', file: 'assam' },
          { id: 'IN-TR', file: 'tripura' },
          { id: 'IN-MN', file: 'manipur' },
          { id: 'IN-ML', file: 'meghalaya' },
          { id: 'IN-MZ', file: 'mizoram' },
          { id: 'IN-NL', file: 'nagaland' },
          { id: 'IN-AR', file: 'arunachalpradesh' },
          { id: 'IN-SK', file: 'sikkim' },
          { id: 'IN-JK', file: 'jammu_kashmir' }
        ];

        const loadPromises = statesToLoad.map(async (state) => {
          try {
            const stateRes = await fetchWithRetry(`/data/${state.file}_districts.json`, { signal });
            const data = await stateRes.json();
            // Inject stateId into each district
            let mappedData = data.map(d => ({ ...d, stateId: state.id }));
            if (state.id === 'IN-TN') {
              mappedData = mappedData.map(d => ({
                ...d,
                complaintsMajor: d.complaintsMajor * 10,
                complaintsMinor: d.complaintsMinor * 10
              }));
            }
            return { id: state.id, data: mappedData };
          } catch (e) {
            console.error(`Failed to pre-load ${state.id} districts:`, e);
            return null;
          }
        });

        const loadedResults = await Promise.all(loadPromises);
        setLoadedStates(prev => {
          const next = new Map(prev);
          loadedResults.forEach(result => {
            if (result) {
              next.set(result.id, result.data);
            }
          });
          return next;
        });
      } catch (err) {
        if (!signal.aborted) {
          console.error('Failed to initialize application data:', err);
        }
      }
    }

    initAppData();
    return () => abortController.abort();
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentNav = history[historyIndex] || { page: 'overview', state: 'All', dist: 'All', hier: null };
  const activePage = currentNav.page;
  const selectedState = currentNav.state || 'All';
  const selectedDistrict = currentNav.dist || 'All';
  const hierarchyDistrict = currentNav.hier || null;

  // React effect to lazily fetch data whenever selectedState changes (fallback)
  useEffect(() => {
    if (selectedState === 'All' || loadedStates.has(selectedState)) {
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    async function loadData() {
      setLoadingStateId(selectedState);
      try {
        const data = await fetchStateDistricts(selectedState, abortController.signal);
        if (isMounted) {
          let dataWithState = data.map(d => ({ ...d, stateId: selectedState }));
          if (selectedState === 'IN-TN') {
            dataWithState = dataWithState.map(d => ({
              ...d,
              complaintsMajor: d.complaintsMajor * 10,
              complaintsMinor: d.complaintsMinor * 10
            }));
          }
          setLoadedStates(prev => {
            const next = new Map(prev);
            next.set(selectedState, dataWithState);
            return next;
          });
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          console.error(`Failed to lazy load districts for state ${selectedState}:`, err);
        }
      } finally {
        if (isMounted) {
          setLoadingStateId(null);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [selectedState, loadedStates]);

  // Scroll to top of main content when active page, selected state/district, or history index changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activePage, selectedState, selectedDistrict, historyIndex]);

  const navigateTo = (page, state = selectedState, dist = selectedDistrict, hier = hierarchyDistrict) => {
    // Prevent duplicate adjacent states
    if (page === activePage && state === selectedState && dist === selectedDistrict && hier === hierarchyDistrict) return;
    
    const newState = { page, state, dist, hier };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const loadStateAndNavigate = async (stateId, targetDistrict = 'All', page = 'overview') => {
    if (stateId === 'All' || loadedStates.has(stateId)) {
      navigateTo(page, stateId, targetDistrict, null);
      return;
    }

    setLoadingStateId(stateId);
    try {
      const data = await fetchStateDistricts(stateId);
      let dataWithState = data.map(d => ({ ...d, stateId }));
      if (stateId === 'IN-TN') {
        dataWithState = dataWithState.map(d => ({
          ...d,
          complaintsMajor: d.complaintsMajor * 10,
          complaintsMinor: d.complaintsMinor * 10
        }));
      }
      setLoadedStates(prev => {
        const next = new Map(prev);
        next.set(stateId, dataWithState);
        return next;
      });
      navigateTo(page, stateId, targetDistrict, null);
    } catch (err) {
      console.error(`Failed to load districts for state ${stateId}:`, err);
    } finally {
      setLoadingStateId(null);
    }
  };

  const handleBack = () => { 
    if (activePage === 'hierarchy' && window.__hierarchyBack && window.__hierarchyBack()) {
      return;
    }
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1); 
  };
  const handleNext = () => { if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1); };

  const handleLogout = () => {
    localStorage.removeItem('grievance_user');
    sessionStorage.removeItem('app_history');
    sessionStorage.removeItem('app_historyIndex');
    setUser(null);
    setHistory([{ page: 'overview', state: 'All', dist: 'All', hier: null }]);
    setHistoryIndex(0);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('grievance_user', JSON.stringify(userData));
    setUser(userData);
  };

  // State details mapping
  const stateNames = {
    'IN-KA': 'Karnataka',
    'IN-TN': 'Tamil Nadu',
    'IN-KL': 'Kerala',
    'IN-TG': 'Telangana',
    'IN-AP': 'Andhra Pradesh',
    'IN-MH': 'Maharashtra',
    'IN-CG': 'Chhattisgarh',
    'IN-OD': 'Odisha',
    'IN-GJ': 'Gujarat',
    'IN-MP': 'Madhya Pradesh',
    'IN-WB': 'West Bengal',
    'IN-PY': 'Puducherry',
    'IN-JH': 'Jharkhand',
    'IN-RJ': 'Rajasthan',
    'IN-GA': 'Goa',
    'IN-AN': 'Andaman & Nicobar Islands',
    'IN-LD': 'Lakshadweep',
    'IN-DN': 'Dadra & Nagar Haveli and Daman & Diu',
    'IN-BR': 'Bihar',
    'IN-UP': 'Uttar Pradesh',
    'IN-PB': 'Punjab',
    'IN-HR': 'Haryana',
    'IN-HP': 'Himachal Pradesh',
    'IN-UT': 'Uttarakhand',
    'IN-AS': 'Assam',
    'IN-TR': 'Tripura',
    'IN-MN': 'Manipur',
    'IN-ML': 'Meghalaya',
    'IN-MZ': 'Mizoram',
    'IN-NL': 'Nagaland',
    'IN-AR': 'Arunachal Pradesh',
    'IN-SK': 'Sikkim',
    'IN-JK': 'Jammu & Kashmir',
    'All': 'India Campaign'
  };
  const stateName = stateNames[selectedState] || 'India Campaign';

  // Districts list for the selected region
  const districtsList = selectedState === 'All'
    ? Array.from(loadedStates.values()).flat()
    : (loadedStates.get(selectedState) || []);

  // Compute aggregated stats using Option A live store / summary fallback
  function getStats() {
    if (selectedState === 'All') {
      if (selectedDistrict !== 'All') {
        for (const districts of loadedStates.values()) {
          const d = districts.find(x => x.id === selectedDistrict);
          if (d) {
            return {
              major:      d.complaintsMajor,
              minor:      d.complaintsMinor,
              candidates: d.candidates,
              visited:    d.visitedCount,
              notVisited: d.notVisitedCount,
            };
          }
        }
        return { major: 0, minor: 0, candidates: 0, visited: 0, notVisited: 0 };
      }

      const stateKeys = [
        'IN-KA', 'IN-TN', 'IN-KL', 'IN-TG', 'IN-AP',
        'IN-MH', 'IN-CG', 'IN-OD', 'IN-GJ', 'IN-MP',
        'IN-WB', 'IN-PY', 'IN-JH', 'IN-RJ', 'IN-GA',
        'IN-AN', 'IN-LD', 'IN-DN', 'IN-BR', 'IN-UP',
        'IN-PB', 'IN-HR', 'IN-HP', 'IN-UT', 'IN-AS',
        'IN-TR', 'IN-MN', 'IN-ML', 'IN-MZ', 'IN-NL',
        'IN-AR', 'IN-SK', 'IN-JK'
      ];
      return stateKeys.reduce(
        (acc, sId) => {
          if (loadedStates.has(sId)) {
            const districts = loadedStates.get(sId);
            const sum = districts.reduce((sAcc, d) => ({
              major:      sAcc.major      + d.complaintsMajor,
              minor:      sAcc.minor      + d.complaintsMinor,
              candidates: sAcc.candidates + d.candidates,
              visited:    sAcc.visited    + d.visitedCount,
              notVisited: sAcc.notVisited + d.notVisitedCount,
            }), { major: 0, minor: 0, candidates: 0, visited: 0, notVisited: 0 });
            return {
              major:      acc.major      + sum.major,
              minor:      acc.minor      + sum.minor,
              candidates: acc.candidates + sum.candidates,
              visited:    acc.visited    + sum.visited,
              notVisited: acc.notVisited + sum.notVisited,
            };
          } else if (summary && summary[sId]) {
            const sInfo = summary[sId];
            return {
              major:      acc.major      + sInfo.complaintsMajor,
              minor:      acc.minor      + sInfo.complaintsMinor,
              candidates: acc.candidates + sInfo.candidates,
              visited:    acc.visited    + sInfo.visitedCount,
              notVisited: acc.notVisited + sInfo.notVisitedCount,
            };
          }
          return acc;
        },
        { major: 0, minor: 0, candidates: 0, visited: 0, notVisited: 0 }
      );
    }

    const districts = loadedStates.get(selectedState) || [];
    if (selectedDistrict === 'All') {
      return districts.reduce(
        (acc, d) => ({
          major:      acc.major      + d.complaintsMajor,
          minor:      acc.minor      + d.complaintsMinor,
          candidates: acc.candidates + d.candidates,
          visited:    acc.visited    + d.visitedCount,
          notVisited: acc.notVisited + d.notVisitedCount,
        }),
        { major: 0, minor: 0, candidates: 0, visited: 0, notVisited: 0 }
      );
    }

    const d = districts.find(x => x.id === selectedDistrict);
    if (!d) return { major: 0, minor: 0, candidates: 0, visited: 0, notVisited: 0 };
    return {
      major:      d.complaintsMajor,
      minor:      d.complaintsMinor,
      candidates: d.candidates,
      visited:    d.visitedCount,
      notVisited: d.notVisitedCount,
    };
  }

  const stats = getStats();

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const stateTabs = [
    { id: 'All', name: 'All Regions' }
  ];

  return (
    <div className="app-container">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .small-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }
        .loading-spinner {
          border: 4px solid rgba(37, 99, 235, 0.1);
          border-top-color: #2563eb;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        .tab-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          color: #1e293b;
        }
        .tab-btn.active:hover {
          color: white !important;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3) !important;
        }
      `}</style>

      <Sidebar
        activePage={activePage}
        onNavClick={page => navigateTo(page)}
        user={user}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        selectedState={selectedState}
        loadedStates={loadedStates}
        selectedDistrict={selectedDistrict}
        onDistrictClick={(distId) => {
          const districts = loadedStates.get(selectedState) || [];
          const distObj = districts.find(d => d.id === distId);
          if (distObj) {
            navigateTo('hierarchy', selectedState, distId, distObj);
          }
        }}
      />

      <main className="main-content">
        <TopHeader 
          user={user} 
          onLogout={handleLogout} 
          activePage={activePage} 
          onSearchSelect={(distObj) => navigateTo('hierarchy', distObj.stateId || selectedState, distObj.id, distObj)}
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={historyIndex > 0}
          canGoNext={historyIndex < history.length - 1}
          onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          stateName={stateName}
          districts={districtsList}
          allDistricts={Array.from(loadedStates.values()).flat()}
        />

        {/* ── Districts Page ── */}
        {activePage === 'districts' && (
          <DistrictsPage
            districts={districtsList}
            onDistrictClick={distObj => navigateTo('hierarchy', selectedState, distObj.id, distObj)}
          />
        )}

        {/* ── Hierarchy View ── */}
        {activePage === 'hierarchy' && hierarchyDistrict && (
          <HierarchyManager 
            selectedDistrictObj={hierarchyDistrict}
            stateName={stateName}
            stateId={selectedState}
            onNavigateToIndia={() => navigateTo('overview', 'All', 'All', null)}
            onNavigateToState={() => navigateTo('overview', selectedState, 'All', null)}
          />
        )}


        {/* ── Overview Page ── */}
        {activePage === 'overview' && (
          <>
            {/* Dynamic State Filter Tabs */}
            <div className="state-filter-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {stateTabs.map(tab => {
                const isActive = selectedState === tab.id;
                const isCurrentlyLoading = loadingStateId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => loadStateAndNavigate(tab.id)}
                    disabled={loadingStateId !== null}
                    className={`tab-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: isActive ? 'none' : '1px solid #e2e8f0',
                      background: isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'white',
                      color: isActive ? 'white' : '#64748b',
                      cursor: loadingStateId !== null ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                      opacity: (loadingStateId !== null && !isActive) ? 0.7 : 1
                    }}
                  >
                    {isCurrentlyLoading && <span className="small-spinner" />}
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* ── Loading state ── */}
            {loadingStateId !== null && (
              <>
                <KPICards stats={stats} />
                <div className="card map-card-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '520px', gap: '16px' }}>
                  <div className="loading-spinner" />
                  <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Loading state data…</p>
                </div>
              </>
            )}

            {/* ── India Overview (All states) ── */}
            {loadingStateId === null && selectedState === 'All' && (
              <>
                <KPICards stats={stats} />
                <section className="map-problems-grid">
                  <IndiaMap
                    selectedState={selectedState}
                    onStateClick={(sId) => loadStateAndNavigate(sId, 'All')}
                    loadedStates={loadedStates}
                  />
                  <ProblemsTable
                    title={`Major Problems - ${stateName}`}
                    color="#dc2626"
                    problems={majorProblemsDefault}
                    baseDenominator={3426}
                    totalCount={stats.major}
                  />
                  <ProblemsTable
                    title={`Minor Problems - ${stateName}`}
                    color="#eab308"
                    problems={minorProblemsDefault}
                    baseDenominator={1248}
                    totalCount={stats.minor}
                  />
                </section>
              </>
            )}

            {/* ── Single State Full View ── */}
            {loadingStateId === null && selectedState !== 'All' && (
              <StateOverviewPanel
                key={selectedState}
                stateId={selectedState}
                stateName={stateName}
                selectedDistrict={selectedDistrict}
                onDistrictClick={(id) => {
                  const districts = loadedStates.get(selectedState) || [];
                  const distObj = districts.find(d => d.id === id);
                  if (distObj) {
                    navigateTo('hierarchy', selectedState, id, distObj);
                  }
                }}
                loadedStates={loadedStates}
                stats={stats}
                onBackToIndia={() => loadStateAndNavigate('All')}
              />
            )}
          </>
        )}

        {/* ── Settings Page ── */}
        {activePage === 'settings' && <SettingsPage user={user} onUpdateUser={setUser} />}
      </main>
    </div>
  );
}