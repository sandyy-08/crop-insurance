import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ThemeCtx } from '../App';
import Ico from './icons';
import alertMp3 from '../assets/alert.mp3';   // ← your MP3 file

const THRESHOLDS = {
  flood:   d => d.waterLevel>80||d.soilMoisture>85,
  drought: d => d.temperature>38&&d.soilMoisture<20,
  disease: d => d.humidity>90&&d.temperature>32,
};

const DEMO = {
  flood:   { temperature:28,humidity:88,soilMoisture:90,waterLevel:85,rainStatus:1,latitude:11.586,longitude:75.558 },
  drought: { temperature:41,humidity:35,soilMoisture:12,waterLevel:10,rainStatus:0,latitude:11.586,longitude:75.558 },
  disease: { temperature:34,humidity:93,soilMoisture:50,waterLevel:40,rainStatus:1,latitude:11.586,longitude:75.558 },
};

// ─── MP3 Audio singleton — one instance shared across entire app ──────────
let _audio = null;

const getAudio = () => {
  if (!_audio) {
    _audio = new Audio(alertMp3);
    _audio.volume = 0.85;
  }
  return _audio;
};

// Exported — SensorForm.jsx and App.jsx import and call these
export const playAlertSound = () => {
  try {
    const a = getAudio();
    a.currentTime = 0;
    a.play().catch(() => {
      // Browser autoplay blocked — will work after first user click on page
    });
  } catch {}
};

export const stopAlertSound = () => {
  try {
    if (_audio) {
      _audio.pause();
      _audio.currentTime = 0;
    }
  } catch {}
};

