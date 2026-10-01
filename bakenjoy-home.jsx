import React, { useState, useEffect } from 'react';

// --- Bake n Joy shared AIS session (SSO across /bakenjoy-* apps) ---
const BNJ_AUTH_COOKIE = 'bakenjoy_ais_auth';
const BNJ_AUTH_TTL_MIN = 30;
const BNJ_DEVICE = 'ChatJDE';
const BNJ_LEGACY_COOKIE_NAMES = [
  'jde_bnjhome_token', 'jde_bnjhome_username', 'jde_bnjhome_env',
  'jde_bnjwolist_token', 'jde_bnjwolist_username', 'jde_bnjwolist_env',
  'jde_bnjcreatewo_token', 'jde_bnjcreatewo_username', 'jde_bnjcreatewo_env',
  'jde_bnjparts_token', 'jde_bnjparts_username', 'jde_bnjparts_env',
  'jde_bnjfield_token', 'jde_bnjfield_username', 'jde_bnjfield_env',
  'jde_bnjassetbom_token', 'jde_bnjassetbom_username', 'jde_bnjassetbom_env',
  'jde_bnjpmsched_token', 'jde_bnjpmsched_username', 'jde_bnjpmsched_env',
];
const setCookie = (name, value, minutes = BNJ_AUTH_TTL_MIN) => {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  const secure = (typeof location !== 'undefined' && location.protocol === 'https:') ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};
const deleteCookie = (name) => {
  const secure = (typeof location !== 'undefined' && location.protocol === 'https:') ? '; Secure' : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
};
const clearLegacyBnjCookies = () => { BNJ_LEGACY_COOKIE_NAMES.forEach(deleteCookie); };
const clearBnjAuth = () => { deleteCookie(BNJ_AUTH_COOKIE); clearLegacyBnjCookies(); };
const writeBnjAuth = ({ token, username, env, addressNumber, deviceName }) => {
  const expiresAt = Date.now() + BNJ_AUTH_TTL_MIN * 60 * 1000;
  const payload = {
    token: String(token || ''),
    username: String(username || ''),
    env: String(env || 'DV'),
    addressNumber: addressNumber ? String(addressNumber) : '',
    deviceName: deviceName || BNJ_DEVICE,
    expiresAt,
  };
  if (!payload.token || !payload.username) return;
  setCookie(BNJ_AUTH_COOKIE, JSON.stringify(payload), BNJ_AUTH_TTL_MIN);
  clearLegacyBnjCookies();
};
const readBnjAuth = () => {
  const raw = getCookie(BNJ_AUTH_COOKIE);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || !data.token || !data.username) return null;
    if (data.expiresAt && Date.now() > Number(data.expiresAt)) { clearBnjAuth(); return null; }
    return data;
  } catch (e) { return null; }
};
const refreshBnjAuth = (session) => {
  if (!session || !session.token || !session.username) return;
  writeBnjAuth(session);
};

const LOGO_URL = 'https://chatjdevibe.innova9.io/vibe/images/Logo_thin.png';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const BASE = 'https://chatjdevibe.innova9.io';
const ENV_PREF = 'bakenjoy_env_pref';

const APPS = [
  { slug: 'bakenjoy-field', title: 'Field Maintenance', subtitle: 'Start / complete work orders', desc: 'Open equipment work orders, start jobs, report hours, and complete field work.', color: '#2563eb', icon: 'wrench' },
  { slug: 'bakenjoy-wolist', title: 'My Work Orders', subtitle: 'My assigned work orders', desc: 'List maintenance work orders assigned to you, open detail, and start work.', color: '#7c3aed', icon: 'list' },
  { slug: 'bakenjoy-dashboard', title: 'Dashboard & Reports', subtitle: 'Charts + CSV export', desc: 'Work order analytics by status, person, and branch, plus a raw data grid you can export.', color: '#4f46e5', icon: 'chart' },
  { slug: 'bakenjoy-create-wo', title: 'Create Work Order', subtitle: 'New maintenance work order', desc: 'Create a maintenance work order on an equipment asset.', color: '#059669', icon: 'plus' },
  { slug: 'bakenjoy-assetbom', title: 'Asset BOM', subtitle: 'Equipment parts list', desc: 'Browse the bill of materials for an equipment asset.', color: '#d97706', icon: 'layers' },
  { slug: 'bakenjoy-parts', title: 'Part Lookup', subtitle: 'Search + availability', desc: 'Search items by description and check on-hand / available by branch.', color: '#db2777', icon: 'search' },
  { slug: 'bakenjoy-pmschedule', title: 'PM Schedule', subtitle: 'Preventive maintenance', desc: 'View preventive maintenance schedule lines for an equipment asset.', color: '#0891b2', icon: 'calendar' },
];

