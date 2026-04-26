import React, { useState, useRef } from 'react';

// ─── NAME CLEANER ──────────────────────────────────────────────────────────────
// Converts raw AI model labels like "Corn_(maize)__Common_rust_(Puccinia_sorghi)"
// into clean readable names like "Common Rust (Puccinia Sorghi)"
function cleanLabel(raw) {
  if (!raw) return '—';
  return raw
    .replace(/^[^_]*_\([^)]*\)__/, '')   // remove "Corn_(maize)__" prefix
    .replace(/^[^_]*__/, '')              // remove any "Plant__" prefix
    .replace(/_\([^)]*\)$/, '')           // remove trailing "(species)" if unwanted
    .replace(/_/g, ' ')                   // underscores → spaces
    .replace(/\s+/g, ' ')                 // collapse double spaces
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case every word
}

// Converts cause labels like "Corn_(maize)__Common_rust" or "DISEASE" → readable
function cleanCause(raw) {
  if (!raw) return '—';
  // If it's already a clean word like FLOOD, DROUGHT, DISEASE
  const known = { FLOOD:'Flood Damage', DROUGHT:'Drought Stress', DISEASE:'Crop Disease',
                  PEST:'Pest Attack', FIRE:'Fire Damage', UNKNOWN:'Unknown' };
  const upper = raw.toUpperCase().trim();
  if (known[upper]) return known[upper];
  // Otherwise it might be the disease label itself — clean it same way
  return cleanLabel(raw);
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const UploadIcon  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const ScanIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>;
const PdfIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>;
const BugIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 4-4"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4"/><path d="M18 13h4"/><path d="M21 21c0-2.1-1.7-3.9-4-4"/></svg>;
const AlertIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CheckIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ImgIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const ImageUpload = ({ language = 'en', farmerId, onClaimCreated, th = {} }) => {
  const isLight = th.mode === 'light';
  const cardBg   = th.bgCard      || (isLight ? '#ffffff' : '#132815');
  const innerBg  = th.bgCardInner || (isLight ? '#f7f9f4' : '#0b1a09');
  const border   = th.border      || (isLight ? '#c8ddb8' : 'rgba(100,180,70,0.22)');
  const textPri  = th.text        || (isLight ? '#1a2e10' : '#e8f5e0');
  const textSub  = th.textSub     || (isLight ? '#2d5016' : '#a8cc88');
  const textMut  = th.textMuted   || (isLight ? '#5a7a42' : '#5a8042');
  const inputBg  = th.bgInput     || (isLight ? '#f0f5eb' : '#1a3320');
  const shadow   = isLight ? '0 2px 12px rgba(45,125,30,0.08)' : '0 8px 32px rgba(0,0,0,0.3)';
  const accent   = th.accent      || (isLight ? '#2d7d1e' : '#5aab30');
  const accentDk = th.accentDark  || (isLight ? '#1a5e0e' : '#3d8020');

  const [policies, setPolicies]     = useState([]);
  const [policyId, setPolicyId]     = useState('');
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [dragging, setDragging]     = useState(false);
  const fileRef = useRef();

  const T = {
    en: { title:'AI Disease Detection', subtitle:'Upload a crop photo to detect disease and auto-file insurance claim', selectPolicy:'Select Insurance Policy', dropzone:'Drag & drop crop image here, or click to browse', analyze:'Analyze & Process Claim', analyzing:'Analyzing...', result:'Analysis Result', disease:'Disease', confidence:'Confidence', cause:'Cause of Loss', severity:'Severity', amount:'Claim Amount', fraud:'Fraud Score', remedy:'Recommended Remedy', download:'Download PDF Report', remove:'Remove image', noPolicy:'No policies found for this farmer', pending:'PENDING', approved:'APPROVED' },
    ta: { title:'AI நோய் கண்டறிதல்', subtitle:'பயிர் புகைப்படத்தை பதிவேற்றி நோயை கண்டறியவும்', selectPolicy:'காப்பீட்டு திட்டத்தை தேர்ந்தெடுக்கவும்', dropzone:'படத்தை இங்கே இழுக்கவும் அல்லது கிளிக் செய்யவும்', analyze:'பகுப்பாய்வு செய்', analyzing:'பகுப்பாய்வு...', result:'பகுப்பாய்வு முடிவு', disease:'நோய்', confidence:'நம்பிக்கை', cause:'இழப்பு காரணம்', severity:'தீவிரம்', amount:'தொகை', fraud:'மோசடி மதிப்பெண்', remedy:'பரிந்துரைக்கப்பட்ட தீர்வு', download:'PDF அறிக்கை', remove:'படத்தை அகற்று', noPolicy:'கொள்கைகள் இல்லை', pending:'நிலுவை', approved:'அங்கீகரிக்கப்பட்டது' },
    hi: { title:'AI रोग पहचान', subtitle:'फसल की फोटो अपलोड करें', selectPolicy:'बीमा पॉलिसी चुनें', dropzone:'यहाँ छवि खींचें या क्लिक करें', analyze:'विश्लेषण करें', analyzing:'विश्लेषण...', result:'विश्लेषण परिणाम', disease:'रोग', confidence:'विश्वास', cause:'हानि का कारण', severity:'गंभीरता', amount:'दावा राशि', fraud:'धोखाधड़ी स्कोर', download:'PDF रिपोर्ट', remove:'छवि हटाएं', noPolicy:'कोई नीति नहीं', pending:'लंबित', approved:'स्वीकृत' },
  }[language] || {};

  // Fetch policies on mount
  React.useEffect(() => {
    if (!farmerId) return;
    fetch(`http://localhost:8080/api/policies?farmerId=${farmerId}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPolicies(data); if (data.length > 0) setPolicyId(data[0].id); })
      .catch(() => {});
  }, [farmerId]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!image || !policyId) { setError('Please select a policy and upload an image.'); return; }
    setLoading(true); setError(''); setResult(null);
    const fd = new FormData();
    fd.append('image', image);
    fd.append('policyId', policyId);
    fd.append('farmerId', farmerId);
    try {
      const res = await fetch('http://localhost:8080/api/claims/process-with-image', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      onClaimCreated?.();
    } catch (e) {
      setError(`Analysis failed: ${e.message}. Check backend connection.`);
    } finally { setLoading(false); }
  };

  // ── RESULT METRIC BOX ──────────────────────────────────────────────────────
  // Fixed: full width, word-wrap, min-height, no overflow hidden
  const MetricBox = ({ label, value, color, bg }) => (
    <div style={{
      background: bg || (isLight ? '#f7f9f4' : '#0b1a09'),
      border: `1.5px solid ${color || border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: '1 1 160px',      // flex-grow so boxes expand
      minWidth: 0,             // allow shrinking below content size
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        color: textMut,
        fontFamily: "'Noto Sans', sans-serif",
      }}>{label}</span>
      <span style={{
        fontSize: 15,
        fontWeight: 700,
        color: color || textPri,
        fontFamily: "'Noto Sans', sans-serif",
        wordBreak: 'break-word',    // ← break long words
        whiteSpace: 'normal',       // ← allow wrapping
        lineHeight: 1.4,
        overflowWrap: 'anywhere',   // ← wrap at any character if needed
      }}>{value}</span>
    </div>
  );

  const sev = result?.severity || '';
  const sevColor = sev === 'SEVERE' ? (isLight?'#b71c1c':'#ef5350') : sev === 'MODERATE' ? (isLight?'#e65100':'#ffa726') : (isLight?'#1b5e20':'#66bb6a');

  return (
    <div style={{ background: cardBg, borderRadius: 16, padding: '28px 32px', marginBottom: 24, boxShadow: shadow, border: `1.5px solid ${border}` }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${accentDk},${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BugIcon/>
        </div>
        <div>
          <h2 style={{ color: textPri, margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'Noto Sans', sans-serif" }}>{T.title}</h2>
          <p style={{ color: textSub, margin: 0, fontSize: 13, fontFamily: "'Noto Sans', sans-serif" }}>{T.subtitle}</p>
        </div>
      </div>

      {/* Policy selector */}
      <div style={{ marginBottom: 18, marginTop: 22 }}>
        <label style={{ display: 'block', color: textSub, fontSize: 13, fontWeight: 600, marginBottom: 7, fontFamily: "'Noto Sans', sans-serif" }}>{T.selectPolicy}</label>
        {policies.length === 0
          ? <div style={{ color: textMut, fontSize: 13, padding: '10px 14px', background: innerBg, borderRadius: 8, border: `1px dashed ${border}` }}>{T.noPolicy}</div>
          : <select value={policyId} onChange={e => setPolicyId(e.target.value)} style={{ width: '100%', background: inputBg, border: `1.5px solid ${border}`, borderRadius: 9, padding: '10px 14px', color: textPri, fontSize: 14, fontFamily: "'Noto Sans', sans-serif", outline: 'none', cursor: 'pointer' }}>
              {policies.map(p => (
                <option key={p.id} value={p.id}>
                  {p.policyNumber} — {p.cropType} (₹{Number(p.sumInsured).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
        }
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? accent : border}`,
          borderRadius: 12, padding: '32px 20px',
          background: dragging ? (isLight ? '#eef6e8' : 'rgba(90,171,48,0.08)') : innerBg,
          cursor: 'pointer', textAlign: 'center',
          transition: 'all 0.2s', marginBottom: 16,
          display: preview ? 'none' : 'block',
        }}
      >
        <div style={{ color: textMut, marginBottom: 10 }}><UploadIcon/></div>
        <div style={{ color: textSub, fontSize: 14, fontFamily: "'Noto Sans', sans-serif" }}>{T.dropzone}</div>
        <div style={{ color: textMut, fontSize: 12, marginTop: 6 }}>JPG, PNG, WEBP supported</div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])}/>
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <img src={preview} alt="Crop" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: 10, border: `1.5px solid ${border}`,background: innerBg,       // fills empty space with bg color
    padding: '8px', }}/>
          <button onClick={() => { setImage(null); setPreview(null); setResult(null); }} style={{
            position: 'absolute', top: 10, right: 10, background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
            color: isLight ? '#b71c1c' : '#ef9a9a', border: `1px solid ${isLight?'#ef9a9a':'rgba(239,83,80,0.4)'}`,
            borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Noto Sans', sans-serif",
          }}>&times; {T.remove}</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: isLight?'#ffebee':'rgba(183,28,28,0.1)', border: `1.5px solid ${isLight?'#ef9a9a':'rgba(239,83,80,0.4)'}`, borderRadius: 10, padding: '10px 16px', color: isLight?'#b71c1c':'#ef9a9a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontFamily: "'Noto Sans', sans-serif" }}>
          <AlertIcon/> {error}
        </div>
      )}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading || !image || !policyId} style={{
        width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        background: (loading || !image || !policyId) ? (isLight?'#e4eed8':'rgba(90,171,48,0.2)') : `linear-gradient(135deg,${accentDk},${accent})`,
        color: (loading || !image || !policyId) ? textMut : '#ffffff',
        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
        cursor: (loading || !image || !policyId) ? 'not-allowed' : 'pointer',
        fontFamily: "'Noto Sans', sans-serif",
        boxShadow: (loading || !image || !policyId) ? 'none' : `0 4px 14px ${isLight?'rgba(45,125,30,0.3)':'rgba(90,171,48,0.3)'}`,
        transition: 'all 0.2s',
      }}>
        <ScanIcon/>
        {loading ? T.analyzing : T.analyze}
      </button>

      {/* ── RESULT ────────────────────────────────────────────────────────── */}
      {result && (
        <div style={{ marginTop: 22, background: innerBg, border: `1.5px solid ${isLight?'#e8a042':'rgba(255,167,38,0.4)'}`, borderRadius: 14, padding: '20px 22px' }}>

          {/* Result header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <ImgIcon/>
              <span style={{ color: textPri, fontSize: 15, fontWeight: 700, fontFamily: "'Noto Sans', sans-serif" }}>
                {T.result} — Claim #{result.id}
              </span>
            </div>
            <span style={{
              padding: '4px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700,
              fontFamily: "'Noto Sans', sans-serif",
              background: result.status === 'APPROVED'
                ? (isLight?'#e8f5e0':'rgba(102,187,106,0.15)')
                : (isLight?'#fff3e0':'rgba(255,167,38,0.15)'),
              color: result.status === 'APPROVED'
                ? (isLight?'#1b5e20':'#66bb6a')
                : (isLight?'#bf360c':'#ffa726'),
              border: `1px solid ${result.status === 'APPROVED' ? (isLight?'#7aab5c':'rgba(102,187,106,0.4)') : (isLight?'#e8a042':'rgba(255,167,38,0.4)')}`,
            }}>{result.status || T.pending}</span>
          </div>

          {/* ── METRIC BOXES — flex-wrap, full readable text ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}>
            <MetricBox
              label={T.disease}
              value={cleanLabel(result.detectedDisease || result.diseaseDetected)}
              color={isLight ? '#b71c1c' : '#ef9a9a'}
              bg={isLight ? '#ffebee' : 'rgba(183,28,28,0.1)'}
            />
            <MetricBox
              label={T.confidence}
              value={result.confidenceScore != null ? `${(result.confidenceScore * 100).toFixed(1)}%` : '—'}
              color={isLight ? '#1b5e20' : '#66bb6a'}
              bg={isLight ? '#e8f5e0' : 'rgba(46,125,50,0.1)'}
            />
            <MetricBox
              label={T.cause}
              value={cleanCause(result.causeOfLoss)}
              color={isLight ? '#e65100' : '#ffa726'}
              bg={isLight ? '#fff3e0' : 'rgba(230,81,0,0.1)'}
            />
            <MetricBox
              label={T.severity}
              value={sev || '—'}
              color={sevColor}
              bg={isLight ? (sev==='SEVERE'?'#ffebee':sev==='MODERATE'?'#fff3e0':'#e8f5e0') : 'rgba(0,0,0,0.1)'}
            />
            <MetricBox
              label={T.amount}
              value={result.claimAmount != null ? `₹${Number(result.claimAmount).toLocaleString('en-IN')}` : '₹0'}
              color={isLight ? '#4a148c' : '#ce93d8'}
              bg={isLight ? '#f3e5f5' : 'rgba(74,20,140,0.1)'}
            />
            <MetricBox
              label={T.fraud}
              value={result.fraudScore != null ? `${result.fraudScore}/100` : '0/100'}
              color={isLight ? '#0d47a1' : '#64b5f6'}
              bg={isLight ? '#e3f2fd' : 'rgba(13,71,161,0.1)'}
            />
          </div>

          {/* Remedy */}
          {result.recommendedRemedy && (
            <div style={{
              background: isLight ? '#fff8e1' : 'rgba(255,160,0,0.07)',
              border: `1.5px solid ${isLight?'#ffcc80':'rgba(255,160,0,0.3)'}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 14,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <AlertIcon/>
              <div>
                <span style={{ color: isLight?'#e65100':'#ffa726', fontWeight: 700, fontSize: 13.5, fontFamily: "'Noto Sans', sans-serif" }}>
                  Recommended Remedy:&nbsp;
                </span>
                <span style={{ color: textPri, fontSize: 13.5, fontFamily: "'Noto Sans', sans-serif" }}>
                  {result.recommendedRemedy}
                </span>
              </div>
            </div>
          )}

          {/* PDF Download */}
          <button
            onClick={() => window.open(`http://localhost:8080/api/claims/${result.id}/pdf`, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px',
              background: isLight ? '#e3f2fd' : 'rgba(21,101,192,0.2)',
              color: isLight ? '#0d47a1' : '#64b5f6',
              border: `1.5px solid ${isLight?'#90caf9':'rgba(100,181,246,0.4)'}`,
              borderRadius: 9, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Noto Sans', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLight?'#bbdefb':'rgba(21,101,192,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = isLight?'#e3f2fd':'rgba(21,101,192,0.2)'}
          >
            <PdfIcon/> {T.download}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;