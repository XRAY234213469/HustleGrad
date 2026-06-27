// frontend/src/components/shared/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🎓', title: 'Student-Only Access',    desc: 'Verified .edu emails keep the community trusted and campus-exclusive.' },
  { icon: '🔒', title: 'Secure 2FA Login',        desc: 'Every session protected by a one-time code sent to your student inbox.' },
  { icon: '💬', title: 'Direct Messaging',         desc: 'Coordinate jobs and details with vendors without leaving the platform.' },
  { icon: '⭐', title: 'Peer Reviews',             desc: 'Rate completed services to build reputation and help others decide.' },
  { icon: '📦', title: 'Easy Listings',            desc: 'Post your skill or service in under 60 seconds — no fees, no fuss.' },
  { icon: '📅', title: 'Booking Requests',         desc: 'Schedule services, track orders, and confirm delivery from your dashboard.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Register with your Strathmore .edu email. Takes 30 seconds.' },
  { step: '02', title: 'Browse or Post',       desc: 'Explore services from fellow students or list your own hustle.' },
  { step: '03', title: 'Book & Chat',          desc: 'Send a booking request and coordinate details via direct messaging.' },
  { step: '04', title: 'Deliver & Review',     desc: 'Complete the service, confirm delivery, and leave a review.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  // Trigger scroll-reveal on mount (IntersectionObserver is set up in index.html)
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    els.forEach((el, i) => {
      // small stagger per card
      el.style.transitionDelay = `${(i % 6) * 0.07}s`;
    });
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="global-nav">
        <Link to="/" className="nav-logo">Hustle<span>Grad</span></Link>
        <div className="nav-links">
          <Link to="/marketplace" className="nav-link">Browse</Link>
          <Link to="/login"    className="nav-link">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge reveal">
            🎓 Built for Strathmore Students
          </div>

          <h1 className="hero-title reveal">
            Your Campus,<br />
            Your <span className="highlight">HustleGrad</span>
          </h1>

          <p className="hero-sub reveal">
            The peer-to-peer marketplace where students buy, sell, and book
            campus services — safely, instantly, and for free.
          </p>

          <div className="hero-cta reveal">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Start Earning →
            </button>
            <button
              className="btn btn-lg"
              onClick={() => navigate('/marketplace')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
            >
              Browse Services
            </button>
          </div>

          <div className="hero-stats reveal">
            {[
              { num: '500+', lbl: 'Students Registered' },
              { num: '120+', lbl: 'Active Listings' },
              { num: '98%',  lbl: 'Satisfaction Rate' },
              { num: 'Free', lbl: 'Always' },
            ].map(({ num, lbl }) => (
              <div key={lbl} className="hero-stat-item">
                <span className="hero-stat-num">{num}</span>
                <span className="hero-stat-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="chevron" />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="badge badge-primary" style={{ marginBottom: 12, fontSize: '0.75rem' }}>Why HustleGrad?</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: 12 }}>
              Everything you need in one place
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
              Built specifically for the Strathmore community. No middlemen, no fees.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 24 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="feature-card reveal">
                <div className="f-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 12 }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>How it works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: 20 }}>
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="card reveal" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #0f172a)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', margin: '0 auto 14px',
                  boxShadow: '0 4px 14px rgba(2,136,209,0.35)',
                }}>
                  {step}
                </div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #0288d1 0%, #0f172a 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="reveal" style={{ color: '#fff', fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 12 }}>
            Ready to start earning on campus?
          </h2>
          <p className="reveal" style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 32, fontSize: '1rem' }}>
            Join hundreds of students already growing their side-hustle.
          </p>
          <div className="reveal" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-lg"
              onClick={() => navigate('/register')}
              style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}
            >
              Create Free Account
            </button>
            <button
              className="btn btn-lg"
              onClick={() => navigate('/marketplace')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}
            >
              View Marketplace
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '32px 24px',
        background: '#0f172a',
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        fontSize: '0.82rem',
      }}>
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {['Browse Listings', 'Register', 'Sign In'].map((l) => (
            <span
              key={l}
              onClick={() => navigate(l === 'Browse Listings' ? '/marketplace' : l === 'Register' ? '/register' : '/login')}
              style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >
              {l}
            </span>
          ))}
        </div>
        <p>© {new Date().getFullYear()} HustleGrad · Strathmore University School of Computing</p>
      </footer>
    </div>
  );
};

export default LandingPage;
