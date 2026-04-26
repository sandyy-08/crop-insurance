import React, { useState, useEffect, useContext } from 'react';
import { ThemeCtx } from '../App';
import { Ico } from '../App';
import { playAlertSound } from './AlertSystem';

const FIELDS = [
  { key:'temperature',  label:'Temperature',   unit:'°C', icon:'temp',    type:'temp'    },
  { key:'humidity',     label:'Humidity',       unit:'%',  icon:'droplet', type:'humidity'},
  { key:'soilMoisture', label:'Soil Moisture',  unit:'%',  icon:'leaf',    type:'soil'    },
  { key:'waterLevel',   label:'Water Level',    unit:'%',  icon:'waves',   type:'water'   },
  { key:'rainStatus',   label:'Rain Status',    unit:'',   icon:'rain',    type:'rain'    },
  { key:'latitude',     label:'Latitude',       unit:'°',  icon:'map',     type:'loc'     },
  { key:'longitude',    label:'Longitude',      unit:'°',  icon:'map',     type:'loc'     },
];

const getColor = (v, type, t) => {
  if (type==='temp')     return v>38?t.rejected:v>32?t.pending:t.approved;
  if (type==='humidity') return v>90?t.rejected:v>70?t.pending:t.approved;
  if (type==='soil')     return v<20?t.rejected:v<30?t.pending:t.approved;
  if (type==='water')    return v>80?t.rejected:v>60?t.pending:t.approved;
  return t.info||'#1565C0';
};

const getRisk = (data, t) => {
  if (!data) return null;
  if (data.waterLevel>80||data.soilMoisture>85) return { label:'Flood Risk Detected',  color:t.rejected, bg:t.rejectedBg, bdr:t.rejectedBdr, icon:'alert' };
  if (data.temperature>38&&data.soilMoisture<20) return { label:'Drought Risk Detected', color:t.pending,  bg:t.pendingBg,  bdr:t.pendingBdr,  icon:'alert' };
  if (data.humidity>90&&data.temperature>32)     return { label:'High Disease Risk',     color:t.name==='light'?'#6A1B9A':'#CE93D8', bg:t.name==='light'?'#F3E5F5':'rgba(206,147,216,0.12)', bdr:t.name==='light'?'#CE93D8':'rgba(206,147,216,0.4)', icon:'alert' };
  return { label:'All Sensor Readings Normal', color:t.approved, bg:t.approvedBg, bdr:t.approvedBdr, icon:'check' };
};

const isAbnormal = (d) =>
  d.waterLevel > 80 ||
  d.soilMoisture > 85 ||
  (d.temperature > 38 && d.soilMoisture < 20) ||
  (d.humidity > 90 && d.temperature > 32);

