import { useEffect, useState } from 'react';
import useCompactLayout from '../hooks/useCompactLayout';
import { getAdminPresentationDetail, getAdminPresentations } from '../utils/api';
import { formatDate } from '../utils/format';
import { page, table, badge, btn, listCard } from '../styles/adminStyles';
import PresentationDetailView from '../components/PresentationDetailView';

function PresentationsTable({ items, onOpenDetail }) {
  return (
    <table style={table.table}>
      <thead>
        <tr>
          <th style={table.th}>ID</th>
          <th style={table.th}>제목</th>
          <th style={table.th}>회원</th>
          <th style={table.th}>피드백</th>
          <th style={table.th}>생성일</th>
          <th style={table.th} />
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr
            key={p.presentationId}
            style={p.hasFeedback ? { cursor: 'pointer' } : undefined}
            onClick={() => p.hasFeedback && onOpenDetail(p)}
          >
            <td style={table.td}>{p.presentationId}</td>
            <td style={table.td}>{p.title || '(제목 없음)'}</td>
            <td style={table.td}>
              <div>{p.userName}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {p.userEmail}
              </div>
            </td>
            <td style={table.td}>
              <span style={p.hasFeedback ? badge.user : badge.pending}>
                {p.hasFeedback ? '완료' : '미완료'}
              </span>
            </td>
            <td style={table.td}>{formatDate(p.createdAt)}</td>
            <td style={table.td}>
              {p.hasFeedback ? (
                <button
                  type="button"
                  style={btn.small}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(p);
                  }}
                >
                  상세보기
                </button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PresentationsMobileList({ items, onOpenDetail }) {
  return (
    <div style={listCard.list}>
      {items.map((p) => (
        <div
          key={p.presentationId}
          style={{
            ...listCard.item,
            ...(p.hasFeedback ? { cursor: 'pointer' } : {}),
          }}
          onClick={() => p.hasFeedback && onOpenDetail(p)}
          onKeyDown={(e) => {
            if (p.hasFeedback && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onOpenDetail(p);
            }
          }}
          role={p.hasFeedback ? 'button' : undefined}
          tabIndex={p.hasFeedback ? 0 : undefined}
        >
          <div style={listCard.row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={listCard.title}>{p.title || '(제목 없음)'}</p>
              <p style={listCard.sub}>
                {p.userName} · {p.userEmail}
              </p>
            </div>
            <span style={p.hasFeedback ? badge.user : badge.pending}>
              {p.hasFeedback ? '완료' : '미완료'}
            </span>
          </div>
          <p style={listCard.sub}>ID {p.presentationId} · {formatDate(p.createdAt)}</p>
          {p.hasFeedback && (
            <div style={listCard.actions}>
              <button
                type="button"
                style={{ ...btn.small, width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(p);
                }}
              >
                상세보기
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PresentationsPage() {
  const compact = useCompactLayout();
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (view !== 'list') return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        setItems(await getAdminPresentations());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [view]);

  const openDetail = async (p) => {
    if (!p.hasFeedback) return;
    setView('detail');
    setDetail(null);
    setDetailLoading(true);
    setError('');
    try {
      const d = await getAdminPresentationDetail(p.presentationId);
      setDetail(d);
    } catch (e) {
      setError(e.message);
      setView('list');
    } finally {
      setDetailLoading(false);
    }
  };

  if (view === 'detail') {
    return (
      <PresentationDetailView
        detail={detail}
        loading={detailLoading}
        onBack={() => {
          setView('list');
          setDetail(null);
        }}
      />
    );
  }

  return (
    <>
      <header style={page.header}>
        <p style={page.eyebrow}>PRESENTATIONS</p>
        <h1 style={page.title}>발표 관리</h1>
        <p style={page.sub}>피드백이 완료된 발표는 상세보기로 전체 피드백을 확인할 수 있습니다.</p>
      </header>

      {error && <p style={{ color: 'var(--red)', marginBottom: 16, fontSize: 13 }}>{error}</p>}

      <div style={{ ...table.wrap, ...(compact ? { overflow: 'visible', background: 'transparent', border: 'none' } : {}) }}>
        {loading ? (
          <p style={table.empty}>불러오는 중...</p>
        ) : items.length === 0 ? (
          <p style={table.empty}>등록된 발표가 없습니다.</p>
        ) : compact ? (
          <PresentationsMobileList items={items} onOpenDetail={openDetail} />
        ) : (
          <PresentationsTable items={items} onOpenDetail={openDetail} />
        )}
      </div>
    </>
  );
}
