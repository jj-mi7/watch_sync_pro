import React, { useState } from 'react';

export function DeviceManager() {
  const [scanning, setScanning] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [serviceUUID, setServiceUUID] = useState('');
  const [charUUID, setCharUUID] = useState('');
  const [selected, setSelected] = useState('ABL-100WE');

  const presets = ['Casio ABL-100WE', 'Casio GBD-200', 'Mi Band 8', 'Galaxy Fit 3', 'Custom BLE'];
  const foundDevices = scanning ? [
    { name: 'ABL-100WE', id: 'AA:BB:CC:DD:EE:FF', rssi: -65 },
    { name: 'Unknown BLE Device', id: 'F0:E1:D2:C3:B4:A5', rssi: -82 },
  ] : [];

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#FFF', padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 28, background: '#00F5FF', borderRadius: 2, boxShadow: '0 0 8px #00F5FF' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Devices</div>
            <div style={{ fontSize: 12, color: '#A0A0C0', marginTop: 2 }}>Manage your smartbands</div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'transparent', border: '1px solid #00F5FF', color: '#00F5FF', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' }}
        >
          + Add
        </button>
      </div>

      <div style={{ padding: '0 12px' }}>
        {/* Active Device */}
        <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #00F5FF', padding: 16, marginBottom: 12, boxShadow: '0 0 20px rgba(0,245,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 12, background: '#1A1A26', border: '1px dashed #3D3D5C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>⌚</span>
              <span style={{ fontSize: 8, color: '#606080', marginTop: 2 }}>Add photo</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Casio ABL-100WE</div>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
              </div>
              <div style={{ fontSize: 12, color: '#A0A0C0', marginTop: 2 }}>Casio · ABL-100WE</div>
              <div style={{ fontSize: 11, color: '#606080', marginTop: 4 }}>Last synced: 2:34 PM</div>
            </div>
            <div style={{ background: '#1A1A26', borderRadius: 6, padding: '4px 8px' }}>
              <span style={{ fontSize: 10, color: '#00FF88', fontWeight: 600 }}>Connected</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <button style={{ background: '#00F5FF', color: '#0A0A0F', borderRadius: 99, border: 'none', padding: '10px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}>
              <span>↻</span> Sync Now
            </button>
          </div>
        </div>

        {/* Add Device Form */}
        {showForm && (
          <div style={{ background: '#16161F', borderRadius: 16, border: '1px solid #00F5FF', padding: 16, marginBottom: 12, boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Add New Device</div>

            {/* Preset chips */}
            <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 8 }}>Watch Preset</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setSelected(p.split(' ').slice(-1)[0])}
                  style={{
                    background: selected === p.split(' ').slice(-1)[0] ? 'rgba(0,245,255,0.1)' : 'transparent',
                    border: `1px solid ${selected === p.split(' ').slice(-1)[0] ? '#00F5FF' : '#2A2A3D'}`,
                    color: selected === p.split(' ').slice(-1)[0] ? '#00F5FF' : '#A0A0C0',
                    borderRadius: 99, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* UUID inputs */}
            <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 6 }}>
              Service UUID <span style={{ color: '#606080', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </div>
            <input
              value={serviceUUID}
              onChange={e => setServiceUUID(e.target.value)}
              placeholder="e.g. 180D or 0000180d-0000-1000-..."
              style={{ width: '100%', background: '#1A1A26', border: '1px solid #2A2A3D', borderRadius: 8, padding: '8px 12px', color: '#FFF', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 6 }}>
              Characteristic UUID <span style={{ color: '#606080', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </div>
            <input
              value={charUUID}
              onChange={e => setCharUUID(e.target.value)}
              placeholder="e.g. 2A37 or 00002a37-0000-1000-..."
              style={{ width: '100%', background: '#1A1A26', border: '1px solid #2A2A3D', borderRadius: 8, padding: '8px 12px', color: '#FFF', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 12 }}
            />

            {/* nRF info box */}
            <div style={{ background: '#0A0A0F', borderRadius: 10, border: '1px solid #2A2A3D', padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#7B2FBE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>How to find UUIDs with nRF Connect</div>
              <div style={{ fontSize: 11, color: '#A0A0C0', lineHeight: 1.7 }}>
                1. Install <span style={{ color: '#00F5FF' }}>nRF Connect</span> (iOS/Android)<br/>
                2. Scan → tap your Casio ABL-100WE<br/>
                3. Open <strong>Services</strong> tab<br/>
                4. Copy the Service UUID (e.g. <span style={{ fontFamily: 'monospace', color: '#00FF88' }}>180D</span>)<br/>
                5. Tap service → copy Characteristic UUID
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #2A2A3D', color: '#606080', borderRadius: 8, padding: '10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => { setScanning(!scanning); }}
                style={{ flex: 1, background: 'transparent', border: '1px solid #00F5FF', color: '#00F5FF', borderRadius: 8, padding: '10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                {scanning ? '⏹ Stop' : '🔍 BLE Scan'}
              </button>
              <button style={{ flex: 1, background: '#00F5FF', color: '#0A0A0F', borderRadius: 8, padding: '10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none' }}>+ Manual</button>
            </div>

            {/* Scan results */}
            {scanning && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: '#A0A0C0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: 8 }}>Scanning... <span style={{ color: '#00F5FF' }}>●</span></div>
                {foundDevices.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2A2A3D' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#FFF', fontWeight: 500 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: '#606080', marginTop: 2 }}>{d.id} · {d.rssi} dBm</div>
                    </div>
                    <span style={{ fontSize: 11, color: '#00F5FF', fontWeight: 600 }}>Connect →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
