import React, { useEffect } from 'react';

const LOGO_URL = 'https://chatjdevibe.innova9.io/vibe/images/Logo_thin.png';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const BASE = 'https://chatjdevibe.innova9.io';

const APPS = [
  { slug: 'bakenjoy-field', title: 'Field Maintenance', subtitle: 'Start / complete work orders', desc: 'Open equipment work orders, start jobs, report hours, and complete field work.', color: '#2563eb', icon: 'wrench' },
  { slug: 'bakenjoy-wolist', title: 'My Work Orders', subtitle: 'My assigned work orders', desc: 'List maintenance work orders assigned to you, open detail, and start work.', color: '#7c3aed', icon: 'list' },
  { slug: 'bakenjoy-create-wo', title: 'Create Work Order', subtitle: 'New maintenance work order', desc: 'Create a maintenance work order on an equipment asset.', color: '#059669', icon: 'plus' },
  { slug: 'bakenjoy-assetbom', title: 'Asset BOM', subtitle: 'Equipment parts list', desc: 'Browse the bill of materials for an equipment asset.', color: '#d97706', icon: 'layers' },
  { slug: 'bakenjoy-parts', title: 'Part Lookup', subtitle: 'Search + availability', desc: 'Search items by description and check on-hand / available by branch.', color: '#db2777', icon: 'search' },
  { slug: 'bakenjoy-pmschedule', title: 'PM Schedule', subtitle: 'Preventive maintenance', desc: 'View preventive maintenance schedule lines for an equipment asset.', color: '#0891b2', icon: 'calendar' },
];

const Icon = ({ name, color }) => {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'wrench') return (<svg {...common}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
  if (name === 'list') return (<svg {...common}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>);
  if (name === 'plus') return (<svg {...common}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
  if (name === 'layers') return (<svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);
  if (name === 'search') return (<svg {...common}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
  if (name === 'calendar') return (<svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
  return null;
};

export default function BakeNJoyHome() {
  useEffect(() => { document.title = 'Bake n Joy — Equipment Maintenance'; }, []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: FONT, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 45%, #3b82f6 100%)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 48px' }}>
        <header style={{ textAlign: 'center', marginBottom: 36, color: '#fff' }}>
          <img src={LOGO_URL} alt="Innova9" style={{ display: 'block', height: 56, margin: '0 auto 16px', objectFit: 'contain' }} />
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Bake n Joy</h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>Equipment Maintenance · Capital Asset Management</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.7 }}>JD Edwards EnterpriseOne</p>
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
