import React, { useState, useEffect, useContext } from 'react';
import { ThemeCtx } from '../App';
import Ico from './icons';

const API_KEY = '5388f7122381012211c8bedd7afd82de';

const WeatherWidget = ({ sensorData, language='en', farmer }) => {
  const t = useContext(ThemeCtx);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const T = {
    en:{ api:'API Data', sensor:'Sensor Data', diff:'Diff', fraud:'Fraud Risk Detected', ok:'Data Consistent — No Fraud Risk', noSensor:'Waiting for sensor data…', noKey:'Add OpenWeatherMap API key to WeatherWidget.jsx', temp:'Temperature', humidity:'Humidity', condition:'Condition', wind:'Wind Speed', location:'Location' },
    ta:{ api:'API தரவு', sensor:'சென்சார் தரவு', diff:'வேறுபாடு', fraud:'மோசடி ஆபத்து', ok:'தரவு சரியாக உள்ளது', noSensor:'சென்சார் தரவு காத்திருக்கிறது…', noKey:'API key சேர்க்கவும்', temp:'வெப்பநிலை', humidity:'ஈரப்பதம்', condition:'நிலை', wind:'காற்று', location:'இடம்' },
    hi:{ api:'API डेटा', sensor:'सेंसर डेटा', diff:'अंतर', fraud:'धोखाधड़ी जोखिम', ok:'डेटा सुसंगत — कोई धोखाधड़ी नहीं', noSensor:'सेंसर डेटा का इंतजार…', noKey:'API key जोड़ें', temp:'तापमान', humidity:'आर्द्रता', condition:'स्थिति', wind:'हवा', location:'स्थान' },
  }[language];

  const lat=sensorData?.latitude||farmer?.latitude||11.5864;
  const lon=sensorData?.longitude||farmer?.longitude||75.5581;
  const isLight = t.name === 'light';

  useEffect(()=>{
    if(API_KEY==='YOUR_OPENWEATHER_API_KEY') return;
    setLoading(true);
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then(r=>{ if(!r.ok) throw new Error('API error '+r.status); return r.json(); })
      .then(d=>setWeather(d))
      .catch(e=>setError(e.message))
      .finally(()=>setLoading(false));
  },[lat,lon]);

  const tempDiff  = weather&&sensorData ? Math.abs(weather.main.temp-sensorData.temperature) : null;
  const humDiff   = weather&&sensorData ? Math.abs(weather.main.humidity-sensorData.humidity) : null;
  const isFraud   = (tempDiff!=null&&tempDiff>10)||(humDiff!=null&&humDiff>30);

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:t.textLabel, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', background:t.bgTableHead, borderBottom:`2px solid ${t.border}` };
  const tdStyle = { padding:'11px 14px', fontSize:13, color:t.textPrimary, borderBottom:`1px solid ${t.border}`, verticalAlign:'middle' };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <Ico n="map" s={13} c={t.textMuted} />
        <span style={{ color:t.textMuted, fontSize:12 }}>
          Coordinates: {lat.toFixed?lat.toFixed(4):lat}°N, {lon.toFixed?lon.toFixed(4):lon}°E
        </span>
      </div>

      {API_KEY==='YOUR_OPENWEATHER_API_KEY' && (
        <div style={{ padding:'10px 14px', background:t.pendingBg, border:`1px solid ${t.pendingBdr}`, borderLeft:`4px solid ${t.pending}`, borderRadius:5, color:t.pending, fontSize:13, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <Ico n="alert" s={14} c={t.pending} /> {T.noKey}
        </div>
      )}

      {!sensorData && <div style={{ color:t.textMuted, fontSize:13 }}>{T.noSensor}</div>}
      {loading && <div style={{ color:t.textMuted, fontSize:13, display:'flex', alignItems:'center', gap:6 }}><Ico n="clock" s={14} c={t.textMuted}/> Fetching weather data…</div>}
      {error && <div style={{ color:t.rejected, fontSize:13 }}>{error}</div>}

      {weather && sensorData && (
        <>
          {/* Verdict */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:isFraud?t.rejectedBg:t.approvedBg, border:`1px solid ${isFraud?t.rejectedBdr:t.approvedBdr}`, borderLeft:`4px solid ${isFraud?t.rejected:t.approved}`, borderRadius:5, marginBottom:14 }}>
            <Ico n={isFraud?'alert':'shield'} s={15} c={isFraud?t.rejected:t.approved} />
            <span style={{ color:isFraud?t.rejected:t.approved, fontSize:13, fontWeight:700 }}>
              {isFraud ? T.fraud : T.ok}
            </span>
          </div>

          {/* Comparison table */}
          <div style={{ border:`1px solid ${t.border}`, borderRadius:6, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Parameter</th>
                  <th style={thStyle}><Ico n="cloud" s={11} c={t.textLabel} st={{marginRight:4}}/>{T.api}</th>
                  <th style={thStyle}><Ico n="wifi" s={11} c={t.textLabel} st={{marginRight:4}}/>{T.sensor}</th>
                  <th style={thStyle}>{T.diff}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { param:`${T.temp}`, api:`${weather.main.temp.toFixed(1)}°C`, sensor:`${sensorData.temperature?.toFixed(1)}°C`, diff:tempDiff?.toFixed(1)+'°C', flag:tempDiff>10 },
                  { param:`${T.humidity}`, api:`${weather.main.humidity}%`, sensor:`${sensorData.humidity?.toFixed(0)}%`, diff:humDiff?.toFixed(1)+'%', flag:humDiff>30 },
                  { param:`${T.condition}`, api:weather.weather?.[0]?.description||'—', sensor:sensorData.rainStatus?'Rain':'Clear', diff:'—', flag:false },
                  { param:`${T.wind}`, api:`${weather.wind?.speed?.toFixed(1)} m/s`, sensor:'—', diff:'—', flag:false },
                ].map((row,i)=>{
                  const rowBg=i%2===0?t.bgTable:t.bgTableRow;
                  return (
                    <tr key={i} style={{ background:rowBg }}
                      onMouseEnter={e=>e.currentTarget.style.background=t.bgTableHover}
                      onMouseLeave={e=>e.currentTarget.style.background=rowBg}
                    >
                      <td style={{ ...tdStyle, fontWeight:600, color:t.textSecondary }}>{row.param}</td>
                      <td style={{ ...tdStyle, color:isLight?'#1565C0':'#90CAF9', fontWeight:600 }}>{row.api}</td>
                      <td style={{ ...tdStyle, color:t.accent, fontWeight:600 }}>{row.sensor}</td>
                      <td style={{ ...tdStyle, color:row.flag?t.rejected:t.textMuted, fontWeight:row.flag?700:400 }}>
                        {row.flag && <Ico n="alert" s={12} c={t.rejected} st={{marginRight:4}} />}
                        {row.diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherWidget;