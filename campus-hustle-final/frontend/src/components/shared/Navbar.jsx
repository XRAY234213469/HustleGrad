// frontend/src/components/shared/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useNavbarScroll from '../../hooks/useNavbarScroll';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useNavbarScroll();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <span style={s.logoIcon}>🎓</span>
          <span style={s.logoText}>HustleGrad</span>
        </Link>

        {/* Desktop links */}
        <div style={s.links} className="hide-mobile">
          <Link to="/marketplace" style={s.link}>Browse</Link>
          {user && (
            <Link to="/messages" style={s.link}>Messages</Link>
          )}
          {user?.is_admin && (
            <Link to="/admin" style={s.link}>Admin</Link>
          )}
        </div>

        {/* Desktop auth */}
        <div style={s.auth} className="hide-mobile">
          {user ? (
            <>
              <button
                onClick={() => navigate(user.is_admin ? '/admin' : '/dashboard')}
                style={s.btnGhost}
              >
                👤 {user.name.split(' ')[0]}
              </button>
              <button onClick={handleLogout} style={s.btnPrimary}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}    style={s.btnGhost}>Login</button>
              <button onClick={() => navigate('/register')} style={s.btnPrimary}>Get Started</button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="hide-desktop"
          onClick={() => setMenuOpen((o) => !o)}
          style={s.burger}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          <Link to="/marketplace" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Browse</Link>
          {user && <Link to="/messages" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Messages</Link>}
          {user && <Link to={user.is_admin ? '/admin' : '/dashboard'} style={s.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user
            ? <button onClick={handleLogout}           style={s.mobileLinkBtn}>Sign Out</button>
            : <button onClick={() => { navigate('/login'); setMenuOpen(false); }} style={s.mobileLinkBtn}>Login</button>
          }
        </div>
      )}
    </nav>
  );
};

const s = {
  inner:       { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo:        { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoIcon:    { fontSize: '1.4rem' },
  logoText:    { fontWeight: 800, fontSize: '1.05rem', color: '#0288d1', letterSpacing: '-0.02em' },
  links:       { display: 'flex', gap: 4 },
  link:        { padding: '6px 14px', borderRadius: 6, color: '#334155', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.15s', ':hover': { background: '#f1f5f9' } },
  auth:        { display: 'flex', gap: 8, alignItems: 'center' },
  btnGhost:    { padding: '7px 16px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'transparent', color: '#334155', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' },
  btnPrimary:  { padding: '7px 18px', border: 'none', borderRadius: 8, background: '#0288d1', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(2,136,209,0.25)' },
  burger:      { background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#334155', padding: 8 },
  mobileMenu:  { borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4, background: '#fff' },
  mobileLink:  { padding: '10px 14px', borderRadius: 8, color: '#334155', fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none' },
  mobileLinkBtn:{ padding: '10px 14px', borderRadius: 8, color: '#dc2626', fontWeight: 600, fontSize: '0.95rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
};

export default Navbar;
