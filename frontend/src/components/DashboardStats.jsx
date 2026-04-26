import React, { useContext } from 'react';
import { ThemeCtx, Ico } from '../App';

const DashboardStats = ({ claims=[], loading=false, language='en' }) => {
  const t = useContext(ThemeCtx);
  const isLight = t.name === 'light';

  const total    = claims.length;
  const approved = claims.filter(c=>c.status==='APPROVED').length;
  const pending  = claims.filter(c=>c.status==='PENDING').length;
  const rejected = claims.filter(c=>c.status==='REJECTED').length;
  const amount   = claims.reduce((s,c)=>s+(c.claimAmount||0),0);

  const T = {
    en:{ total:'Total Claims', approved:'Approved', pending:'Pending', rejected:'Rejected', payout:'Total Payout', empty:'No claims yet. Process sensor data or upload a crop image to create your first claim.' },
    ta:{ total:'மொத்த கோரிக்கைகள்', approved:'அங்கீகரிக்கப்பட்டது', pending:'நிலுவையில்', rejected:'நிராகரிக்கப்பட்டது', payout:'மொத்த செலுத்துதல்', empty:'இன்னும் கோரிக்கைகள் இல்லை.' },
    hi:{ total:'कुल दावे', approved:'स्वीकृत', pending:'लंबित', rejected:'अस्वीकृत', payout:'कुल भुगतान', empty:'अभी कोई दावा नहीं।' },
  }[language];

  // PMFBY-style pastel card definitions — light mint, sky blue, soft peach, etc.
  const STATS = [
    {
      label:T.total, value:total, icon:'list',
      // pastel sky-blue
      bg: isLight?'#EDF5FF':'rgba(33,150,243,0.1)',
      border: isLight?'#A8CCF0':t.infoBdr,
      iconBg: isLight?'#DAEEFF':'rgba(33,150,243,0.2)',
      iconC: isLight?'#0D47A1':t.info,
      valC: isLight?'#0D47A1':t.info,
    },
    {
      label:T.approved, value:approved, icon:'check',
      // pastel mint-green
      bg: isLight?'#EDFAF3':'rgba(76,175,80,0.1)',
      border: isLight?'#88CCA2':t.approvedBdr,
      iconBg: isLight?'#D5F5E3':'rgba(76,175,80,0.2)',
      iconC: isLight?'#1B7A3E':t.approved,
      valC: isLight?'#1B7A3E':t.approved,
    },
    {
      label:T.pending, value:pending, icon:'clock',
      // pastel peach / amber
      bg: isLight?'#FFF8EC':'rgba(255,167,38,0.1)',
      border: isLight?'#F5C882':t.pendingBdr,
      iconBg: isLight?'#FEECC8':'rgba(255,167,38,0.2)',
      iconC: isLight?'#BF4600':t.pending,
      valC: isLight?'#BF4600':t.pending,
    },
    {
      label:T.rejected, value:rejected, icon:'x',
      // pastel rose
      bg: isLight?'#FFF0F0':'rgba(239,83,80,0.1)',
      border: isLight?'#EFAAAA':t.rejectedBdr,
      iconBg: isLight?'#FFE0E0':'rgba(239,83,80,0.2)',
      iconC: isLight?'#B71C1C':t.rejected,
      valC: isLight?'#B71C1C':t.rejected,
    },
    {
      label:T.payout, value:`₹${amount.toLocaleString('en-IN')}`, icon:'money',
      // pastel lavender
      bg: isLight?'#F5EFFF':'rgba(156,109,255,0.1)',
      border: isLight?'#C9B2EE':'rgba(156,109,255,0.4)',
      iconBg: isLight?'#E8DCFF':'rgba(156,109,255,0.2)',
      iconC: isLight?'#5E35B1':'#9C6FFF',
      valC: isLight?'#5E35B1':'#9C6FFF',
    },
  ];

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
        {STATS.map((s,i) => (
          <StatCard key={i} s={s} loading={loading} t={t} isLight={isLight}/>
        ))}
      </div>
      {!loading && total===0 && (
        <div style={{ marginTop:14,padding:'12px 16px',background:isLight?'#EDF5FF':t.infoBg,border:`1px solid ${isLight?'#A8CCF0':t.infoBdr}`,borderLeft:`4px solid ${isLight?'#0D47A1':t.info}`,borderRadius:6,display:'flex',alignItems:'flex-start',gap:10 }}>
          <Ico n="info" s={16} c={isLight?'#0D47A1':t.info} st={{flexShrink:0,marginTop:1}}/>
          <span style={{ color:t.textSecondary,fontSize:13,lineHeight:1.6 }}>{T.empty}</span>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ s, loading, t, isLight }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{ flex:'1 1 155px', background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:10, padding:'16px 18px', boxShadow: hov ? `0 8px 24px ${s.border}99` : `0 2px 6px ${s.border}66`, transition:'all 0.3s cubic-bezier(0.34,1.35,0.64,1)', transform:hov?'translateY(-4px) scale(1.03)':'none', willChange:'transform,box-shadow', position:'relative', overflow:'hidden' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    >
      {/* Small wheat sprig watermark in stat card */}
      {isLight && (
        <svg style={{ position:'absolute',right:-6,bottom:-6,opacity:0.06,pointerEvents:'none' }} width="70" height="70" viewBox="0 0 70 70">
          <g fill={s.iconC}>
            <rect x="32" y="2" width="3" height="50" rx="1.5"/>
            <ellipse cx="33.5" cy="12" rx="8" ry="13" transform="rotate(-14 33.5 12)"/>
            <ellipse cx="33.5" cy="12" rx="8" ry="13" transform="rotate(14 33.5 12)"/>
            <ellipse cx="33.5" cy="28" rx="6" ry="10" transform="rotate(-14 33.5 28)"/>
            <ellipse cx="33.5" cy="28" rx="6" ry="10" transform="rotate(14 33.5 28)"/>
          </g>
        </svg>
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:11,color:s.iconC,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',opacity:0.9 }}>{s.label}</span>
        <div style={{ width:34,height:34,borderRadius:8,background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 2px 8px ${s.border}80` }}>
          <Ico n={s.icon} s={17} c={s.iconC}/>
        </div>
      </div>
      <div style={{ fontSize:34,fontWeight:800,color:s.valC,lineHeight:1,fontFamily:"'Open Sans',sans-serif" }}>
        {loading ? <span style={{ color:t.textMuted,fontSize:18,fontWeight:600 }}>–</span> : s.value}
      </div>
    </div>
  );
};

// Add info path to PATHS in App.jsx — define locally here too
const infoPaths = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
const checkPath = '<polyline points="20 6 9 17 4 12"/>';
const moneyPath = '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>';

export default DashboardStats;