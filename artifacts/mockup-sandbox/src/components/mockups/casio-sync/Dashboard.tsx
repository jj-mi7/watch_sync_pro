import React, { useEffect, useState } from 'react';

function AnimatedRing({ percent, color, size }: { percent: number; color: string; size: number }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setP(percent), 300);
    return () => clearTimeout(t);
  }, [percent]);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - p / 100);
  return (
    <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2A3D" strokeWidth={12} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 400); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#A0A0C0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
        <span style={{ color, fontSize: 11, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: '#2A2A3D', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: color, borderRadius: 99, width: `${width}%`, transition: 'width 0.9s ease' }} />
      </div>
    </div>
  );
}

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 280, h = 70;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 8) - 4}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (v / max) * (h - 8) - 4} r={3} fill="#0A0A0F" stroke={color} strokeWidth={2} />
      ))}
    </svg>
  );
}

export function Dashboard() {
  const steps = 7842;
  const stepsGoal = 10000;
  const cal = 312;
  const km = 6.1;
  const weekSteps = [4200, 8100, 6500, 9300, 7842, 0, 0];
  const weekCal = [168, 324, 260, 372, 312, 0, 0];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const overall = Math.round(((steps / stepsGoal) + (cal / 500) + (km / 8)) / 3 * 100);

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FFF', padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 28, background: '#00F5FF', borderRadius: 2, boxShadow: '0 0 8px #00F5FF' }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>Dashboard</div>
          <div style={{ fontSize: 12, color: '#A0A0C0', marginTop: 2 }}>Casio ABL-100WE connected</div>
        </div>
      </div>

      <div style={{ padding: '0 12px' }}>
        {/* Main Card */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', padding: 16, marginBottom: 12, boxShadow: '0 0 20px rgba(0,245,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
              <AnimatedRing percent={overall} color="#00F5FF" size={160} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#00F5FF', fontVariantNumeric: 'tabular-nums' }}>{overall}%</div>
                <div style={{ fontSize: 9, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>Overall</div>
                <div style={{ fontSize: 9, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily Goal</div>
              </div>
            </div>
            {/* Mini Stats */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'STEPS', val: '7.8k', color: '#00F5FF' },
                { label: 'CAL', val: '312', color: '#00FF88' },
                { label: 'KM', val: '6.1', color: '#7B2FBE' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button style={{ background: '#00F5FF', color: '#0A0A0F', borderRadius: 99, border: 'none', padding: '10px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}>
              <span style={{ fontSize: 16 }}>↻</span> Sync Now
            </button>
          </div>
        </div>

        {/* Progress Bars */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', padding: 16, marginBottom: 12, boxShadow: '0 0 12px rgba(0,255,136,0.06)' }}>
          <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 12 }}>Today's Goals</div>
          <ProgressBar label="Steps" pct={Math.round(steps / stepsGoal * 100)} color="#00F5FF" />
          <ProgressBar label="Calories" pct={Math.round(cal / 500 * 100)} color="#FF9500" />
          <ProgressBar label="Distance" pct={Math.round(km / 8 * 100)} color="#00FF88" />
        </div>

        {/* 7-Day Chart */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', marginBottom: 12, overflow: 'hidden', boxShadow: '0 0 12px rgba(123,47,190,0.08)' }}>
          <div style={{ padding: '14px 16px 8px' }}>
            <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>7-Day Steps</div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <MiniLineChart data={weekSteps} color="#00F5FF" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {days.map((d, i) => <span key={i} style={{ fontSize: 10, color: '#606080', width: 280 / 7, textAlign: 'center' }}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Calories Chart */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #2A2A3D', overflow: 'hidden', boxShadow: '0 0 12px rgba(255,149,0,0.06)' }}>
          <div style={{ padding: '14px 16px 8px' }}>
            <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>7-Day Calories</div>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <MiniLineChart data={weekCal} color="#FF9500" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {days.map((d, i) => <span key={i} style={{ fontSize: 10, color: '#606080', width: 280 / 7, textAlign: 'center' }}>{d}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
