import React, { useState } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Bypass validation: directly login
      onLoginSuccess({ 
        name: email ? email.split('@')[0] : 'Admin', 
        email: email || 'admin@karnataka.gov.in', 
        role: 'Super Admin' 
      });
      return;
      if (email && password && name) {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.some(u => u.email === email)) {
          setError('An account with this email already exists.');
          return;
        }
        const newUser = { name, email, password };
        localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
        onLoginSuccess({ name, email, role: 'Admin' });
      }
    }
  };


  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #f1f5f9;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1.4;
          position: relative;
          overflow: hidden;
          background-color: #f1f5f9;
        }

        /* Background image fills the entire left panel */
        .left-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          z-index: 1;
        }

        /* Seamless overlay gradient to blend into right panel */
        .left-overlay {
          display: none;
        }
       
        .left-content {
          position: absolute;
          left: 60px;
          top: 60px;
          max-width: 480px;
          z-index: 3;
          text-align: left;
        }


        .gov-badge {
          display: inline-block;
          background: rgba(255,255,255,0.85);
          color: #1e40af;
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.3px;
          backdrop-filter: blur(4px);
        }

        .left-content h1 {
          font-size: 44px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #0f172a;
        }

        .left-content h1 .blue {
          color: #2563eb;
        }

        .heading-divider {
          width: 110px;
          height: 4px;
          background: #2563eb;
          border-radius: 99px;
          margin: 20px 0 22px 0;
        }

        .left-content p {
          font-size: 16px;
          line-height: 1.6;
          color: #1e293b;
          font-weight: 600;
          margin-top: 4px;
        }


        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 480px;
          min-width: 480px;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 44px 40px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .input-wrap {
          position: relative;
          margin-bottom: 14px;
          width: 100%;
        }

        .input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 17px;
          height: 17px;
          color: #94a3b8;
        }

        .input-wrap input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          font-size: 14px;
          border-radius: 10px;
          outline: none;
          color: #0f172a;
          background: #f0f6ff;
          border: 1.5px solid #e2e8f0;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-wrap input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .submit-btn {
          width: 100%;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          transition: background 0.2s;
        }

        .submit-btn:hover { background: #1d4ed8; }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: background 0.15s;
        }

        .social-btn:hover { background: #f8fafc; }

        @media (max-width: 1024px) {
          .left-panel { display: none; }
          .auth-container {
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
          }
          .right-panel { 
            width: 100%; 
            height: 100%;
            min-width: unset; 
            background: url("/india_parliament_clear.png") center/cover no-repeat;
            position: relative;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .right-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(30, 64, 175, 0.5), rgba(15, 23, 42, 0.8));
          }
          .login-card { 
            z-index: 1;
            width: 100%;
            max-width: 400px;
            padding: 32px 24px; 
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            max-height: 95vh;
            overflow-y: auto;
          }
          .social-btn-container {
            flex-direction: column !important;
          }
        }
      `}</style>

      <div className="auth-container">

        {/* ── LEFT ── */}
        <div className="left-panel">
          <img
            className="left-bg"
            src="/india_parliament_clear.png"
            alt="India Regional Campaign background"
            fetchPriority="high"
            decoding="async"
          />
          <div className="left-overlay" />
          <div className="left-content">
            <div className="gov-badge">Grievance & Campaign Management</div>
            <h1>
              Building a Better
              <br />
              <span className="blue">India Campaign</span>
              <br />
              Together
            </h1>
            <div className="heading-divider" />
            <p>
              Towards progress, transparency
              <br />
              and inclusive development.
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right-panel">
          <div className="login-card">

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f172a, #334155)',
                padding: '5px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="44" stroke="url(#logoGrad)" strokeWidth="3" />
                  <circle cx="50" cy="50" r="36" stroke="#FF9933" strokeWidth="2" opacity="0.8" />
                  <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
                  <circle cx="50" cy="50" r="28" stroke="#128807" strokeWidth="2" opacity="0.8" />
                  <circle cx="50" cy="50" r="16" stroke="#000080" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="4" fill="#000080" />
                  <path d="M50 34 L50 66 M34 50 L66 50 M39 39 L61 61 M39 61 L61 39 M44 35 L56 65 M35 44 L65 56 M44 65 L56 35 M35 56 L65 44 M47 34 L53 66 M34 47 L66 53 M47 66 L53 34 M34 53 L66 47" stroke="#000080" strokeWidth="1" opacity="0.85" />
                  <defs>
                    <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF9933" />
                      <stop offset="50%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#128807" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span style={{ fontSize: '8px', fontWeight: '800', color: '#0f172a', marginTop: '7px', letterSpacing: '1.5px' }}>
                INDIA CAMPAIGN
              </span>
            </div>

            <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>
              {isLogin ? 'Sign in to continue your journey' : 'Register to get started today'}
            </p>

            {error && (
              <div style={{ width: '100%', background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '10px 14px', marginBottom: '18px', borderRadius: '8px' }}>
                <span style={{ color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>

              {!isLogin && (
                <div className="input-wrap">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}

              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="input-wrap">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '42px' }}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  <svg style={{ width: '17px', height: '17px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#64748b', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" style={{ width: '14px', height: '14px', accentColor: '#2563eb' }} defaultChecked />
                  Remember me
                </label>
                <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>Forgot Password?</a>
              </div>

              <button type="submit" className="submit-btn">
                {isLogin ? 'Login Securely' : 'Create Your Account'}
                <svg style={{ width: '17px', height: '17px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Divider */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Social Buttons */}
            <div className="social-btn-container" style={{ width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="social-btn" style={{ flex: '1 1 30%', minWidth: '100px' }}>
                <svg style={{ width: '15px', height: '15px', color: '#ea4335' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.080z" /></svg>
                Google
              </button>
              <button className="social-btn">
                <svg style={{ width: '15px', height: '15px', color: '#1877f2' }} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686 0.235 2.686 0.235v2.953H15.83c-1.491 0-1.956 0.925-1.956 1.874v2.25h3.328l-0.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
              </button>
              <button className="social-btn">
                <svg style={{ width: '15px', height: '15px', color: '#1da1f2' }} viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                Twitter
              </button>
            </div>

            <p style={{ marginTop: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center', fontWeight: '500' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#2563eb', fontWeight: '800', cursor: 'pointer' }}>
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}