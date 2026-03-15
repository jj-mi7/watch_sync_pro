import React from 'react';

export function AuthScreen() {
  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px 48px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 48 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 48, background: '#1A1A26',
          border: '2px solid #00F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: '0 0 24px rgba(0,245,255,0.5)',
        }}>
          <span style={{ fontSize: 48 }}>⌚</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>CasioSync</div>
        <div style={{ fontSize: 15, color: '#A0A0C0' }}>Your Casio. Smarter.</div>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        {[
          { icon: '📡', text: 'Bluetooth BLE sync with your watch' },
          { icon: '📊', text: 'Steps, calories & distance tracking' },
          { icon: '🎯', text: 'Daily goal setting & progress rings' },
          { icon: '📈', text: '7-day charts & activity history' },
        ].map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#16161F', borderRadius: 12, border: '1px solid #2A2A3D', padding: '12px 14px' }}>
            <span style={{ fontSize: 22 }}>{f.icon}</span>
            <span style={{ fontSize: 13, color: '#A0A0C0' }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          background: '#FFF', color: '#0A0A0F', borderRadius: 99, border: 'none',
          padding: '14px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          boxShadow: '0 0 12px rgba(255,255,255,0.15)',
        }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#4285F4', fontFamily: 'monospace' }}>G</span>
          Continue with Google
        </button>

        <button style={{
          background: 'transparent', color: '#00F5FF', border: 'none',
          padding: '14px', fontWeight: 500, fontSize: 14, cursor: 'pointer',
          textAlign: 'center',
        }}>
          Continue without account →
        </button>

        <div style={{ fontSize: 11, color: '#606080', textAlign: 'center', lineHeight: 1.6 }}>
          Signing in syncs data across devices.<br />Guest mode stores data locally only.
        </div>
      </div>
    </div>
  );
}