// ── SensorForm receives farmerId prop from App.jsx ────────────────────────
const SensorForm = ({ sensorData, isLive, onManualSubmit, language='en', farmerId }) => {
  const t = useContext(ThemeCtx);
  const [mode, setMode]          = useState('auto');
  const [manual, setManual]      = useState({ temperature:'',humidity:'',soilMoisture:'',waterLevel:'',rainStatus:'0',latitude:'',longitude:'' });
  const [submitting, setSub]     = useState(false);
  const [msg, setMsg]            = useState('');
  const [gpsLoading, setGpsLoad] = useState(false);
  const [gpsStatus, setGpsSt]   = useState('');
  const [lastUpdated, setLastUp] = useState(null);

  const T = {
    en: { auto:'Live Feed (ESP32)', manual:'Manual Entry', noData:'Waiting for ESP32 data feed…', submit:'Submit Reading', submitting:'Submitting…', gps:'Auto-detect GPS', detecting:'Detecting…', live:'LIVE', offline:'OFFLINE', lastUp:'Last updated' },
    ta: { auto:'தானியங்கி', manual:'கைமுறை', noData:'ESP32 தரவுக்காக காத்திருக்கிறது…', submit:'அனுப்பு', submitting:'அனுப்புகிறது…', gps:'GPS கண்டறி', detecting:'கண்டறிகிறது…', live:'நேரலை', offline:'ஆஃப்லைன்', lastUp:'கடைசி' },
    hi: { auto:'लाइव फीड', manual:'मैन्युअल', noData:'ESP32 डेटा का इंतजार…', submit:'सबमिट करें', submitting:'सबमिट…', gps:'GPS पहचानें', detecting:'पहचान रहा है…', live:'लाइव', offline:'ऑफलाइन', lastUp:'अंतिम' },
  }[language];

  const risk    = getRisk(sensorData, t);
  const isLight = t.name === 'light';

  useEffect(() => { if (sensorData) setLastUp(new Date()); }, [sensorData]);
  useEffect(() => { if (mode==='manual' && !manual.latitude) fetchGPS(); }, [mode]);

  const fetchGPS = () => {
    if (!navigator.geolocation) { setGpsSt('GPS not supported'); return; }
    setGpsLoad(true); setGpsSt(T.detecting);
    navigator.geolocation.getCurrentPosition(
      p => { setManual(m => ({ ...m, latitude:p.coords.latitude.toFixed(6), longitude:p.coords.longitude.toFixed(6) })); setGpsLoad(false); setGpsSt('Location detected'); },
      () => { setGpsLoad(false); setGpsSt('GPS unavailable'); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSub(true); setMsg('');

    const payload = {
      temperature:  parseFloat(manual.temperature)  || 0,
      humidity:     parseFloat(manual.humidity)     || 0,
      soilMoisture: parseFloat(manual.soilMoisture) || 0,
      waterLevel:   parseFloat(manual.waterLevel)   || 0,
      rainStatus:   parseInt(manual.rainStatus)     || 0,
      latitude:     parseFloat(manual.latitude)     || 0,
      longitude:    parseFloat(manual.longitude)    || 0,
      farmerId:     farmerId || null,   // ← CRITICAL: send farmerId so backend captures IP Webcam photo
    };

    try {
      const r = await fetch('http://localhost:8080/api/iot/sensor', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();

      setMsg('Reading submitted successfully');
      window.dispatchEvent(new CustomEvent('sensorAlert', { detail: payload }));

      if (isAbnormal(payload)) {
        playAlertSound();
      }

      onManualSubmit?.();
      setTimeout(() => setMsg(''), 4000);
    } catch {
      setMsg('Submission failed — check backend connection');
    } finally {
      setSub(false);
    }
  };

  const inp = { width:'100%', background:t.bgInput, border:`1.5px solid ${t.borderInput}`, borderRadius:5, padding:'9px 12px', color:t.textPrimary, fontSize:14, fontFamily:"'Open Sans',sans-serif", outline:'none', transition:'border 0.2s' };
  const lbl = { fontSize:11, color:t.textLabel, fontWeight:700, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div>
      {/* Live status + mode toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:isLive?t.approvedBg:t.rejectedBg, border:`1px solid ${isLive?t.approvedBdr:t.rejectedBdr}`, borderRadius:4, fontSize:11, fontWeight:700, color:isLive?t.approved:t.rejected }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:isLive?t.approved:t.rejected,animation:'pulse 2s infinite',display:'inline-block' }} />
            {isLive ? T.live : T.offline}
          </span>
          {lastUpdated && <span style={{ color:t.textMuted, fontSize:11 }}>{T.lastUp}: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
        <div style={{ display:'flex', border:`1px solid ${t.border}`, borderRadius:5, overflow:'hidden' }}>
          {[['auto',T.auto],['manual',T.manual]].map(([m,lbl2]) => (
            <button key={m} onClick={() => setMode(m)} style={{ padding:'6px 14px', border:'none', borderRight:m==='auto'?`1px solid ${t.border}`:'none', fontSize:12, fontWeight:700, background:mode===m?t.accent:(isLight?'#FAFCFA':t.bgCard), color:mode===m?'#FFF':t.textMuted, transition:'all 0.15s', cursor:'pointer' }}>
              {lbl2}
            </button>
          ))}
        </div>
      </div>

      {/* Risk alert banner */}
      {risk && mode==='auto' && sensorData && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:risk.bg, border:`1px solid ${risk.bdr}`, borderLeft:`4px solid ${risk.color}`, borderRadius:5, marginBottom:14 }}>
          <Ico n={risk.icon} s={15} c={risk.color} />
          <span style={{ color:risk.color, fontSize:13, fontWeight:700 }}>{risk.label}</span>
        </div>
      )}

      {/* AUTO MODE */}
      {mode==='auto' && (
        !sensorData ? (
          <div style={{ textAlign:'center', padding:'28px', background:isLight?'#F5F8F5':'rgba(0,0,0,0.1)', border:`1px solid ${t.border}`, borderRadius:5, color:t.textMuted, fontSize:13 }}>
            {T.noData}
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:12 }}>
              {FIELDS.filter(f => f.type !== 'loc').map(f => {
                const val   = sensorData[f.key];
                const color = (val != null) ? getColor(Number(val), f.type, t) : t.textMuted;
                const bgBox = isLight ? `${color}12` : `${color}15`;
                return (
                  <div key={f.key} style={{ background:bgBox, border:`1px solid ${color}35`, borderLeft:`3px solid ${color}`, borderRadius:5, padding:'12px 14px' }}>
                    <div style={{ fontSize:10, color:t.textLabel, fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
                    <div style={{ fontSize:24, fontWeight:800, color:color, lineHeight:1 }}>
                      {val != null ? (f.type==='rain' ? (val ? 'Rain' : 'Clear') : `${Number(val).toFixed(1)}${f.unit}`) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
            {(sensorData.latitude || sensorData.longitude) && (
              <div style={{ background:isLight?'#E3F0FF':'rgba(21,101,192,0.1)', border:`1px solid ${t.infoBdr||'#90B8E8'}`, borderLeft:`3px solid ${t.info||'#1565C0'}`, borderRadius:5, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <span style={{ color:t.textSecondary, fontSize:12, fontWeight:600 }}>GPS: {sensorData.latitude?.toFixed(4)}°N, {sensorData.longitude?.toFixed(4)}°E</span>
                <a href={`https://maps.google.com?q=${sensorData.latitude},${sensorData.longitude}`} target="_blank" rel="noreferrer" style={{ color:t.info||'#1565C0', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                  View on Map
                </a>
              </div>
            )}
          </>
        )
      )}

      {/* MANUAL MODE */}
      {mode==='manual' && (
        <form onSubmit={handleSubmit}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', background:isLight?'#E3F0FF':'rgba(21,101,192,0.08)', border:`1px solid ${t.infoBdr||'#90B8E8'}`, borderRadius:5, marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <span style={{ color:t.info||'#1565C0', fontSize:12, fontWeight:600 }}>
              {gpsStatus || 'GPS will auto-detect your field location'}
            </span>
            <button type="button" onClick={fetchGPS} disabled={gpsLoading} style={{ padding:'5px 12px', background:'transparent', border:`1px solid ${t.infoBdr||'#90B8E8'}`, borderRadius:4, color:t.info||'#1565C0', fontSize:11, fontWeight:700, cursor:'pointer' }}>
              {gpsLoading ? T.detecting : T.gps}
            </button>
          </div>

          {/* Show farmerId being used */}
          {farmerId && (
            <div style={{ padding:'7px 12px', background:t.approvedBg, border:`1px solid ${t.approvedBdr}`, borderRadius:4, marginBottom:14, fontSize:11, color:t.approved, fontWeight:600 }}>
              ✓ Farmer ID #{farmerId} — IP Webcam photo will be captured automatically on abnormal readings
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:14, marginBottom:14 }}>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label style={lbl}>{f.label}{f.unit && ` (${f.unit})`}</label>
                {f.key==='rainStatus' ? (
                  <select value={manual.rainStatus} onChange={e => setManual(m => ({ ...m, rainStatus:e.target.value }))} style={{ ...inp, cursor:'pointer' }}>
                    <option value="0">No Rain</option>
                    <option value="1">Raining</option>
                  </select>
                ) : (
                  <input
                    type="number" step="any" value={manual[f.key]}
                    onChange={e => setManual(m => ({ ...m, [f.key]:e.target.value }))}
                    placeholder="Enter value" style={inp}
                    onFocus={e  => e.target.style.borderColor = t.accent}
                    onBlur={e   => e.target.style.borderColor = t.borderInput}
                  />
                )}
              </div>
            ))}
          </div>

          {msg && (
            <div style={{ padding:'10px 14px', background:msg.includes('fail')?t.rejectedBg:t.approvedBg, border:`1px solid ${msg.includes('fail')?t.rejectedBdr:t.approvedBdr}`, borderLeft:`4px solid ${msg.includes('fail')?t.rejected:t.approved}`, borderRadius:5, color:msg.includes('fail')?t.rejected:t.approved, fontSize:13, marginBottom:12 }}>
              {msg}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:t.accent, color:'#FFF', border:'none', borderRadius:5, fontSize:14, fontWeight:700, cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.65:1 }}>
            {submitting ? T.submitting : T.submit}
          </button>
        </form>
      )}
    </div>
  );
};

export default SensorForm;