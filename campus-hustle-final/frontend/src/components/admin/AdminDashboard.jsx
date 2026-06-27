// frontend/src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { GlobalNav, Spinner, Alert, Card, Button, EmptyState, Badge } from '../shared';

const TABS = [
  { key:'overview',  label:'📊 Overview' },
  { key:'users',     label:'👥 Users' },
  { key:'listings',  label:'📦 Listings' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const [sRes, uRes, lRes] = await Promise.all([adminApi.getStats(), adminApi.getUsers(), adminApi.getListings()]);
        setStats(sRes.data.stats);
        setUsers(uRes.data.users);
        setListings(lRes.data.listings);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove listing "${title}"?`)) return;
    try {
      await adminApi.deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
      setMsg(`"${title}" removed.`);
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <GlobalNav />
      <div className="dashboard-page page-enter">
        <div className="dashboard-topbar">
          <div>
            <h2 style={{ margin:0 }}>🛡️ Admin Panel</h2>
            <p style={{ margin:'4px 0 0', color:'var(--text-muted)', fontSize:'0.85rem' }}>{user?.email}</p>
          </div>
        </div>

        <Alert type="error"   message={error} />
        <Alert type="success" message={msg} />

        <div className="tab-bar reveal">
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn ${tab===t.key?'active':''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {tab === 'overview' && stats && (
              <div className="stats-grid">
                {[
                  { icon:'👥', label:'Total Users',      value: stats.totalUsers },
                  { icon:'📦', label:'Active Listings',  value: stats.totalListings },
                  { icon:'✅', label:'Completed Orders', value: stats.completedTransactions },
                ].map(({icon,label,value}) => (
                  <div key={label} className="stat-card reveal">
                    <div className="stat-icon">{icon}</div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              users.length === 0 ? <EmptyState icon="👥" title="No users yet" /> : (
                <Card className="reveal">
                  <div className="table-wrapper">
                    <table>
                      <thead><tr>{['Name','Email','Role','Joined'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {users.map(u=>(
                          <tr key={u.id}>
                            <td style={{fontWeight:600}}>{u.name}</td>
                            <td style={{color:'var(--text-muted)'}}>{u.email}</td>
                            <td><Badge variant={u.is_admin?'accent':'primary'}>{u.is_admin?'Admin':'Student'}</Badge></td>
                            <td style={{color:'var(--text-muted)'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )
            )}

            {tab === 'listings' && (
              listings.length === 0 ? <EmptyState icon="📦" title="No listings yet" /> : (
                <Card className="reveal">
                  <div className="table-wrapper">
                    <table>
                      <thead><tr>{['Title','Seller','Category','Price',''].map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
                      <tbody>
                        {listings.map(l=>(
                          <tr key={l.id}>
                            <td style={{fontWeight:600}}>{l.title}</td>
                            <td>{l.seller_name}</td>
                            <td><Badge variant="neutral">{l.category_name}</Badge></td>
                            <td style={{color:'var(--primary)',fontWeight:700}}>KES {parseFloat(l.price).toLocaleString()}</td>
                            <td><Button variant="danger" size="sm" onClick={() => handleDelete(l.id, l.title)}>Remove</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