// ─── Component ────────────────────────────────────────────────────────────
const AlertSystem = ({ language='en' }) => {
  const t = useContext(ThemeCtx);
  const [active, setActive] = useState([]);
  const [banner, setBanner] = useState(null);
  const [demo,   setDemo]   = useState(false);
  const prev = useRef({ flood:false, drought:false, disease:false });

  const isLight = t.name === 'light';

  // ── Unlock MP3 autoplay on very first user click anywhere on page ─────
  // Browsers block audio until user interacts — this silently unlocks it
  useEffect(() => {
    const unlock = () => {
      const a = getAudio();
      a.volume = 0;
      a.play()
        .then(() => { a.pause(); a.currentTime = 0; a.volume = 0.85; })
        .catch(() => {});
    };
    document.addEventListener('click', unlock, { once: true });
    return () => document.removeEventListener('click', unlock);
  }, []);

  const ALERTS = {
    flood:   { label:'Flood Risk Detected',   color:t.rejected,  bg:isLight?'#FFF5F5':'rgba(183,28,28,0.12)', bdr:t.rejectedBdr, icon:'alert' },
    drought: { label:'Drought Risk Detected', color:t.pending,   bg:isLight?'#FFF8F0':'rgba(230,81,0,0.12)',  bdr:t.pendingBdr,  icon:'alert' },
    disease: { label:'High Disease Risk',     color:isLight?'#6A1B9A':'#CE93D8', bg:isLight?'#F5F0FF':'rgba(106,27,154,0.12)', bdr:isLight?'#CE93D8':'rgba(206,147,216,0.4)', icon:'alert' },
  };

  const MSG = {
    en: { flood:'Water level critically high. Automatic flood claim may be triggered.', drought:'Extreme temperature with very low soil moisture — drought conditions.', disease:'High humidity with elevated temperature — fungal disease outbreak likely.' },
    ta: { flood:'நீர் மட்டம் மிக அதிகமாக உள்ளது.', drought:'வெப்பநிலை அதிகம், மண் ஈரப்பதம் குறைவு.', disease:'அதிக ஈரப்பதம் — பூஞ்சை தாக்குதல் வாய்ப்பு.' },
    hi: { flood:'जल स्तर गंभीर रूप से उच्च।', drought:'तापमान अत्यधिक, नमी कम — सूखे की स्थिति।', disease:'उच्च आर्द्रता — फंगल प्रकोप संभव।' },
  }[language];

  // ── Main trigger — called when sensorAlert CustomEvent fires ─────────
  const trigger = useCallback((data, force=false) => {
    const toAdd = [];
    Object.entries(THRESHOLDS).forEach(([type, fn]) => {
      const hit = fn(data);
      if (hit && (force || !prev.current[type])) toAdd.push(type);
      if (!force) prev.current[type] = hit;
    });
    if (toAdd.length > 0) {
      playAlertSound();                          // ← YOUR MP3 PLAYS HERE
      setBanner(toAdd[0]);
      setActive(toAdd);
      setTimeout(() => {
        setActive([]);
        stopAlertSound();                        // ← auto-stop after 8s
      }, 8000);
    }
  }, []);

  // ── Listen for sensorAlert events dispatched by SensorForm + App ─────
  useEffect(() => {
    const h = (e) => trigger(e.detail, true);
    window.addEventListener('sensorAlert', h);
    return () => window.removeEventListener('sensorAlert', h);
  }, [trigger]);

  const handleDemo = (type) => {
    prev.current = { flood:false, drought:false, disease:false };
    const p = DEMO[type];
    window.dispatchEvent(new CustomEvent('sensorAlert', { detail: p }));
    fetch('http://localhost:8080/api/iot/sensor', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(p),
    }).catch(() => {});
    setDemo(false);
  };

  const dismissBanner = () => {
    setBanner(null);
    stopAlertSound();                            // ← stop sound on dismiss
  };

  const dismissToast = (type) => {
    setActive(x => {
      const remaining = x.filter(v => v !== type);
      if (remaining.length === 0) stopAlertSound(); // stop when all toasts gone
      return remaining;
    });
  };

  return (
    <>
      {/* ── Top Banner ── */}
      {banner && active.length > 0 && (() => {
        const a = ALERTS[banner];
        return (
          <div style={{ position:'fixed',top:0,left:0,right:0,zIndex:9999,background:a.bg,borderBottom:`3px solid ${a.color}`,padding:'11px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 12px rgba(0,0,0,0.15)',animation:'slideDown 0.3s ease' }}>
            <div style={{ display:'flex',alignItems:'center',gap:14,flexWrap:'wrap' }}>
              <Ico n="alert" s={18} c={a.color} />
              <div>
                <div style={{ color:a.color,fontSize:14,fontWeight:700,letterSpacing:'0.3px' }}>{a.label}</div>
                <div style={{ color:t.textMuted,fontSize:12,marginTop:2 }}>{MSG[banner]}</div>
              </div>
            </div>
            <button onClick={dismissBanner} style={{ background:'none',border:'none',color:t.textMuted,cursor:'pointer',padding:'4px',display:'flex' }}>
              <Ico n="x" s={16} c={t.textMuted} />
            </button>
          </div>
        );
      })()}

      {/* ── Toast stack ── */}
      <div style={{ position:'fixed',bottom:72,right:20,zIndex:9998,display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end' }}>
        {active.map(type => {
          const a = ALERTS[type];
          return (
            <div key={type} style={{ background:t.bgCard,border:`1px solid ${a.bdr}`,borderLeft:`4px solid ${a.color}`,borderRadius:6,padding:'12px 16px',minWidth:270,maxWidth:320,boxShadow:t.shadow,animation:'slideLeft 0.3s ease' }}>
              <div style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                <Ico n="alert" s={15} c={a.color} st={{ flexShrink:0, marginTop:1 }} />
                <div style={{ flex:1 }}>
                  <div style={{ color:a.color,fontSize:13,fontWeight:700,marginBottom:4 }}>{a.label}</div>
                  <div style={{ color:t.textMuted,fontSize:12,lineHeight:1.5 }}>{MSG[type]}</div>
                </div>
                <button onClick={() => dismissToast(type)} style={{ background:'none',border:'none',color:t.textMuted,cursor:'pointer',padding:0,flexShrink:0 }}>
                  <Ico n="x" s={13} c={t.textMuted} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Test Alert button ── */}
      <div style={{ position:'fixed',bottom:20,right:20,zIndex:9997 }}>
        {demo ? (
          <div style={{ background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:6,padding:'12px 14px',boxShadow:t.shadow,minWidth:200 }}>
            <div style={{ color:t.textLabel,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:10 }}>Simulate Alert</div>
            {Object.entries(ALERTS).map(([type, a]) => (
              <button key={type} onClick={() => handleDemo(type)} style={{ display:'flex',alignItems:'center',gap:8,width:'100%',marginBottom:6,padding:'7px 12px',background:a.bg,border:`1px solid ${a.bdr}`,borderRadius:4,color:a.color,fontSize:12,fontWeight:700,cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}>
                <Ico n="alert" s={12} c={a.color} />
                {a.label}
              </button>
            ))}
            <button onClick={() => setDemo(false)} style={{ width:'100%',padding:'6px',background:'transparent',border:`1px solid ${t.border}`,borderRadius:4,color:t.textMuted,fontSize:11,cursor:'pointer',marginTop:4 }}>Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setDemo(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',background:t.bgCard,color:t.textSecondary,border:`1px solid ${t.border}`,borderRadius:5,fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:t.shadow,transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=t.rejected; e.currentTarget.style.color=t.rejected; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=t.border;   e.currentTarget.style.color=t.textSecondary; }}
          >
            <Ico n="alert" s={14} c="currentColor" />
            Test Alert
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideLeft{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </>
  );
};

export default AlertSystem;