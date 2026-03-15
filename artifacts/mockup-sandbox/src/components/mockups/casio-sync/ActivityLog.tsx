import React, { useState } from 'react';

function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div
              style={{
                width: '100%',
                height: `${(v / max) * 80}px`,
                background: color,
                borderRadius: '4px 4px 0 0',
                minHeight: v > 0 ? 4 : 0,
                opacity: i >= 5 ? 0.3 : 1,
                transition: 'height 0.8s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: '#606080' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function ActivityLog() {
  const [metric, setMetric] = useState<'steps' | 'calories' | 'km'>('steps');

  const history = [
    { date: '2026-03-15', steps: 7842, calories: 312, km: 6.1 },
    { date: '2026-03-14', steps: 9304, calories: 372, km: 7.3 },
    { date: '2026-03-13', steps: 6512, calories: 260, km: 5.1 },
    { date: '2026-03-12', steps: 8100, calories: 324, km: 6.3 },
    { date: '2026-03-11', steps: 4230, calories: 169, km: 3.3 },
    { date: '2026-03-10', steps: 11200, calories: 448, km: 8.7 },
    { date: '2026-03-09', steps: 5600, calories: 224, km: 4.4 },
  ];

  const weekSteps = [4230, 8100, 6512, 9304, 7842, 0, 0];
  const weekCal = [169, 324, 260, 372, 312, 0, 0];
  const weekKm = [3.3, 6.3, 5.1, 7.3, 6.1, 0, 0];

  const chartData = metric === 'steps' ? weekSteps : metric === 'calories' ? weekCal : weekKm;
  const chartColor = metric === 'steps' ? '#00F5FF' : metric === 'calories' ? '#FF9500' : '#00FF88';

  const totalSteps = history.reduce((s, h) => s + h.steps, 0);
  const totalCals = history.reduce((s, h) => s + h.calories, 0);
  const totalKm = history.reduce((s, h) => s + h.km, 0);

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FFF', padding: '0 0 40px 0' }}>
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 28, background: '#00F5FF', borderRadius: 2, boxShadow: '0 0 8px #00F5FF' }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Activity Log</div>
          <div style={{ fontSize: 12, color: '#A0A0C0', marginTop: 2 }}>7 days tracked</div>
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {/* Summary row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Total Steps', val: totalSteps.toLocaleString(), color: '#00F5FF' },
            { label: 'Total Cal', val: totalCals.toLocaleString(), color: '#FF9500' },
            { label: 'Total KM', val: totalKm.toFixed(1), color: '#00FF88' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#16161F', borderRadius: 12, border: '1px solid #2A2A3D', padding: '12px 10px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Metric selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['steps', 'calories', 'km'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              style={{
                flex: 1,
                background: metric === m ? `${chartColor}15` : 'transparent',
                border: `1px solid ${metric === m ? chartColor : '#2A2A3D'}`,
                color: metric === m ? chartColor : '#606080',
                borderRadius: 8, padding: '8px 0', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.6px', cursor: 'pointer',
              }}
            >
              {m === 'km' ? 'Distance' : m}
            </button>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', padding: 16, marginBottom: 12, boxShadow: `0 0 12px ${chartColor}15` }}>
          <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 14 }}>
            7-Day {metric === 'km' ? 'Distance' : metric} {metric === 'km' ? '(km)' : metric === 'calories' ? '(kcal)' : '(steps)'}
          </div>
          <BarChart data={chartData} color={chartColor} />
        </div>

        {/* Daily history */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', padding: 16 }}>
          <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 12 }}>Daily History</div>
          {history.map((h, i) => (
            <div key={h.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid #2A2A3D' : 'none' }}>
              <span style={{ fontSize: 12, color: '#A0A0C0' }}>{h.date}</span>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 12, color: '#00F5FF', fontWeight: 600 }}>{h.steps.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: '#FF9500', fontWeight: 600 }}>{h.calories} kcal</span>
                <span style={{ fontSize: 12, color: '#00FF88', fontWeight: 600 }}>{h.km} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
