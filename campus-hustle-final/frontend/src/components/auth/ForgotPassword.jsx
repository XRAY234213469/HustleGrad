// frontend/src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { Alert, Button } from '../shared';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step,     setStep]     = useState('email');
  const [email,    setEmail]    = useState('');
  const [userId,   setUserId]   = useState(null);
  const [code,     setCode]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setUserId(res.data.userId);
      setInfo(res.data.message);
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6)  return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authApi.resetPassword({ userId, resetCode: code, newPassword: password });
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', marginBottom: 6,
    fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)',
  };

  return (
    <div className="auth-page">
      <div className="auth-card page-enter">

        {step === 'email' && (
          <>
            <div className="auth-logo">
              <span className="emoji">🔐</span>
              <h2>Forgot Password?</h2>
              <p>Enter your student email and we'll send a reset code</p>
            </div>
            <Alert type="error" message={error} />
            <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Student Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@strathmore.edu"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending code…' : 'Send Reset Code →'}
              </Button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.87rem', color: 'var(--text-muted)' }}>
              Remembered it?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to Sign In</Link>
            </p>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="auth-logo">
              <span className="emoji">✉️</span>
              <h2>Check Your Email</h2>
              <p>Enter the 6-digit code and your new password</p>
            </div>
            <Alert type="info"  message={info} />
            <Alert type="error" message={error} />
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Reset Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  required
                  placeholder="000000"
                  style={{
                    textAlign: 'center', letterSpacing: 10,
                    fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 800,
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting…' : 'Reset Password'}
              </Button>
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => { setStep('email'); setError(''); setCode(''); }}
              >
                ← Back
              </Button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Your password has been updated successfully.<br />
              You can now sign in with your new password.
            </p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to Sign In →
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;