// frontend/src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { Alert, Button } from '../shared';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', admissionNumber: '', email: '', phoneNumber: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await authApi.register(form);
      setSuccess('Account created! Taking you to sign in…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card page-enter">
        <div className="auth-logo">
          <span className="emoji">🎓</span>
          <h2>Create Account</h2>
          <p>Join with your admission number and preferred email</p>
        </div>

        <Alert type="error"   message={error} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name', required: true },
            { label: 'Admission Number', name: 'admissionNumber', type: 'text', placeholder: 'ADM001', required: true },
            { label: 'Email for OTP', name: 'email', type: 'email', placeholder: 'personal@email.com or you@strathmore.edu', required: true },
            { label: 'Contact Number', name: 'phoneNumber', type: 'tel', placeholder: '0712 345 678', required: false },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Password', required: true },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {label}
              </label>
              <input name={name} type={type} value={form[name]} onChange={handleChange}
                placeholder={placeholder} required={required} />
            </div>
          ))}

          <Button type="submit" disabled={loading} className="w-full" style={{ marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.87rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
