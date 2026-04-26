import React, { useState, useContext } from 'react';
import { ThemeCtx, Ico } from '../App';

const AuthPage = ({ onLoginSuccess, isDark, onToggle }) => {
  const t = useContext(ThemeCtx);
  const [tab, setTab]       = useState('login');
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [farmId, setFarmId] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState('');
  const [showP, setShowP]   = useState(false);

  const isLight = t.name === 'light';

  const inp = { width:'100%', background:t.bgInput, border:`1.5px solid ${t.borderInput}`, borderRadius:6, padding:'11px 14px', color:t.textPrimary, fontSize:14, fontFamily:"'Open Sans',sans-serif", transition:'all 0.2s', boxSizing:'border-box' };
  const lbl = { fontSize:11, color:t.textLabel, fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.6px' };

  const submit = async (isLogin) => {
    setError(''); setLoad(isLogin?'login':'reg');
    const url  = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? {email,password:pass} : {name,email,password:pass,farmerId:farmId};
    try {
      const r = await fetch(`http://localhost:8080${url}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error||'Authentication failed');
      onLoginSuccess(d);
    } catch(e) { setError(e.message); }
    finally { setLoad(''); }
  };

  return (
    <div style={{ minHeight:'100vh', background:isLight?'#ECF5EE':'#0B1610', display:'flex', flexDirection:'column', fontFamily:"'Open Sans',sans-serif", position:'relative', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .a-inp:focus{border-color:${t.accent}!important;box-shadow:0 0 0 3px ${isLight?'rgba(26,94,55,0.12)':'rgba(76,175,80,0.18)'}!important;outline:none}
      `}</style>

      {/* ── Full-page botanical background SVG (light mode) ── */}
      {isLight && (
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute',inset:0 }}>
            <defs>
              <pattern id="auth-tile" x="0" y="0" width="320" height="320" patternUnits="userSpaceOnUse">
                {/* Wheat stalk */}
                <g fill="#2E8B57" opacity="0.08">
                  <rect x="158" y="10" width="4" height="150" rx="2"/>
                  <ellipse cx="160" cy="26" rx="13" ry="20" transform="rotate(-17 160 26)"/>
                  <ellipse cx="160" cy="26" rx="13" ry="20" transform="rotate(17 160 26)"/>
                  <ellipse cx="160" cy="50" rx="10" ry="16" transform="rotate(-17 160 50)"/>
                  <ellipse cx="160" cy="50" rx="10" ry="16" transform="rotate(17 160 50)"/>
                  <ellipse cx="160" cy="70" rx="8"  ry="13" transform="rotate(-17 160 70)"/>
                  <ellipse cx="160" cy="70" rx="8"  ry="13" transform="rotate(17 160 70)"/>
                  <path d="M158 100 C132 84 110 108 124 138 C130 118 144 104 158 107 Z"/>
                  <path d="M162 100 C188 84 210 108 196 138 C190 118 176 104 162 107 Z"/>
                </g>
                {/* 6-petal flower top-right */}
                <g fill="#27AE60" opacity="0.07" transform="translate(254,20)">
                  <circle cx="24" cy="24" r="9"/>
                  <ellipse cx="24" cy="5"  rx="7" ry="14"/>
                  <ellipse cx="24" cy="43" rx="7" ry="14"/>
                  <ellipse cx="5"  cy="24" rx="14" ry="7"/>
                  <ellipse cx="43" cy="24" rx="14" ry="7"/>
                  <ellipse cx="10" cy="10" rx="6" ry="11" transform="rotate(-45 10 10)"/>
                  <ellipse cx="38" cy="10" rx="6" ry="11" transform="rotate(45 38 10)"/>
                  <ellipse cx="10" cy="38" rx="6" ry="11" transform="rotate(45 10 38)"/>
                  <ellipse cx="38" cy="38" rx="6" ry="11" transform="rotate(-45 38 38)"/>
                </g>
                {/* Vine left */}
                <g fill="none" stroke="#2E8B57" strokeWidth="2.5" opacity="0.07">
                  <path d="M40 180 C40 158 62 148 80 160 C98 172 120 162 118 138"/>
                  <path d="M80 160 C66 148 62 160 68 174 Z" fill="#2E8B57"/>
                  <path d="M110 152 C122 144 128 152 124 164 Z" fill="#2E8B57"/>
                </g>
                {/* Rupee */}
                <text x="230" y="305" fontSize="68" fontFamily="'Noto Serif',Georgia,serif"
                  fill="#1A6B3C" opacity="0.055" textAnchor="middle">₹</text>
                {/* Small flower bottom-left */}
                <g fill="#2E8B57" opacity="0.07" transform="translate(22,240)">
                  <circle cx="16" cy="16" r="5"/>
                  <ellipse cx="16" cy="4"  rx="4" ry="9"/>
                  <ellipse cx="16" cy="28" rx="4" ry="9"/>
                  <ellipse cx="4"  cy="16" rx="9" ry="4"/>
                  <ellipse cx="28" cy="16" rx="9" ry="4"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-tile)"/>
          </svg>
        </div>
      )}

      {/* Dark mode glow */}
      {!isLight && (
        <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none' }}>
          <div style={{ position:'absolute',top:'20%',right:'10%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(76,175,80,0.055) 0%,transparent 70%)' }}/>
          <div style={{ position:'absolute',bottom:'15%',left:'5%',width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle,rgba(27,94,32,0.04) 0%,transparent 70%)' }}/>
        </div>
      )}

      {/* Top govt bar */}
      <div style={{ background:t.bgHeaderTop, padding:'5px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:10 }}>
        <span style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>Government of India — Ministry of Agriculture & Farmers Welfare</span>
        <button onClick={onToggle} style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:4,padding:'4px 12px',color:'rgba(255,255,255,0.85)',fontSize:11,fontWeight:600,cursor:'pointer' }}>
          <Ico n={isDark?'sun':'moon'} s={12} c="rgba(255,255,255,0.85)"/>
          {isDark?'Light Mode':'Dark Mode'}
        </button>
      </div>

      {/* Site header */}
      <div style={{ background:t.bgHeaderTop, borderBottom:`3px solid ${t.accentStrip}`, padding:'14px 28px', display:'flex', alignItems:'center', gap:18, position:'relative', zIndex:10 }}>
        {/* Botanical sprig in header bg */}
        <svg style={{ position:'absolute',right:60,top:0,opacity:0.1,pointerEvents:'none' }} width="120" height="56" viewBox="0 0 120 56">
          <g fill="white">
            <rect x="58" y="2" width="4" height="42" rx="2"/>
            <ellipse cx="60" cy="12" rx="10" ry="16" transform="rotate(-14 60 12)"/>
            <ellipse cx="60" cy="12" rx="10" ry="16" transform="rotate(14 60 12)"/>
            <ellipse cx="60" cy="28" rx="8"  ry="12" transform="rotate(-14 60 28)"/>
            <ellipse cx="60" cy="28" rx="8"  ry="12" transform="rotate(14 60 28)"/>
          </g>
        </svg>
        <div style={{ width:52,height:52,borderRadius:10,background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Ico n="leaf" s={28} c="#FFFFFF"/>
        </div>
        <div>
          <div style={{ color:'#FFFFFF',fontFamily:"'Noto Serif',serif",fontWeight:700,fontSize:21,lineHeight:1.2 }}>AI Crop Insurance System</div>
          <div style={{ color:'rgba(255,255,255,0.72)',fontSize:11,marginTop:3,textTransform:'uppercase',letterSpacing:'0.9px',fontWeight:600 }}>Pradhan Mantri Fasal Bima Yojana — Smart Portal</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'36px 16px',position:'relative',zIndex:1 }}>
        <div style={{ width:'100%',maxWidth:468,animation:'fadeUp 0.4s ease' }}>

          {/* Login card — pastel green like PMFBY */}
          <div style={{ background:isLight?'#EFFAF3':'#112018', border:`1.5px solid ${isLight?'#B8DECA':t.borderCard}`, borderRadius:14, overflow:'hidden', boxShadow:isLight?'0 8px 32px rgba(26,94,55,0.14)':t.shadowCard, position:'relative' }}>

            {/* Per-card rupee watermark */}
            {isLight && (
              <div style={{ position:'absolute',right:-10,bottom:-10,opacity:0.04,pointerEvents:'none',zIndex:0 }}>
                <svg width="170" height="170" viewBox="0 0 160 160">
                  <text x="10" y="150" fontSize="160" fontFamily="'Noto Serif',Georgia,serif" fill="#1A6B3C">₹</text>
                </svg>
              </div>
            )}
            {/* Wheat sprig top-right of card */}
            {isLight && (
              <svg style={{ position:'absolute',top:-4,right:55,opacity:0.046,pointerEvents:'none',zIndex:0 }} width="80" height="80" viewBox="0 0 80 80">
                <g fill="#1A6B3C">
                  <rect x="38" y="4" width="4" height="55" rx="2"/>
                  <ellipse cx="40" cy="16" rx="10" ry="16" transform="rotate(-14 40 16)"/>
                  <ellipse cx="40" cy="16" rx="10" ry="16" transform="rotate(14 40 16)"/>
                  <ellipse cx="40" cy="34" rx="8"  ry="12" transform="rotate(-14 40 34)"/>
                  <ellipse cx="40" cy="34" rx="8"  ry="12" transform="rotate(14 40 34)"/>
                  <path d="M38 55 C24 46 16 56 22 68 C26 58 32 54 38 57 Z"/>
                  <path d="M42 55 C56 46 64 56 58 68 C54 58 48 54 42 57 Z"/>
                </g>
              </svg>
            )}

            {/* Card header */}
            <div style={{ background:isLight?`linear-gradient(135deg,#1A5E37,#2E8B57)`:`linear-gradient(135deg,${t.bgHeaderTop},${t.accentMid})`, padding:'14px 24px', display:'flex', alignItems:'center', gap:10, position:'relative', overflow:'hidden', zIndex:1 }}>
              <svg style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',opacity:0.13 }} width="50" height="50" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="white" strokeWidth="2"/>
              </svg>
              <Ico n="shield" s={16} c="#FFFFFF"/>
              <span style={{ color:'#FFFFFF',fontSize:14,fontWeight:700 }}>Farmer Portal Access</span>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex',borderBottom:`1px solid ${isLight?'#C8E5D2':t.border}`,position:'relative',zIndex:1 }}>
              {[['login','Sign In'],['register','New Registration']].map(([v,lb])=>(
                <button key={v} onClick={()=>{setTab(v);setError('');}} style={{ flex:1,padding:'13px',border:'none',fontSize:13,fontWeight:700,background:tab===v?(isLight?'#FFFFFF':t.bgCard):(isLight?'#E8F5EF':t.bgTableHead),color:tab===v?t.accent:t.textMuted,borderBottom:tab===v?`3px solid ${t.accent}`:'3px solid transparent',cursor:'pointer',transition:'all 0.15s' }}>
                  {lb}
                </button>
              ))}
            </div>

            <div style={{ padding:'24px 26px', position:'relative', zIndex:1 }}>
              {error && (
                <div style={{ background:t.dangerBg,border:`1px solid ${t.dangerBdr}`,borderLeft:`4px solid ${t.danger}`,borderRadius:6,padding:'10px 14px',color:t.danger,fontSize:13,marginBottom:18,display:'flex',alignItems:'center',gap:8 }}>
                  <Ico n="alert" s={14} c={t.danger}/> {error}
                </div>
              )}

              {tab==='login' ? (
                <form onSubmit={e=>{e.preventDefault();submit(true);}}>
                  <div style={{ marginBottom:16 }}>
                    <label style={lbl}>Email Address</label>
                    <input className="a-inp" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Registered email address" style={inp}/>
                  </div>
                  <div style={{ marginBottom:22 }}>
                    <label style={lbl}>Password</label>
                    <div style={{ position:'relative' }}>
                      <input className="a-inp" type={showP?'text':'password'} required value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" style={{ ...inp,paddingRight:44 }}/>
                      <button type="button" onClick={()=>setShowP(s=>!s)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:t.textMuted,padding:0,cursor:'pointer' }}>
                        <Ico n={showP?'eyeOff':'eye'} s={15} c={t.textMuted}/>
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={!!loading} style={{ width:'100%',padding:'12px',background:`linear-gradient(135deg,${t.accentMid},${t.accentLight})`,color:'#FFF',border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.65:1,boxShadow:`0 4px 14px ${t.accent}40`,transition:'all 0.2s' }}>
                    {loading==='login'?'Signing in…':'Sign In to Portal'}
                  </button>
                </form>
              ) : (
                <form onSubmit={e=>{e.preventDefault();submit(false);}}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <input className="a-inp" type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="As per Aadhaar" style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>PM-KISAN / Aadhaar ID</label>
                      <input className="a-inp" type="text" value={farmId} onChange={e=>setFarmId(e.target.value)} placeholder="e.g. PM-1234567" style={inp}/>
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={lbl}>Email Address</label>
                    <input className="a-inp" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="farmer@example.com" style={inp}/>
                  </div>
                  <div style={{ marginBottom:22 }}>
                    <label style={lbl}>Create Password</label>
                    <div style={{ position:'relative' }}>
                      <input className="a-inp" type={showP?'text':'password'} required value={pass} onChange={e=>setPass(e.target.value)} placeholder="Minimum 6 characters" style={{ ...inp,paddingRight:44 }}/>
                      <button type="button" onClick={()=>setShowP(s=>!s)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:t.textMuted,padding:0,cursor:'pointer' }}>
                        <Ico n={showP?'eyeOff':'eye'} s={15} c={t.textMuted}/>
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={!!loading} style={{ width:'100%',padding:'12px',background:`linear-gradient(135deg,${t.accentMid},${t.accentLight})`,color:'#FFF',border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.65:1,boxShadow:`0 4px 14px ${t.accent}40`,transition:'all 0.2s' }}>
                    {loading==='reg'?'Creating account…':'Register as Farmer'}
                  </button>
                </form>
              )}

              {/* Feature badges */}
              <div style={{ marginTop:18,padding:'11px 14px',background:isLight?'#E3F5EB':t.bgTableHead,borderRadius:8,border:`1px solid ${isLight?'#B8DECA':t.border}`,display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap' }}>
                {[['shield','PMFBY Enrolled'],['camera','AI Detection'],['wifi','IoT Monitoring']].map(([ico,label])=>(
                  <span key={label} style={{ display:'flex',alignItems:'center',gap:5,color:t.textLabel,fontSize:11,fontWeight:600 }}>
                    <Ico n={ico} s={11} c={t.accent}/> {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center',marginTop:16,color:t.textMuted,fontSize:11 }}>
            Government of India · Ministry of Agriculture & Farmers Welfare · PMFBY © 2025
          </div>
        </div>
      </div>
    </div>
  );
};

// Define eye/eyeOff locally since icons.jsx isn't imported here
const eyePaths = {
  eye:    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
};

export default AuthPage;