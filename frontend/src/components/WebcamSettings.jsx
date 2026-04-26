import React, { useState, useEffect, useContext } from 'react';
import { ThemeCtx } from '../App';

const WebcamSettings = ({ language = 'en' }) => {
  const t = useContext(ThemeCtx);
  const isLight = t.name === 'light';

  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl,   setInputUrl]   = useState('');
  const [status,     setStatus]     = useState('');   // CONNECTED / OFFLINE / ''
  const [message,    setMessage]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [open,       setOpen]       = useState(false);

  // Load current URL from backend on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/webcam/config')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setCurrentUrl(d.url);
          setInputUrl(d.url);
          setStatus(d.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!inputUrl.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const r = await fetch('http://localhost:8080/api/webcam/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const d = await r.json();
      setCurrentUrl(d.url);
      setStatus(d.status);
      setMessage(d.message);
    } catch {
      setMessage('Failed to connect to backend');
      setStatus('OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage('');
    try {
      const r = await fetch('http://localhost:8080/api/webcam/test');
      const d = await r.json();
      setStatus(d.status);
      setMessage(d.message);
    } catch {
      setStatus('OFFLINE');
      setMessage('Could not reach backend');
    } finally {
      setTesting(false);
    }
  };

  const statusColor = status === 'CONNECTED' ? t.approved : status === 'OFFLINE' ? t.rejected : t.textMuted;
  const statusBg    = status === 'CONNECTED' ? t.approvedBg : status === 'OFFLINE' ? t.rejectedBg : 'transparent';
  const statusBdr   = status === 'CONNECTED' ? t.approvedBdr : status === 'OFFLINE' ? t.rejectedBdr : t.border;

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── Collapsed toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: isLight ? '#E8F5ED' : t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Camera icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ color: t.textPrimary, fontSize: 13, fontWeight: 700 }}>IP Webcam Settings</span>
          {/* Live status dot */}
          {status && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px', background: statusBg, border: `1px solid ${statusBdr}`, borderRadius: 12, fontSize: 11, fontWeight: 700, color: statusColor }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }}/>
              {status}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Expanded panel ── */}
      {open && (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px 18px' }}>

          {/* How to find IP instruction */}
          <div style={{ background: isLight ? '#E3F0FF' : 'rgba(100,181,246,0.1)', border: `1px solid ${isLight ? '#90B8E8' : 'rgba(100,181,246,0.3)'}`, borderLeft: `4px solid ${isLight ? '#1565C0' : '#64B5F6'}`, borderRadius: 5, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: t.textSecondary, lineHeight: 1.7 }}>
            <strong style={{ color: isLight ? '#1565C0' : '#64B5F6' }}>How to find your IP Webcam URL:</strong><br/>
            1. Open <strong>IP Webcam</strong> app → tap <strong>"Start server"</strong><br/>
            2. The URL shown on screen (e.g. <code style={{ background: isLight ? '#D0E4F7' : 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 3 }}>http://192.168.43.1:8080</code>) is your URL<br/>
            3. Paste it below and click <strong>Save & Connect</strong><br/>
            4. Click <strong>Test Camera</strong> to verify it works
          </div>

          {/* URL input */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: t.textLabel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              IP Webcam URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="http://192.168.43.1:8080"
                style={{ flex: 1, background: t.bgInput, border: `1.5px solid ${t.borderInput}`, borderRadius: 5, padding: '9px 12px', color: t.textPrimary, fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e  => e.target.style.borderColor = t.borderInput}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={loading}
                style={{ padding: '9px 18px', background: t.accent, color: '#FFF', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, whiteSpace: 'nowrap' }}
              >
                {loading ? 'Saving…' : 'Save & Connect'}
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{ padding: '9px 14px', background: 'transparent', color: t.textSecondary, border: `1px solid ${t.border}`, borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: testing ? 'not-allowed' : 'pointer', opacity: testing ? 0.65 : 1, whiteSpace: 'nowrap' }}
              >
                {testing ? 'Testing…' : 'Test Camera'}
              </button>
            </div>
          </div>

          {/* Current URL display */}
          {currentUrl && (
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10 }}>
              Currently saved: <code style={{ background: isLight ? '#EEF2EE' : 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, color: t.textSecondary }}>{currentUrl}</code>
            </div>
          )}

          {/* Status / message feedback */}
          {message && (
            <div style={{ padding: '9px 14px', background: statusBg, border: `1px solid ${statusBdr}`, borderLeft: `4px solid ${statusColor}`, borderRadius: 5, fontSize: 12, color: statusColor, fontWeight: 600 }}>
              {status === 'CONNECTED' ? '✓ ' : '⚠ '}{message}
            </div>
          )}

          {/* Quick tips */}
          <div style={{ marginTop: 12, fontSize: 11, color: t.textMuted, lineHeight: 1.8 }}>
            <strong>Quick tips:</strong><br/>
            • IP changes every time you restart IP Webcam — just paste the new one here<br/>
            • No backend restart needed — updates instantly<br/>
            • If camera is offline, a placeholder alert image is auto-generated instead
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamSettings;