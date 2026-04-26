import React, { useContext } from 'react';
import { ThemeCtx } from '../App';

const DashboardCharts = ({ claims=[], language='en' }) => {
  const t = useContext(ThemeCtx);

  const T = {
    en:{ byStatus:'Claims by Status', bySource:'Detection Source', causes:'Top Causes of Loss', payout:'Payout by Status', noData:'Charts will appear once claims are submitted and processed.' },
    ta:{ byStatus:'நிலை வாரியாக', bySource:'கண்டறிதல் மூலம்', causes:'முக்கிய காரணங்கள்', payout:'செலுத்துதல் விவரம்', noData:'கோரிக்கைகள் சமர்ப்பிக்கப்பட்ட பின் தரவு தெரியும்.' },
    hi:{ byStatus:'स्थिति अनुसार', bySource:'स्रोत अनुसार', causes:'मुख्य कारण', payout:'भुगतान विवरण', noData:'दावे सबमिट होने के बाद चार्ट दिखेंगे।' },
  }[language];

  if (!claims.length) return (
    <div style={{ padding:'16px 18px', background:t.bgStrip, border:`1px solid ${t.border}`, borderRadius:5, color:t.textMuted, fontSize:13, textAlign:'center' }}>
      {T.noData}
    </div>
  );

  const isLight = t.name === 'light';

  const STATUS_C = { APPROVED:t.approved, PENDING:t.pending, REJECTED:t.rejected };
  const SRC_C    = { SENSOR:'#1565C0', IMAGE:t.name==='light'?'#6A1B9A':'#CE93D8', AUTO:t.pending, MANUAL:t.approved };

  const statusData = ['APPROVED','PENDING','REJECTED'].map(s=>({name:s,val:claims.filter(c=>c.status===s).length})).filter(d=>d.val>0);
  const srcMap={};claims.forEach(c=>{const k=c.detectionSource||'SENSOR';srcMap[k]=(srcMap[k]||0)+1;});
  const srcData=Object.entries(srcMap).map(([name,val])=>({name,val}));
  const causeMap={};claims.forEach(c=>{const k=(c.causeOfLoss||'UNKNOWN').replace(/_+/g,' ').trim();causeMap[k]=(causeMap[k]||0)+1;});
  const causeData=Object.entries(causeMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,val])=>({name,val}));
  const payoutData=['APPROVED','PENDING','REJECTED'].map(s=>({name:s,val:Math.round(claims.filter(c=>c.status===s).reduce((sm,c)=>sm+(c.claimAmount||0),0))})).filter(d=>d.val>0);

  const DonutChart = ({ data, colorFn }) => {
    const total = data.reduce((s,d)=>s+d.val,0);
    if (!total) return <span style={{ color:t.textMuted, fontSize:13 }}>No data</span>;
    let cum=0;
    const stops=data.map(d=>{const pct=(d.val/total)*100;const c=colorFn(d.name);const f=cum;cum+=pct;return `${c} ${f}% ${cum}%`;}).join(',');
    const bgCenter = t.bgCard;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
        <div style={{ width:100,height:100,borderRadius:'50%',background:`conic-gradient(${stops})`,flexShrink:0,boxShadow:'0 2px 10px rgba(0,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ width:58,height:58,borderRadius:'50%',background:bgCenter,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
            <div style={{ color:t.textHeading,fontSize:20,fontWeight:800,lineHeight:1 }}>{total}</div>
            <div style={{ color:t.textMuted,fontSize:8,textTransform:'uppercase',letterSpacing:1 }}>total</div>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {data.map(d=>{
            const c=colorFn(d.name);
            return (
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:10,height:10,borderRadius:2,background:c,flexShrink:0 }} />
                <span style={{ color:t.textSecondary, fontSize:12 }}>{d.name}</span>
                <span style={{ color:t.textHeading, fontWeight:700, fontSize:13, marginLeft:2 }}>{d.val}</span>
                <span style={{ color:t.textMuted, fontSize:11 }}>({((d.val/total)*100).toFixed(0)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BarChart = ({ data, colorFn, fmt }) => {
    const max=Math.max(...data.map(d=>d.val),1);
    const trackBg = isLight?'#E8EEE9':'rgba(255,255,255,0.06)';
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
        {data.map((d,i)=>{
          const c=colorFn?colorFn(d.name):'#1A5E37';
          return (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ color:t.textSecondary,fontSize:12,maxWidth:190,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{d.name.substring(0,28)}</span>
                <span style={{ color:c,fontSize:12,fontWeight:700,flexShrink:0,marginLeft:8 }}>{fmt?fmt(d.val):d.val}</span>
              </div>
              <div style={{ height:8,background:trackBg,borderRadius:4,overflow:'hidden' }}>
                <div style={{ height:'100%',width:`${(d.val/max)*100}%`,background:c,borderRadius:4,transition:'width 1s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const subBg   = isLight ? '#F7FAF7' : 'rgba(0,0,0,0.15)';
  const subBrd  = t.border;
  const lblClr  = t.textLabel;

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14 }}>
      {[
        { title:T.byStatus, content:<DonutChart data={statusData} colorFn={n=>STATUS_C[n]||t.accent} /> },
        { title:T.bySource, content:<DonutChart data={srcData}    colorFn={n=>SRC_C[n]||t.accent}   /> },
        { title:T.causes,   content:<BarChart   data={causeData}  colorFn={null} /> },
        { title:T.payout,   content:<BarChart   data={payoutData} colorFn={n=>STATUS_C[n]} fmt={v=>`₹${(v/1000).toFixed(1)}k`} /> },
      ].map(({ title, content }) => (
        <div key={title} style={{ background:subBg, border:`1px solid ${subBrd}`, borderRadius:6, padding:'16px 18px' }}>
          <div style={{ fontSize:11, color:lblClr, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${subBrd}` }}>
            {title}
          </div>
          {content}
        </div>
      ))}
    </div>
  );
};

export default DashboardCharts;