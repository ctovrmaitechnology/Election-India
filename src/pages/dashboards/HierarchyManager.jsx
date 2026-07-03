import React, { useState, useEffect } from 'react';
import { getConstituenciesForDistrict, generateWards, generateBooths, generateAreas, generateCitizens, generateProblems } from '../../utils/mockDataGenerators';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DrilldownList from '../../components/ui/DrilldownList';
import ConstituencyDashboard from '../../pages/dashboards/ConstituencyDashboard';
import WardDashboard from '../../pages/dashboards/WardDashboard';
import AreaDashboard from '../../pages/dashboards/AreaDashboard';
import CitizenDashboard from '../../pages/dashboards/CitizenDashboard';
import ProblemDetails from '../../pages/dashboards/ProblemDetails';

export default function HierarchyManager({ selectedDistrictObj, stateName, stateId, onNavigateToIndia, onNavigateToState }) {
  const [drillPath, setDrillPath] = useState([
    { level: 'district', label: selectedDistrictObj.name, data: selectedDistrictObj }
  ]);
  const [constituencyWards, setConstituencyWards] = useState({});
  // Cache generated data by parent-id to prevent reshuffling on re-render
  const [wardBooths,   setWardBooths]   = useState({});  // wardId  booths[]
  const [boothAreas,   setBoothAreas]   = useState({});  // boothId  areas[]
  const [areaCitizens, setAreaCitizens] = useState({});  // areaId  citizens[]
  const [citizenProblems, setCitizenProblems] = useState({}); // citizenId  problems[]
  const [notification, setNotification] = useState(null);

  // Reset drill path when selected district changes (e.g. navigating from map to different district)
  useEffect(() => {
    setDrillPath([{ level: 'district', label: selectedDistrictObj.name, data: selectedDistrictObj }]);
    setConstituencyWards({});
    setWardBooths({});
    setBoothAreas({});
    setAreaCitizens({});
    setCitizenProblems({});
  }, [selectedDistrictObj.id]);

  useEffect(() => {
    const handleUpload = () => {
      setConstituencyWards({});
      setWardBooths({});
      setBoothAreas({});
      setAreaCitizens({});
      setCitizenProblems({});
      setDrillPath([{ level: 'district', label: selectedDistrictObj.name, data: selectedDistrictObj }]);
    };
    window.addEventListener('upload_data_ready', handleUpload);
    return () => window.removeEventListener('upload_data_ready', handleUpload);
  }, [selectedDistrictObj]);
  useEffect(() => {
    window.__hierarchyBack = () => {
      if (drillPath.length > 1) {
        setDrillPath(prev => prev.slice(0, -1));
        return true;
      }
      return false;
    };
    return () => { window.__hierarchyBack = null; };
  }, [drillPath]);

  // Scroll to top of main content when drill down level changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [drillPath]);

  const triggerNotification = (message) => {
    setNotification({ message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleToggleVisited = (wardId) => {
    const constituencyStep = drillPath.find(p => p.level === 'constituency');
    if (!constituencyStep) return;
    const cName = constituencyStep.data.name;

    setConstituencyWards(prev => {
      const list = prev[cName] || [];
      const updatedList = list.map(w => {
        if (w.id === wardId) {
          const newVisited = !w.visited;
          if (newVisited) {
            triggerNotification(`Initiating automated feedback calls to citizens in ${w.name}!`);
          }
          return { ...w, visited: newVisited };
        }
        return w;
      });
      return { ...prev, [cName]: updatedList };
    });

    setDrillPath(prev => prev.map(step => {
      if (step.level === 'ward' && step.data.id === wardId) {
        return {
          ...step,
          data: { ...step.data, visited: !step.data.visited }
        };
      }
      return step;
    }));
  };

  const currentStep = drillPath[drillPath.length - 1];

  const handleNavigate = (index) => {
    setDrillPath(prev => prev.slice(0, index + 1));
  };

  const pushLevel = (level, label, data) => {
    if (level === 'constituency') {
      const cName = data.name;
      if (!constituencyWards[cName]) {
        setConstituencyWards(prev => ({
          ...prev,
          [cName]: generateWards(data)
        }));
      }
    }
    if (level === 'ward') {
      const wId = data.id;
      if (!wardBooths[wId]) {
        setWardBooths(prev => ({ ...prev, [wId]: generateBooths(data) }));
      }
    }
    if (level === 'booth') {
      const bId = data.id;
      if (!boothAreas[bId]) {
        setBoothAreas(prev => ({ ...prev, [bId]: generateAreas(data) }));
      }
    }
    if (level === 'area') {
      const aId = data.id;
      if (!areaCitizens[aId]) {
        setAreaCitizens(prev => ({ ...prev, [aId]: generateCitizens(data) }));
      }
    }
    if (level === 'citizen') {
      const cId = data.id;
      if (!citizenProblems[cId]) {
        setCitizenProblems(prev => ({ ...prev, [cId]: generateProblems(data) }));
      }
    }
    setDrillPath(prev => [...prev, { level, label, data }]);
  };

  const getPathData = () => {
    return {
      district: drillPath.find(p => p.level === 'district')?.label || '',
      constituency: drillPath.find(p => p.level === 'constituency')?.label || '',
      ward: drillPath.find(p => p.level === 'ward')?.label || '',
      booth: drillPath.find(p => p.level === 'booth')?.label || '',
      area: drillPath.find(p => p.level === 'area')?.label || '',
      citizen: drillPath.find(p => p.level === 'citizen')?.data?.name || '',
      phone: drillPath.find(p => p.level === 'citizen')?.data?.phone || ''
    };
  };

  const renderCurrentLevel = () => {
    switch (currentStep.level) {
      case 'district': {
        const constituencies = getConstituenciesForDistrict(currentStep.data.id, currentStep.data);
        return (
          <DrilldownList 
            title={`${currentStep.data.name}  Constituencies (${constituencies.length})`}
            items={constituencies}
            columns={[
              { header: 'Constituency',  field: 'name',    align: 'center', width: '34%' },
              { header: 'MLA',           field: 'mla',     align: 'center', width: '26%' },
              { header: 'Wards',        field: 'wards',   align: 'center',  width: '8%' },
              { header: 'Major',        field: 'major',   align: 'center',  width: '9%' },
              { header: 'Minor',        field: 'minor',   align: 'center',  width: '9%' },
              { header: 'Total',        align: 'center',   width: '8%',
                render: (c) => <strong style={{ color: '#dc2626' }}>{c.major + c.minor}</strong>
              },
              { header: 'Visited',      align: 'center',  width: '6%',
                render: (c) => c.visited
                  ? <span style={{ color: '#10b981', display: 'flex', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                  : <span style={{ color: '#dc2626', display: 'flex', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>
              }
            ]}
            onRowClick={(c) => pushLevel('constituency', c.name, c)}
          />
        );
      }
      case 'constituency': {
        const cName = currentStep.data.name;
        let wards = constituencyWards[cName];
        if (!wards) {
          wards = generateWards(currentStep.data);
          setTimeout(() => {
            setConstituencyWards(prev => {
              if (prev[cName]) return prev;
              return { ...prev, [cName]: wards };
            });
          }, 0);
        }
        return (
          <ConstituencyDashboard 
            constituency={currentStep.data} 
            wards={wards} 
            onWardClick={(w) => pushLevel('ward', w.name, w)} 
          />
        );
      }
      case 'ward': {
        const wId = currentStep.data.id;
        let booths = wardBooths[wId];
        if (!booths) {
          booths = generateBooths(currentStep.data);
          setTimeout(() => setWardBooths(prev => prev[wId] ? prev : { ...prev, [wId]: booths }), 0);
        }
        return (
          <WardDashboard 
            ward={currentStep.data} 
            booths={booths} 
            onBoothClick={(b) => pushLevel('booth', b.name, b)} 
            onToggleVisited={handleToggleVisited}
          />
        );
      }
      case 'booth': {
        const bId = currentStep.data.id;
        let areas = boothAreas[bId];
        if (!areas) {
          areas = generateAreas(currentStep.data);
          setTimeout(() => setBoothAreas(prev => prev[bId] ? prev : { ...prev, [bId]: areas }), 0);
        }
        return (
          <DrilldownList 
            title={`Areas / Localities under ${currentStep.data.name}`}
            items={areas}
            columns={[
              { header: 'Area / Locality', field: 'name',            align: 'center', width: '32%' },
              { header: 'Population',      field: 'population',      align: 'center', width: '16%' },
              { header: 'Volunteers',      field: 'activeVolunteers', align: 'center', width: '14%' },
              { header: 'Top Issue',       field: 'topDiscussed',    width: '24%' },
              { header: 'Complaints',      field: 'issues',          align: 'center', width: '14%' }
            ]}
            onRowClick={(a) => pushLevel('area', a.name, a)}
          />
        );
      }
      case 'area': {
        const aId = currentStep.data.id;
        let citizens = areaCitizens[aId];
        if (!citizens) {
          citizens = generateCitizens(currentStep.data);
          setTimeout(() => setAreaCitizens(prev => prev[aId] ? prev : { ...prev, [aId]: citizens }), 0);
        }
        return (
          <AreaDashboard 
            area={currentStep.data} 
            citizens={citizens} 
            onCitizenClick={(c) => pushLevel('citizen', c.name, c)} 
          />
        );
      }
      case 'citizen': {
        const cId = currentStep.data.id;
        let problems = citizenProblems[cId];
        if (!problems) {
          problems = generateProblems(currentStep.data);
          setTimeout(() => setCitizenProblems(prev => prev[cId] ? prev : { ...prev, [cId]: problems }), 0);
        }
        return (
          <CitizenDashboard 
            citizen={currentStep.data} 
            problems={problems} 
            onProblemClick={(p) => pushLevel('problem', p.id, p)} 
          />
        );
      }
      case 'problem':
        return <ProblemDetails problem={currentStep.data} pathData={getPathData()} />;
      default:
        return null;
    }
  };

  // Build prefix crumbs: India → State
  const prefixCrumbs = [
    {
      level: 'india',
      label: 'India',
      onClick: () => onNavigateToIndia && onNavigateToIndia()
    },
    ...(stateName ? [{
      level: 'state',
      label: stateName,
      onClick: () => onNavigateToState && onNavigateToState()
    }] : [])
  ];

  return (
    <div className="hierarchy-manager">
      {notification && (
        <div className="top-notification-toast">
          <div className="toast-icon"></div>
          <div className="toast-content">
            <div className="toast-title">Automated Call Triggered</div>
            <div className="toast-message">{notification.message}</div>
          </div>
        </div>
      )}
      <Breadcrumb path={drillPath} onNavigate={handleNavigate} prefixCrumbs={prefixCrumbs} />
      <div
        key={`${currentStep.level}-${currentStep.label}`}
        className="hierarchy-level-view"
      >
        {renderCurrentLevel()}
      </div>
    </div>
  );
}
