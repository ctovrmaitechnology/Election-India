import React, { useState, useEffect } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true); // Load instantly for maximum speed

  useEffect(() => {
    // No artificial delay needed, CSS animations handle the entry gracefully
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({ 
      name: name || (email ? email.split('@')[0] : 'Goa Admin'), 
      email: email || 'admin@goa.gov.in', 
      role: 'Admin' 
    });
  };

  const handleCitizenLogin = () => {
    onLoginSuccess({ 
      name: 'Citizen User', 
      email: 'citizen@goa.gov.in', 
      role: 'Citizen' 
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #ffffff;
          overflow: hidden;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes expandWidth {
          from { width: 0; opacity: 0; }
          to { width: 100px; opacity: 1; }
        }

        @keyframes subtlePan {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.03); }
        }

        @keyframes formFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── LAYOUT ── */
        .auth-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }

        /* Full Screen Background Image */
        .full-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 75% 100%; /* Moves image to the left (15%) and crops sky at the bottom (100%) */
          z-index: 1;
          animation: subtlePan 40s alternate infinite ease-in-out;
        }

        /* Subtle dark blue overlay over the whole image */
        .bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(135deg, rgba(11, 59, 130, 0.4) 0%, rgba(11, 59, 130, 0.15) 95%);
        }

        /* Flex wrapper for the split content */
        .content-wrapper {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          display: flex;
        }

        /* ── LEFT CONTENT (55% Width) ── */
        .left-content {
          width: 55%;
          height: 100%;
          padding: 60px 10%;
          padding-left: 12%; /* Pushes the entire text block (title, subtitles) slightly to the right */
          padding-bottom: 45vh; /* Pushes text much higher up into the cleaner sky area */
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          text-align: left;
        }

        .connect-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 72px; 
          font-weight: 800; /* ExtraBold */
          color: #FFFFFF;
          margin-bottom: 12px;
          letter-spacing: -2px;
          line-height: 1.1;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); /* Subtle shadow */
          opacity: 0;
          transform: translateY(30px);
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        .gold-separator {
          display: flex;
          align-items: center;
          width: 120px;
          height: 4px;
          background: linear-gradient(to right, #FFD700, #D4AF37); /* Brighter gold */
          margin-bottom: 30px;
          border-radius: 2px;
          opacity: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: expandWidth 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
        }

        .connect-subhead {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 500; /* Medium */
          color: #F5F5F5;
          line-height: 1.5;
          margin-bottom: 8px;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); /* Subtle shadow for readability */
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }

        .connect-bold-tag {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 700; /* Bold */
          color: #F4C430; /* Goa Gold */
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); /* Subtle shadow for readability */
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }

        /* ── RIGHT CONTENT (45% Width) Transparent container ── */
        .right-content {
          width: 45%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end; /* Moves the login box to the right */
          padding: 40px 4.5% 40px 4px; /* Gives some breathing room from the absolute right edge */
          /* Transparent so background image shows through */
        }

        /* Solid Premium Form Card */
        .form-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); /* Softer, elegant shadow */
          padding: 40px;
          position: relative;
          z-index: 2;
          border: none; /* No border for a cleaner look */
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
        }

        /* Logo Emblem Hover Float */
        .logo-emblem-container {
          width: 104px;
          height: 104px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .logo-emblem-container:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .logo-emblem {
          width: 100%;
          height: 100%;
        }

        .form-card h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 800; /* Bolder header */
          color: #0f172a;
          margin-top: 0; /* Remove default browser margin */
          margin-bottom: 8px;
          text-align: center;
          letter-spacing: -0.5px;
        }

        .form-card p.subtitle {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 32px;
          text-align: center;
          font-weight: 500;
        }

        .form-card form {
          width: 100%;
        }

        /* Animated Section */
        .animated-section {
          width: 100%;
          animation: formFadeIn 0.4s ease-out;
        }

        .input-group {
          position: relative;
          margin-bottom: 16px;
          width: 100%;
          transition: transform 0.2s;
        }

        .input-group:focus-within {
          transform: translateY(-2px);
        }

        .input-group input {
          width: 100%;
          padding: 16px 16px 16px 44px;
          font-size: 15px;
          border: 1px solid #e2e8f0; /* Crisp lighter border */
          border-radius: 12px;
          background: #ffffff; /* Solid white background */
          color: #0f172a;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-group input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        .input-group svg.input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #94a3b8;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-group input:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: #cbd5e1;
        }

        .input-group input:focus {
          background: #ffffff;
          border-color: #0D52FF;
          box-shadow: 0 0 0 3px rgba(13, 82, 255, 0.15);
        }

        .input-group input:focus + svg.input-icon {
          color: #0D52FF;
          transform: translateY(-50%) scale(1.1);
        }

        .pw-toggle-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s, transform 0.2s;
        }

        .pw-toggle-btn:hover {
          color: #0f172a;
          transform: translateY(-50%) scale(1.1);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 28px;
          font-size: 13px;
        }

        .form-options label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e293b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          user-select: none;
          transition: color 0.2s;
        }
        
        .form-options label:hover {
          color: #0D52FF;
        }

        .form-options input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #0D52FF;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .form-options input[type="checkbox"]:hover {
          transform: scale(1.05);
        }

        .form-options a {
          color: #0D52FF;
          text-decoration: none; /* No underline by default */
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-options a:hover {
          color: #093ac6;
          text-decoration: underline;
        }

        /* ── BUTTONS ── */
        .login-btn {
          width: 100%;
          background: #0D52FF; /* Bright vibrant blue */
          color: #ffffff;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(13, 82, 255, 0.25);
        }

        .login-btn:hover {
          background: #093ac6;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 82, 255, 0.35);
        }

        .login-btn:active {
          transform: translateY(1px);
        }

        .login-btn svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          transition: transform 0.3s;
        }

        .login-btn:hover svg {
          transform: translateX(4px);
        }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin-bottom: 20px;
        }

        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(148, 163, 184, 0.4);
        }

        .or-divider span {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0px;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .google-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .google-btn:active {
          transform: translateY(0);
        }

        .register-footer {
          margin-top: 28px;
          font-size: 13.5px;
          color: #64748b;
        }

        .register-footer span {
          color: #0B3B82;
          font-weight: 700;
          cursor: pointer;
          margin-left: 6px;
          transition: all 0.2s;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .register-footer span:hover {
          color: #082d63;
          text-decoration-color: transparent;
        }

        @media (max-width: 1024px) {
          .left-content { display: none; }
          .right-content { 
            width: 100%; 
            padding: 20px; 
            justify-content: center; /* Center the form on mobile */
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 30px 24px; /* Tighter padding for very small screens */
            border-radius: 20px;
          }
          .form-card h2 {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="auth-container">
        
        {/* Full Screen Background Image - High Priority */}
        <img src="/goa_campaign_bg.png" alt="Goa Church Background" className="full-bg" fetchpriority="high" decoding="sync" />
        <div className="bg-overlay"></div>
        
        <div className="content-wrapper">
          {/* ── LEFT CONTENT (55% Width) ── */}
          {isLoaded && (
            <div className="left-content">
              <h1 className="connect-title">People Connect</h1>
              <div className="gold-separator"></div>
              
              <p className="connect-subhead">Your Voice. Our Responsibility.</p>
              <p className="connect-bold-tag">Together for a Better Goa.</p>
            </div>
          )}

          {/* ── RIGHT CONTENT (45% Width - Transparent) ── */}
          <div className="right-content">
            {/* Form Card wrapper */}
            {isLoaded && (
              <div className="form-card" key={isLogin ? 'login' : 'register'}>
                
                {/* Government of Goa Logo */}
                <div className="logo-emblem-container" style={{ width: '100%', maxWidth: '240px', height: 'auto', marginBottom: '-12px' }}>
                  <img 
                    src="/goa_logo.png" 
                    fetchpriority="high"
                    decoding="sync"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                  />
                </div>

                <h2>Welcome Back!</h2>
                <p className="subtitle">{isLogin ? 'Sign in to continue your journey' : 'Register to create your account'}</p>

                <form onSubmit={handleSubmit}>
                  <div className="animated-section">
                    
                    {!isLogin && (
                      <div className="input-group">
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                        />
                        <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}

                    <div className="input-group">
                      <input 
                        type="text" 
                        placeholder="Email address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                      <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    <div className="input-group">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                      />
                      <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <button type="button" className="pw-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Remember me
                    </label>
                    <a href="#">Forgot Password?</a>
                  </div>

                  <button type="submit" className="login-btn">
                    {isLogin ? (
                      <>
                        Login Securely
                        <svg viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="or-divider">
                  <span>or continue with</span>
                </div>

                <button type="button" className="google-btn" onClick={() => console.log('Google login')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Account
                </button>

                <div className="register-footer">
                  {isLogin ? "New here?" : "Already have an account?"}
                  <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Register Now' : 'Login here'}
                  </span>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
