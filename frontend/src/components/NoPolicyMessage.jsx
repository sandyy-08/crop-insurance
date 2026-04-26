import React, { useContext } from 'react';
import { ThemeCtx } from '../App';
import Ico from './icons';

const NoPolicyMessage = ({ farmer, language='en' }) => {
  const t = useContext(ThemeCtx);
  const T = {
    en:{ title:'No Insurance Policy Linked', desc:'Your farmer account is not yet linked to an insurance policy. Follow the steps below to get enrolled under PMFBY.', steps:['Contact your nearest Common Service Centre (CSC) or Agriculture Department office','Carry your Aadhaar card and land records (Khasra/Khatauni)','Register under Pradhan Mantri Fasal Bima Yojana','Your policy will be linked to this account within 24–48 hours'], id:'Your Farmer ID', note:'Provide this ID to the enrollment officer to link your policy.', helpline:'PMFBY Helpline', num:'1800-180-1551', pmk:'PM-KISAN Helpline', pmkNum:'155261' },
    ta:{ title:'காப்பீட்டு கொள்கை இணைக்கப்படவில்லை', desc:'உங்கள் கணக்கு இன்னும் காப்பீட்டு கொள்கையுடன் இணைக்கப்படவில்லை.', steps:['அருகில் உள்ள CSC அல்லது வேளாண் அலுவலகத்தை அணுகுங்கள்','ஆதார் மற்றும் நில ஆவணங்கள் கொண்டு செல்லுங்கள்','PMFBY கீழ் பதிவு செய்யுங்கள்','24–48 மணி நேரத்தில் கொள்கை இணைக்கப்படும்'], id:'விவசாயி ID', note:'கொள்கை இணைக்க இந்த ID ஐ அலுவலரிடம் தரவும்.', helpline:'PMFBY உதவி', num:'1800-180-1551', pmk:'PM-KISAN', pmkNum:'155261' },
    hi:{ title:'कोई बीमा पॉलिसी नहीं', desc:'आपका खाता अभी बीमा पॉलिसी से जुड़ा नहीं है। PMFBY में नामांकन के लिए नीचे दिए चरण अपनाएं।', steps:['निकटतम CSC या कृषि विभाग कार्यालय से संपर्क करें','आधार कार्ड और भूमि अभिलेख (खसरा/खतौनी) लाएं','प्रधानमंत्री फसल बीमा योजना में पंजीकरण करें','24–48 घंटे में पॉलिसी खाते से जुड़ जाएगी'], id:'किसान ID', note:'पॉलिसी जोड़ने के लिए यह ID अधिकारी को दें।', helpline:'PMFBY हेल्पलाइन', num:'1800-180-1551', pmk:'PM-KISAN', pmkNum:'155261' },
  }[language];

  const isLight = t.name === 'light';

  return (
    <div style={{ border:`1px solid ${t.infoBdr||'#90B8E8'}`, borderTop:`4px solid ${t.info||'#1565C0'}`, borderRadius:6, overflow:'hidden', marginBottom:20, background:t.bgCard, boxShadow:t.shadow }}>
      {/* Header */}
      <div style={{ padding:'12px 18px', background:t.infoBg||'#E3F0FF', borderBottom:`1px solid ${t.infoBdr||'#90B8E8'}`, display:'flex', alignItems:'center', gap:10 }}>
        <Ico n="info" s={16} c={t.info||'#1565C0'} />
        <span style={{ color:t.info||'#1565C0', fontSize:14, fontWeight:700 }}>{T.title}</span>
      </div>

      <div style={{ padding:'18px 20px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, flexWrap:'wrap' }}>
        {/* Left: desc + steps */}
        <div style={{ minWidth:0 }}>
          <p style={{ color:t.textSecondary, fontSize:13, lineHeight:1.7, marginBottom:14 }}>{T.desc}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {T.steps.map((step,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:t.accent, color:'#FFF', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</div>
                <span style={{ color:t.textSecondary, fontSize:13, lineHeight:1.6 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: farmer ID + helplines */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, minWidth:180 }}>
          <div style={{ background:isLight?'#F0F5F1':'rgba(0,0,0,0.15)', border:`1px solid ${t.border}`, borderRadius:6, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:11, color:t.textLabel, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>{T.id}</div>
            <div style={{ fontSize:28, fontWeight:800, color:t.accent, fontFamily:"'Open Sans',sans-serif", lineHeight:1 }}>#{farmer?.id}</div>
            <div style={{ fontSize:13, color:t.textSecondary, marginTop:4, fontWeight:600 }}>{farmer?.name}</div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:8, lineHeight:1.5 }}>{T.note}</div>
          </div>

          {/* Helplines */}
          {[[T.helpline,T.num,'phone'],[T.pmk,T.pmkNum,'info']].map(([lbl2,num,ico])=>(
            <div key={lbl2} style={{ background:t.approvedBg, border:`1px solid ${t.approvedBdr}`, borderRadius:5, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:t.textLabel, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{lbl2}</div>
              <div style={{ fontSize:16, fontWeight:800, color:t.approved, display:'flex', alignItems:'center', gap:6 }}>
                <Ico n="shield" s={13} c={t.approved} />
                {num}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoPolicyMessage;