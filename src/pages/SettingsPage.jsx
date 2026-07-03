import React, { useState } from 'react';

export default function SettingsPage({ user, onUpdateUser }) {
  // Profile State
  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [role, setRole] = useState(user ? user.role : 'Super Admin');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  const showToast = (text, type = 'success') => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    
    if (newPassword || currentPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill all password fields to update password.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }
    }
    
    const updatedUser = { ...user, name, email, role };
    localStorage.setItem('grievance_user', JSON.stringify(updatedUser));
    onUpdateUser(updatedUser);
    
    showToast('Admin credentials updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="st-page" style={{ paddingBottom: '40px' }}>
      
      {message && (
        <div style={{
          padding: '16px 20px',
          marginBottom: '24px',
          borderRadius: '12px',
          background: msgType === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${msgType === 'success' ? '#10b981' : '#ef4444'}`,
          color: msgType === 'success' ? '#065f46' : '#991b1b',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease'
        }}>
          {msgType === 'success' ? '✅' : '❌'} {message}
        </div>
      )}

      <form onSubmit={handleSaveAll}>
        <div className="settings-grid">
          
          {/* Box 1: Profile Information */}
          <div className="st-card" style={{ width: '100%', margin: 0, padding: '32px' }}>
            <div className="st-card-header" style={{ marginBottom: '24px' }}>
              <div className="st-card-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="st-card-title">Profile Information</h3>
                <p className="st-card-sub">Update your personal information</p>
              </div>
            </div>

            <div className="st-form-group" style={{ marginBottom: '20px' }}>
              <label>Full Name</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="st-form-group" style={{ marginBottom: '20px' }}>
              <label>Email Address</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </span>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="st-form-group">
              <label>Assigned Role</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </span>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Campaign Manager">Campaign Manager</option>
                  <option value="Field Coordinator">Field Coordinator</option>
                  <option value="Ward Admin">Ward Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Box 2: Security & Password */}
          <div className="st-card" style={{ width: '100%', margin: 0, padding: '32px' }}>
            <div className="st-card-header" style={{ marginBottom: '24px' }}>
              <div className="st-card-icon-wrap" style={{ background: '#fef2f2', color: '#ef4444' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h3 className="st-card-title">Security & Password</h3>
                <p className="st-card-sub">Update your security credentials</p>
              </div>
            </div>

            <div className="st-form-group" style={{ marginBottom: '20px' }}>
              <label>Current Password</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="st-form-group" style={{ marginBottom: '20px' }}>
              <label>New Password</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                </span>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="st-form-group">
              <label>Confirm New Password</label>
              <div className="st-input-wrap">
                <span className="st-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                </span>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons below the two boxes */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
          <button 
            type="button" 
            className="st-btn-cancel"
            style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '12px' }}
            onClick={() => {
              setName(user ? user.name : '');
              setEmail(user ? user.email : '');
              setRole(user ? user.role : 'Super Admin');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="st-btn-save" 
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: '#fff', padding: '12px 32px', fontSize: '15px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
          >
            Save All Credentials
          </button>
        </div>
      </form>

    </div>
  );
}