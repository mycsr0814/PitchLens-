import useCompactLayout from '../hooks/useCompactLayout';
import { layout, mobileLayout, nav } from '../styles/adminStyles';

const NAV = [
  { id: 'dashboard', label: '대시보드', short: '홈' },
  { id: 'users', label: '회원 관리', short: '회원' },
  { id: 'presentations', label: '발표 관리', short: '발표' },
];

const fade = { animation: 'fadeUp 0.35s ease' };

export default function AdminLayout({ page, onNavigate, onLogout, adminName, children }) {
  const compact = useCompactLayout();

  if (compact) {
    return (
      <div style={{ ...mobileLayout.shell, ...fade }}>
        <header style={mobileLayout.topBar}>
          <span style={mobileLayout.topBrand}>
            PITCH<span style={{ color: 'var(--teal)' }}>LENS</span>
          </span>
          <div style={mobileLayout.topMeta}>
            <span style={mobileLayout.topName}>{adminName || '관리자'}</span>
            <button type="button" onClick={onLogout} style={nav.logoutBtnCompact}>
              로그아웃
            </button>
          </div>
        </header>

        <main style={mobileLayout.main}>{children}</main>

        <nav style={mobileLayout.tabBar}>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              style={{
                ...mobileLayout.tab,
                ...(page === item.id ? mobileLayout.tabActive : {}),
              }}
            >
              {item.short}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div style={{ ...layout.shell, ...fade }}>
      <aside style={layout.sidebar}>
        <div style={layout.brand}>
          <span style={layout.brandIcon}>◆</span>
          <div>
            <span style={layout.brandTitle}>
              PITCH<span style={{ color: 'var(--teal)' }}>LENS</span>
            </span>
            <span style={layout.brandSub}>ADMIN CONSOLE</span>
          </div>
        </div>

        <nav style={layout.nav}>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              style={{ ...nav.item, ...(page === item.id ? nav.itemActive : {}) }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={layout.sidebarFoot}>
          <p style={layout.adminName}>{adminName || '관리자'}</p>
          <button type="button" onClick={onLogout} style={nav.logoutBtn}>
            로그아웃
          </button>
        </div>
      </aside>

      <main style={layout.main}>{children}</main>
    </div>
  );
}
