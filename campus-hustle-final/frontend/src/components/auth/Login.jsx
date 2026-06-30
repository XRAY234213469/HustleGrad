// frontend/src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button } from '../shared';

const Login = () => {
  const navigate = useNavigate();
  const { login, authNotice, setAuthNotice } = useAuth();

  const [step,    setStep]    = useState('credentials');
  const [userId,  setUserId]  = useState(null);
  const [form,    setForm]    = useState({ admissionNumber: '', password: '' });
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [info,    setInfo]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setAuthNotice(''); setLoading(true);
    try {
      const res = await authApi.login(form);
      setUserId(res.data.userId);
      setInfo(res.data.message);
      setStep('twofa');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authApi.verify2FA(userId, code);
      login(res.data.user, res.data.token);
      navigate(res.data.user.is_admin ? '/admin' : '/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)',
  };

  return (
    <div className="auth-page">
      <div className="auth-card page-enter">

        {step === 'credentials' && (
          <>
            <div className="auth-logo">
              <span className="emoji">🔑</span>
              <h2>Welcome Back</h2>
              <p>Sign in to your HustleGrad account</p>
            </div>

            <Alert type="error" message={error} />
            <Alert type="warning" message={authNotice} />

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Admission Number</label>
                <input
                  type="text"
                  value={form.admissionNumber}
                  onChange={e => setForm(p => ({ ...p, admissionNumber: e.target.value }))}
                  placeholder="123456"
                  required
                  autoFocus
                  pattern="\d{6,8}"
                  minLength={6}
                  maxLength={8}
                  inputMode="numeric"
                  title="Enter the 6 to 8 digit admission number issued by the school."
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full" style={{ marginTop: 4 }}>
                {loading ? 'Signing in…' : 'Continue →'}
              </Button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.87rem', color: 'var(--text-muted)' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
            </p>
          </>
        )}

        {step === 'twofa' && (
          <>
            <div className="auth-logo">
              <span className="emoji">🔒</span>
              <h2>Verify Identity</h2>
              <p>Enter the OTP sent to your linked email</p>
            </div>
            <Alert type="info"  message={info} />
            <Alert type="error" message={error} />
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>6-digit Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  required
                  autoFocus
                  style={{
                    textAlign: 'center', letterSpacing: 10,
                    fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 800,
                  }}
                  placeholder="000000"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </Button>
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => { setStep('credentials'); setError(''); setCode(''); }}
              >
                ← Back to Login
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