const ENVIRONMENTS = {
  DV: { label: 'DV', description: 'Development', aisBaseUrl: 'https://studio.chatjde.ai/jderest/v2', jdeEnv: 'JDV920', color: '#2563eb' },
  PD: { label: 'PD', description: 'Production', aisBaseUrl: 'http://10.9.4.139:8002/jderest/v2', jdeEnv: 'JPD920', color: '#dc2626' },
};

const Icon = ({ name, color }) => {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'wrench') return (<svg {...common}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
  if (name === 'list') return (<svg {...common}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>);
  if (name === 'plus') return (<svg {...common}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
  if (name === 'layers') return (<svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);
  if (name === 'search') return (<svg {...common}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
  if (name === 'calendar') return (<svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
  if (name === 'chart') return (<svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>);
  return null;
};

export default function BakeNJoyHome() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState('DV');

  const envConfig = ENVIRONMENTS[selectedEnv];

  useEffect(() => { document.title = 'Bake n Joy — Equipment Maintenance'; }, []);
  useEffect(() => {
    const pref = getCookie(ENV_PREF);
    if (pref && ENVIRONMENTS[pref]) setSelectedEnv(pref);
    const sess = readBnjAuth();
    if (sess) {
      if (sess.env && ENVIRONMENTS[sess.env]) setSelectedEnv(sess.env);
      setToken(sess.token);
      setUsername(sess.username);
      setIsLoggedIn(true);
    }
    setValidatingToken(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setError(null);
    setSessionExpiredMessage(null);
    try {
      const response = await fetch(`${envConfig.aisBaseUrl}/tokenrequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: BNJ_DEVICE, username, environment: envConfig.jdeEnv, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials. Please try again.');
      const data = await response.json();
      const newToken = data.userInfo?.token || data.token || null;
      if (!newToken) throw new Error('Authentication failed. No token received.');
      const an8 = data.userInfo?.addressNumber || data.addressNumber || '';
      writeBnjAuth({ token: newToken, username, env: selectedEnv, addressNumber: an8, deviceName: BNJ_DEVICE });
      setToken(newToken);
      setIsLoggedIn(true);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${envConfig.aisBaseUrl}/tokenrequest/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (e) { /* ignore */ }
    }
    clearBnjAuth();
    setIsLoggedIn(false);
    setToken(null);
    setUsername('');
    setPassword('');
  };

  const inputStyle = { padding: '12px 16px', fontSize: 16, color: '#111827', border: '1px solid #d1d5db', borderRadius: 8, width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 14, fontWeight: 500, color: '#1f2937', marginBottom: 6, display: 'block' };

  if (validatingToken) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 45%, #3b82f6 100%)', color: '#fff' }}>Loading…</div>;
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e3a8a,#3b82f6,#60a5fa)', padding: 20, fontFamily: FONT }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src={LOGO_URL} alt="Innova9" style={{ display: 'block', height: 56, margin: '0 auto 12px', objectFit: 'contain' }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Bake n Joy</h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>JD Edwards EnterpriseOne</p>
          </div>
          {sessionExpiredMessage && <div style={{ padding: 12, background: '#fffbeb', borderRadius: 8, color: '#92400e', marginBottom: 12 }}>{sessionExpiredMessage}</div>}
          {error && <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8, color: '#dc2626', marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(ENVIRONMENTS).map(([key, env]) => (
                <button key={key} type="button" onClick={() => { setSelectedEnv(key); setCookie(ENV_PREF, key, 43200); }}
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: `2px solid ${selectedEnv === key ? env.color : '#e5e7eb'}`, background: selectedEnv === key ? `${env.color}10` : '#fff', cursor: 'pointer', fontWeight: 700, color: selectedEnv === key ? env.color : '#1f2937' }}>{env.label}</button>
              ))}
            </div>
            <div><label style={labelStyle}>Username</label><input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
            <div><label style={labelStyle}>Password</label><input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
            <button type="submit" disabled={loginLoading} style={{ padding: 14, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{loginLoading ? 'Signing in…' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: FONT, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 45%, #3b82f6 100%)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 48px' }}>
        <header style={{ textAlign: 'center', marginBottom: 28, color: '#fff' }}>
          <img src={LOGO_URL} alt="Innova9" style={{ display: 'block', height: 56, margin: '0 auto 16px', objectFit: 'contain' }} />
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Bake n Joy</h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>Equipment Maintenance · Capital Asset Management</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.7 }}>JD Edwards EnterpriseOne</p>
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
            <span style={{ fontSize: 13 }}>{username} · {selectedEnv}</span>
            <button type="button" onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Logout</button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {APPS.map((app) => (
            <a
              key={app.slug}
              href={`${BASE}/${app.slug}`}
              style={{
                textDecoration: 'none', color: 'inherit',
                background: '#fff', borderRadius: 16, padding: 20,
                boxShadow: '0 20px 40px -16px rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.6)',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${app.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={app.icon} color={app.color} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{app.title}</div>
                  <div style={{ fontSize: 12, color: app.color, fontWeight: 600 }}>{app.subtitle}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.45, flex: 1 }}>{app.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: app.color }}>Open →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
