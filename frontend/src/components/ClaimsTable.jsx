import React, { useState, useContext } from 'react';
import { ThemeCtx } from '../App';
import Ico from './icons';

const ClaimsTable = ({ claims=[], loading=false, language='en' }) => {
  const t = useContext(ThemeCtx);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const T = {
    en:{ id:'Claim ID', disease:'Disease Detected', conf:'Confidence', remedy:'Recommended Remedy', status:'Status', amount:'Claim Amount', pdf:'Report', noData:'No claims found matching your filters.', loading:'Loading claim records…', all:'All', search:'Search claims…' },
    ta:{ id:'ID', disease:'நோய்', conf:'நம்பிக்கை', remedy:'தீர்வு', status:'நிலை', amount:'தொகை', pdf:'அறிக்கை', noData:'கோரிக்கைகள் இல்லை.', loading:'ஏற்றுகிறது…', all:'அனைத்தும்', search:'தேடுக…' },
    hi:{ id:'ID', disease:'रोग', conf:'विश्वास', remedy:'उपाय', status:'स्थिति', amount:'राशि', pdf:'रिपोर्ट', noData:'कोई दावा नहीं मिला।', loading:'लोड हो रहा है…', all:'सभी', search:'दावे खोजें…' },
  }[language];

  const isLight = t.name === 'light';

  const STATUS = {
    APPROVED:{ bg:t.approvedBg, color:t.approved, border:t.approvedBdr },
    PENDING: { bg:t.pendingBg,  color:t.pending,  border:t.pendingBdr  },
    REJECTED:{ bg:t.rejectedBg, color:t.rejected, border:t.rejectedBdr },
  };

  const filtered = claims
    .filter(c=>filter==='ALL'||c.status===filter)
    .filter(c=>{
      if(!search) return true;
      const s=search.toLowerCase();
      return String(c.id).includes(s)||(c.detectedDisease||c.diseaseDetected||'').toLowerCase().includes(s)||(c.status||'').toLowerCase().includes(s)||(c.causeOfLoss||'').toLowerCase().includes(s);
    });

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:t.textLabel, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:t.bgTableHead, borderBottom:`2px solid ${t.border}`, whiteSpace:'nowrap' };
  const tdStyle = { padding:'11px 14px', fontSize:13, color:t.textPrimary, borderBottom:`1px solid ${t.border}`, verticalAlign:'middle' };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <Ico n="search" s={14} c={t.textMuted} st={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search}
            style={{ width:'100%', padding:'8px 10px 8px 32px', background:t.bgInput, border:`1.5px solid ${t.borderInput}`, borderRadius:5, color:t.textPrimary, fontSize:13, fontFamily:"'Open Sans',sans-serif", outline:'none', transition:'border 0.2s' }}
            onFocus={e=>e.target.style.borderColor=t.accent}
            onBlur={e=>e.target.style.borderColor=t.borderInput}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', border:`1px solid ${t.border}`, borderRadius:5, overflow:'hidden' }}>
          {['ALL','APPROVED','PENDING','REJECTED'].map(f=>{
            const st=STATUS[f]||{bg:t.bgBadge,color:t.accent,border:t.border};
            const active=filter===f;
            return (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:'7px 13px', border:'none', fontSize:12, fontWeight:700,
                borderRight: f!=='REJECTED'?`1px solid ${t.border}`:'none',
                background: active?(f==='ALL'?t.accent:st.bg):(isLight?'#FAFCFA':t.bgCard),
                color: active?(f==='ALL'?'#FFF':st.color):t.textMuted,
                transition:'all 0.15s', cursor:'pointer',
              }}>
                {f==='ALL'?T.all:f.charAt(0)+f.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'32px', color:t.textMuted, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <Ico n="clock" s={16} c={t.textMuted} /> {T.loading}
        </div>
      )}

      {!loading && (
        <div style={{ overflowX:'auto', border:`1px solid ${t.border}`, borderRadius:6 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                <th style={thStyle}>{T.id}</th>
                <th style={thStyle}>{T.disease}</th>
                <th style={thStyle}>{T.conf}</th>
                <th style={{ ...thStyle, maxWidth:220 }}>{T.remedy}</th>
                <th style={thStyle}>{T.status}</th>
                <th style={thStyle}>{T.amount}</th>
                <th style={thStyle}>{T.pdf}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign:'center', padding:'32px', color:t.textMuted }}>
                    <Ico n="list" s={18} c={t.textMuted} st={{marginBottom:8,display:'block',margin:'0 auto 8px'}} />
                    {T.noData}
                  </td>
                </tr>
              ) : filtered.map((c,i)=>{
                const st=STATUS[c.status]||STATUS.PENDING;
                const rowBg=i%2===0?t.bgTable:t.bgTableRow;
                return (
                  <tr key={c.id} style={{ background:rowBg, transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=t.bgTableHover}
                    onMouseLeave={e=>e.currentTarget.style.background=rowBg}
                  >
                    <td style={tdStyle}><span style={{ color:t.info||'#1565C0', fontWeight:700, fontSize:12, background:t.infoBg||'#E3F0FF', padding:'2px 7px', borderRadius:3 }}>#{c.id}</span></td>
                    <td style={tdStyle}><span style={{ color:t.textPrimary, fontWeight:600 }}>{c.detectedDisease||c.diseaseDetected||'—'}</span></td>
                    <td style={tdStyle}>
                      {c.confidenceScore!=null ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:50, height:6, background:isLight?'#E0E8E2':'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${(c.confidenceScore*100)}%`, background: c.confidenceScore>=0.85?t.approved:c.confidenceScore>=0.6?t.pending:t.rejected, borderRadius:3 }} />
                          </div>
                          <span style={{ color:t.textPrimary, fontSize:12, fontWeight:600 }}>{(c.confidenceScore*100).toFixed(0)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ ...tdStyle, maxWidth:220 }}><span style={{ color:t.textSecondary, fontSize:12, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{c.recommendedRemedy||'—'}</span></td>
                    <td style={tdStyle}>
                      <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:4, padding:'3px 10px', fontSize:11, fontWeight:700, letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{c.status||'—'}</span>
                    </td>
                    <td style={tdStyle}><span style={{ color:t.name==='light'?'#6A1B9A':'#CE93D8', fontWeight:700 }}>{c.claimAmount!=null?`₹${Number(c.claimAmount).toLocaleString('en-IN')}`:'—'}</span></td>
                    <td style={tdStyle}>
                      {c.id && (
                        <button onClick={()=>window.open(`http://localhost:8080/api/claims/${c.id}/pdf`,'_blank')}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', background:t.infoBg||'#E3F0FF', color:t.info||'#1565C0', border:`1px solid ${t.infoBdr||'#90B8E8'}`, borderRadius:4, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background=t.name==='light'?'#CCE0F5':'rgba(21,101,192,0.25)'}
                          onMouseLeave={e=>e.currentTarget.style.background=t.infoBg||'#E3F0FF'}
                        >
                          <Ico n="download" s={12} c={t.info||'#1565C0'} />
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!loading && claims.length>0 && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${t.border}`, display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ color:t.textMuted, fontSize:12 }}>
            Showing <strong style={{ color:t.textSecondary }}>{filtered.length}</strong> of <strong style={{ color:t.textSecondary }}>{claims.length}</strong> records
          </span>
          <span style={{ color:t.textMuted, fontSize:12, marginLeft:'auto' }}>
            Total payout: <strong style={{ color:t.name==='light'?'#6A1B9A':'#CE93D8' }}>₹{claims.reduce((s,c)=>s+(c.claimAmount||0),0).toLocaleString('en-IN')}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default ClaimsTable;