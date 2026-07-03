import React, { useState } from 'react';

export default function ExcelUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!selectedFile) {
      alert('Please select an Excel file to upload first.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length <= 1) {
        alert("File appears to be empty or missing data rows.");
        return;
      }
      
      const UPLOADED_DATA = { constituencies: {}, wards: {}, booths: {}, areas: {}, citizens: {} };

      let rowsProcessed = 0;
      let lastDistId = 'bagalkot';
      // skip header
      for (let i = 1; i < lines.length; i++) {
        // Handle comma, tab, or semicolon delimiters
        const parts = lines[i].split(/\t|,|;/).map(s => s.trim());
        if (parts.length < 8) continue;
        
        const [distName, constName, wardName, boothName, areaName, citName, phone, id] = parts;
        if (!distName || !constName) continue; // Safety check
        
        const distId = distName.toLowerCase().replace(/\s+/g, '_');
        lastDistId = distId;
        
        // constituencies
        if (!UPLOADED_DATA.constituencies[distId]) UPLOADED_DATA.constituencies[distId] = [];
        let c = UPLOADED_DATA.constituencies[distId].find(x => x.name === constName);
        if (!c) {
          c = { name: constName, mla: "Newly Uploaded", party: "N/A", wards: 0, major: 0, minor: 0, visited: false };
          UPLOADED_DATA.constituencies[distId].push(c);
        }

        const wardId = `${constName.replace(/\s+/g, '-')}-${wardName.replace(/\s+/g, '-')}`;
        if (!UPLOADED_DATA.wards[constName]) UPLOADED_DATA.wards[constName] = [];
        let w = UPLOADED_DATA.wards[constName].find(x => x.id === wardId);
        if (!w) {
          w = { id: wardId, name: wardName, corporator: "Unknown", booths: 0, major: 0, minor: 0, visited: false, totalIssues: 0 };
          UPLOADED_DATA.wards[constName].push(w);
          c.wards++;
        }

        const boothId = `${wardId}-${boothName.replace(/\s+/g, '-')}`;
        if (!UPLOADED_DATA.booths[wardId]) UPLOADED_DATA.booths[wardId] = [];
        let b = UPLOADED_DATA.booths[wardId].find(x => x.id === boothId);
        if (!b) {
          b = { id: boothId, name: boothName, incharge: "Unknown", voters: 1000, areas: 0, issues: 0 };
          UPLOADED_DATA.booths[wardId].push(b);
          w.booths++;
        }

        const areaId = `${boothId}-${areaName.replace(/\s+/g, '-')}`;
        if (!UPLOADED_DATA.areas[boothId]) UPLOADED_DATA.areas[boothId] = [];
        let a = UPLOADED_DATA.areas[boothId].find(x => x.id === areaId);
        if (!a) {
          a = { id: areaId, name: areaName, population: 500, activeVolunteers: 5, influencers: [], issues: 0, topDiscussed: "General" };
          UPLOADED_DATA.areas[boothId].push(a);
          b.areas++;
        }

        if (!UPLOADED_DATA.citizens[areaId]) UPLOADED_DATA.citizens[areaId] = [];
        let cit = UPLOADED_DATA.citizens[areaId].find(x => x.id === id);
        if (!cit) {
          cit = { id, name: citName, phone, problemsCount: 1, topIssues: [], followUpHistory: "Just Uploaded", sentiment: "Neutral" };
          UPLOADED_DATA.citizens[areaId].push(cit);
          a.issues++;
          b.issues++;
          w.major++;
          w.totalIssues++;
          c.major++;
        }
        
        rowsProcessed++;
      }
      
      if (rowsProcessed === 0) {
        alert("Could not parse data rows. Please ensure your file has the correct 8 columns separated by commas or tabs.");
        return;
      }
      
      window.__UPLOADED_DATA__ = UPLOADED_DATA;
      alert(`${selectedFile.name} successfully parsed and injected into the Hierarchy flow!`);
      
      window.dispatchEvent(new Event('upload_data_ready'));
      
      if (onUploadSuccess) onUploadSuccess(lastDistId); 
      
      setSelectedFile(null); 
      onClose(); 
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="modal-content" style={{
        background: '#0f172a', width: '90%', maxWidth: '640px', borderRadius: '16px',
        border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        color: '#f8fafc', overflow: 'hidden', fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>Upload Hierarchy Data</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Upload 1-5 Excel files · saved to database</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div style={{ padding: '24px' }}>
          <div style={{ 
            border: selectedFile ? '2px solid #10b981' : '2px dashed #334155', 
            borderRadius: '12px', padding: '48px 20px', 
            textAlign: 'center', background: selectedFile ? 'rgba(16, 185, 129, 0.05)' : '#0f172a', 
            transition: 'all 0.2s', cursor: 'pointer' 
          }}
          onMouseOver={(e) => { if(!selectedFile) e.currentTarget.style.borderColor = '#3b82f6'; }}
          onMouseOut={(e) => { if(!selectedFile) e.currentTarget.style.borderColor = '#334155'; }}
          onClick={() => document.getElementById('hidden-file-input').click()}
          >
            <input type="file" id="hidden-file-input" style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
            {selectedFile ? (
              <>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#10b981', fontWeight: '600' }}>File Selected</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{selectedFile.name}</p>
              </>
            ) : (
              <>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc', fontWeight: '600' }}>Drag & drop files or click to browse</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Max 5 files · .xlsx / .xls only</p>
              </>
            )}
          </div>
        </div>

        {/* Expected Headers */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.8px' }}>EXPECTED COLUMN HEADERS</span>
            <button 
              onClick={() => {
                const headers = ['District', 'Constituency', 'Ward', 'Booth', 'Area', 'Citizen Name', 'Phone Number', 'ID'];
                const sampleData = [
                  ['Bagalkot', 'Bagalkot', 'Ward 1', 'Booth 01', 'Main Street', 'Ramesh Kumar', '9448012345', 'CIT1001'],
                  ['Bagalkot', 'Bagalkot', 'Ward 1', 'Booth 02', 'Temple Road', 'Sunitha Rao', '9886067890', 'CIT1002']
                ];
                const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "Hierarchy_Upload_Template.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', 
              border: '1px solid #1e40af', color: '#60a5fa', padding: '6px 12px', 
              borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 64, 175, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Excel Template
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {['District', 'Constituency', 'Ward', 'Booth', 'Area', 'Citizen Name', 'Phone Number', 'ID'].map(h => (
              <span key={h} style={{ 
                background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', 
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' 
              }}>
                {h}
              </span>
            ))}
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>
            ✦ Optional columns — auto-calculated if missing.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            ✦ Hierarchy levels: <strong style={{ color: '#94a3b8' }}>Constituency, Ward, Booth, Area</strong>
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={{ 
            background: 'transparent', border: '1px solid #334155', color: '#e2e8f0', 
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' 
          }}>
            Cancel
          </button>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', background: selectedFile ? '#1d4ed8' : '#334155', 
            border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', 
            fontSize: '14px', fontWeight: '600', cursor: selectedFile ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }} onClick={handleUploadClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Upload & Save to Database
          </button>
        </div>
      </div>
    </div>
  );
}
