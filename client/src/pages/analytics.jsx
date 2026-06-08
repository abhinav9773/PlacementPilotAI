import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Analytics() {
  const { theme } = useAuthStore();
  const isLight = theme === 'light';

  const card   = isLight ? '#ffffff' : '#0d0d1a';
  const border = isLight ? '#e8eaf0' : '#1a1a2e';
  const text   = isLight ? '#0f172a' : '#f1f5f9';
  const muted  = isLight ? '#64748b' : '#475569';
  const shadow = isLight ? '0 1px 4px #0000000a' : 'none';

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interview').then(res => setInterviews(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: muted, fontSize: '13px' }}>Loading analytics...</div>;

  if (interviews.length === 0) return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Analytics</div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: text, marginBottom: '4px' }}>Your performance</h1>
      </div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '48px', textAlign: 'center', boxShadow: shadow }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
        <div style={{ fontSize: '14px', color: muted }}>No interviews yet. Complete your first interview to see analytics.</div>
      </div>
    </div>
  );

  const completed = interviews.filter(i => i.status === 'completed');
  const totalSessions = interviews.length;
  const avgScore = completed.length > 0 ? Math.round(completed.reduce((a, b) => a + (b.overallScore || 0), 0) / completed.length) : 0;
  const bestScore = completed.length > 0 ? Math.max(...completed.map(i => i.overallScore || 0)) : 0;

  const roundStats = {};
  completed.forEach(i => {
    if (!roundStats[i.round]) roundStats[i.round] = { total: 0, count: 0 };
    roundStats[i.round].total += i.overallScore || 0;
    roundStats[i.round].count += 1;
  });

  const companyStats = {};
  completed.forEach(i => {
    if (!companyStats[i.company]) companyStats[i.company] = { total: 0, count: 0 };
    companyStats[i.company].total += i.overallScore || 0;
    companyStats[i.company].count += 1;
  });

  const last7 = completed.slice(0, 7).reverse();
  const cardStyle = { background: card, border: `1px solid ${border}`, borderRadius: '14px', boxShadow: shadow };

  return (
    <div style={{ width: '100%', maxWidth: '1400px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Analytics</div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: text, letterSpacing: '-0.4px', marginBottom: '4px' }}>Your performance</h1>
        <p style={{ fontSize: '13px', color: muted }}>Track your progress across all mock interviews.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Sessions', value: totalSessions, sub: `${completed.length} completed` },
          { label: 'Avg Score', value: `${avgScore}%`, sub: 'across all rounds' },
          { label: 'Best Score', value: `${bestScore}%`, sub: 'personal best' },
          { label: 'Rounds Done', value: Object.keys(roundStats).length, sub: Object.keys(roundStats).join(', ') || '—' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '18px 20px' }}>
            <div style={{ fontSize: '11px', color: muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: text, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {last7.length > 1 && (
        <div style={{ ...cardStyle, padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: text, marginBottom: '20px' }}>Score Trend</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
            {last7.map((interview, i) => {
              const score = interview.overallScore || 0;
              const height = Math.max((score / 100) * 100, 4);
              const color = score >= 75 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '10px', color: muted, fontWeight: 500 }}>{score}%</div>
                  <div style={{ width: '100%', height: `${height}px`, background: color, borderRadius: '4px 4px 0 0', opacity: isLight ? 0.8 : 0.85, minHeight: '4px' }} />
                  <div style={{ fontSize: '10px', color: muted, textAlign: 'center' }}>{interview.round?.slice(0, 3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: text, marginBottom: '16px' }}>Performance by Round</div>
          {Object.entries(roundStats).map(([round, data]) => {
            const avg = Math.round(data.total / data.count);
            const color = avg >= 75 ? '#10b981' : avg >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={round} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: muted, fontWeight: 500 }}>{round}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color }}>{avg}%</span>
                </div>
                <div style={{ height: '4px', background: border, borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${avg}%`, background: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '10px', color: muted, marginTop: '3px' }}>{data.count} session{data.count > 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>

        <div style={{ ...cardStyle, padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: text, marginBottom: '16px' }}>Performance by Company</div>
          {Object.entries(companyStats).map(([company, data]) => {
            const avg = Math.round(data.total / data.count);
            const color = avg >= 75 ? '#10b981' : avg >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={company} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: muted, fontWeight: 500 }}>{company}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color }}>{avg}%</span>
                </div>
                <div style={{ height: '4px', background: border, borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${avg}%`, background: color, borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '10px', color: muted, marginTop: '3px' }}>{data.count} session{data.count > 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}` }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: text }}>All Sessions</div>
        </div>
        {interviews.map((interview, i) => {
          const score = interview.overallScore || 0;
          const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const date = new Date(interview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          return (
            <div key={i} style={{ padding: '14px 24px', borderBottom: i < interviews.length - 1 ? `1px solid ${border}` : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#6366f115', border: '1px solid #6366f130', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#6366f1', flexShrink: 0 }}>{interview.company?.[0] || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: text, marginBottom: '2px' }}>{interview.role} · {interview.company}</div>
                <div style={{ fontSize: '11px', color: muted }}>{interview.round} Round · {date}</div>
              </div>
              <div style={{ width: '80px' }}>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '4px', textAlign: 'right' }}>{interview.status === 'completed' ? `${score}%` : '—'}</div>
                <div style={{ height: '3px', background: border, borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}99)`, borderRadius: '2px' }} />
                </div>
              </div>
              <div style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', flexShrink: 0, background: interview.status === 'completed' ? '#10b98115' : '#6366f115', color: interview.status === 'completed' ? '#10b981' : '#6366f1', border: `1px solid ${interview.status === 'completed' ? '#10b98130' : '#6366f130'}`, fontWeight: 500 }}>
                {interview.status === 'completed' ? 'Done' : 'Active'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}