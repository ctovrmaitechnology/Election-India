import React from 'react';

export default function ProblemDetails({ problem, pathData }) {
  return (
    <div className="problem-detail-view card mt-4 premium-shadow" style={{ padding: '32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>
            Ticket: {problem.id}
          </h2>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Logged on: {problem.date}</span>
        </div>

      </div>

      <div className="problem-grid">
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: '700' }}>Location Details</h4>
          <p><strong>District:</strong> {pathData.district}</p>
          <p><strong>Constituency:</strong> {pathData.constituency}</p>
          <p><strong>Ward:</strong> {pathData.ward}</p>
          <p><strong>Booth:</strong> {pathData.booth}</p>
          <p><strong>Area:</strong> {pathData.area}</p>
        </div>
        <div>
          <p><strong>Citizen:</strong> {pathData.citizen}</p>
          <p><strong>Mobile:</strong> {pathData.phone}</p>
          <p><strong>Created Date:</strong> {problem.date}</p>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ marginBottom: '12px', color: '#334155' }}>Issue Details</h4>
        <p><strong>Problem Type:</strong> <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{problem.type}</span></p>
        <p><strong>Description:</strong> {problem.description}</p>

      </div>

      <div className="problem-grid" style={{ marginTop: '24px' }}>
        <p><strong>Raised By:</strong> {problem.raisedBy}</p>
        <p><strong>Assigned To:</strong> {problem.assignedTo}</p>
      </div>
    </div>
  );
}
