import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import DashboardStats  from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import ClaimsTable     from './components/ClaimsTable';
import SensorForm      from './components/SensorForm';
import ImageUpload     from './components/ImageUpload';
import WeatherWidget   from './components/WeatherWidget';
import AlertSystem     from './components/AlertSystem';
import AuthPage        from './components/AuthPage';
import NoPolicyMessage from './components/NoPolicyMessage';
import WebcamSettings  from './components/WebcamSettings';   // ← ADD THIS

import { playAlertSound } from './components/AlertSystem';

// ─────────────────────────────────────────────────────────────────────────────
//  THEME TOKENS
// ─────────────────────────────────────────────────────────────────────────────
export const THEMES = {
  light: {
    name:'light',
    bg:'#F2F7F2',
    bgCard:'#FFFFFF',
    bgHeader:'#FFFFFF',
    bgHeaderTop:'#1A5E37',
    bgStrip:'#EAF3EC',
    bgInput:'#FFFFFF',
    bgTable:'#FFFFFF',
    bgTableHead:'#F0F7F2',
    bgTableRow:'#FAFCFA',
    bgTableHover:'#E8F5ED',
    bgBadge:'#EAF3EC',
    border:'#C2D9C9',
    borderCard:'#D0E5D6',
    borderInput:'#A8C9B2',
    accent:'#1A5E37',
    accentMid:'#2E7D52',
    accentLight:'#4CAF50',
    accentMuted:'#EAF3EC',
    accentStrip:'#FF6F00',
    textPrimary:'#0F2416',
    textSecondary:'#1E3D28',
    textMuted:'#4A6A54',
    textLabel:'#2E5038',
    textHeading:'#0A1C10',
    textOnGreen:'#FFFFFF',
    approved:'#1B7A3E', approvedBg:'#E3F4EA', approvedBdr:'#82C895',
    pending:'#BF4600',  pendingBg:'#FFF0E0',  pendingBdr:'#FFAB66',
    rejected:'#B71C1C', rejectedBg:'#FFEBEE', rejectedBdr:'#E57373',
    info:'#0D47A1',     infoBg:'#E3F0FF',     infoBdr:'#90B8E8',
    shadow:'0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
    shadowCard:'0 2px 10px rgba(26,94,55,0.08), 0 1px 3px rgba(0,0,0,0.05)',
    shadowHover:'0 14px 40px rgba(26,94,55,0.18), 0 4px 12px rgba(0,0,0,0.09)',
    divider:'#C2D9C9',
    scrollbar:'#8DBFA0',
    danger:'#B71C1C', dangerBg:'#FFEBEE', dangerBdr:'#E57373',
  },
  dark: {
    name:'dark',
    bg:'#0B1610',
    bgCard:'#112018',
    bgHeader:'rgba(8,14,10,0.97)',
    bgHeaderTop:'#092215',
    bgStrip:'rgba(15,28,18,0.85)',
    bgInput:'#0D1A10',
    bgTable:'#112018',
    bgTableHead:'#0D1A10',
    bgTableRow:'rgba(255,255,255,0.02)',
    bgTableHover:'rgba(76,175,80,0.07)',
    bgBadge:'rgba(76,175,80,0.1)',
    border:'rgba(76,175,80,0.2)',
    borderCard:'rgba(76,175,80,0.16)',
    borderInput:'rgba(76,175,80,0.3)',
    accent:'#4CAF50', accentMid:'#388E3C', accentLight:'#81C784',
    accentMuted:'rgba(76,175,80,0.1)', accentStrip:'#FF8F00',
    textPrimary:'#E8F5E9', textSecondary:'#A5D6A7',
    textMuted:'#607D6B', textLabel:'#7CB087',
    textHeading:'#F1F8F2', textOnGreen:'#FFFFFF',
    approved:'#66BB6A', approvedBg:'rgba(102,187,106,0.12)', approvedBdr:'rgba(102,187,106,0.4)',
    pending:'#FFA726',  pendingBg:'rgba(255,167,38,0.12)',   pendingBdr:'rgba(255,167,38,0.4)',
    rejected:'#EF5350', rejectedBg:'rgba(239,83,80,0.12)',   rejectedBdr:'rgba(239,83,80,0.4)',
    info:'#64B5F6',     infoBg:'rgba(100,181,246,0.12)',     infoBdr:'rgba(100,181,246,0.4)',
    shadow:'0 4px 20px rgba(0,0,0,0.4)',
    shadowCard:'0 4px 20px rgba(0,0,0,0.35)',
    shadowHover:'0 14px 40px rgba(76,175,80,0.18)',
    divider:'rgba(76,175,80,0.16)',
    scrollbar:'#2E7D32',
    danger:'#EF5350', dangerBg:'rgba(239,83,80,0.12)', dangerBdr:'rgba(239,83,80,0.35)',
  },
};

export const ThemeCtx = createContext(THEMES.light);
export const useTheme = () => useContext(ThemeCtx);

// ─────────────────────────────────────────────────────────────────────────────
//  SVG ICON
// ─────────────────────────────────────────────────────────────────────────────
const PATHS = {
  sun:      '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>',
  moon:     '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  logout:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  chart:    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  shield:   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  wifi:     '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  cloud:    '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  camera:   '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  list:     '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  leaf:     '<path d="M17 8C8 10 5.9 16.17 3.82 19.5A1 1 0 0 0 5 21c.5 0 1.5-.5 3.5-3"/><path d="M21.5 3.5a14.5 14.5 0 0 1-17 17"/>',
  lightning:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  alert:    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};
export const Ico = ({ n, s=16, c='currentColor', st={} }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...st }}
    dangerouslySetInnerHTML={{ __html: PATHS[n]||'' }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
//  PMFBY BOTANICAL BACKGROUND — full-page tiling wheat + vines + flowers + ₹
// ─────────────────────────────────────────────────────────────────────────────
const PageBackground = ({ isDark }) => {
  if (isDark) return (
    <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden' }}>
      <div style={{ position:'absolute',top:'15%',right:'5%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(76,175,80,0.055) 0%,transparent 70%)' }}/>
      <div style={{ position:'absolute',bottom:'10%',left:'3%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(27,94,32,0.045) 0%,transparent 70%)' }}/>
    </div>
  );

  // LIGHT: Full PMFBY botanical SVG tile
  return (
    <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden' }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute',inset:0 }}>
        <defs>
          <pattern id="pmfby-tile" x="0" y="0" width="340" height="340" patternUnits="userSpaceOnUse">
            {/* ── WHEAT STALK 1 — centre ── */}
            <g fill="#2E8B57" opacity="0.09">
              <rect x="168" y="8" width="4" height="160" rx="2"/>
              {/* grain spikelets */}
              <ellipse cx="170" cy="26" rx="13" ry="21" transform="rotate(-18 170 26)"/>
              <ellipse cx="170" cy="26" rx="13" ry="21" transform="rotate(18 170 26)"/>
              <ellipse cx="170" cy="52" rx="11" ry="17" transform="rotate(-18 170 52)"/>
              <ellipse cx="170" cy="52" rx="11" ry="17" transform="rotate(18 170 52)"/>
              <ellipse cx="170" cy="74" rx="9"  ry="14" transform="rotate(-18 170 74)"/>
              <ellipse cx="170" cy="74" rx="9"  ry="14" transform="rotate(18 170 74)"/>
              <ellipse cx="170" cy="93" rx="7"  ry="11" transform="rotate(-18 170 93)"/>
              <ellipse cx="170" cy="93" rx="7"  ry="11" transform="rotate(18 170 93)"/>
              {/* leaves along stalk */}
              <path d="M168 110 C138 92 112 116 126 148 C132 128 148 112 168 115 Z"/>
              <path d="M172 110 C202 92 228 116 214 148 C208 128 192 112 172 115 Z"/>
              <path d="M165 140 C142 124 128 138 134 158 C138 144 150 136 165 143 Z"/>
              <path d="M175 140 C198 124 212 138 206 158 C202 144 190 136 175 143 Z"/>
            </g>

            {/* ── SMALL WHEAT — top-left offset ── */}
            <g fill="#3DAE6E" opacity="0.07" transform="translate(28, 20)">
              <rect x="12" y="0" width="3" height="110" rx="1.5"/>
              <ellipse cx="13.5" cy="14" rx="9" ry="15" transform="rotate(-16 13.5 14)"/>
              <ellipse cx="13.5" cy="14" rx="9" ry="15" transform="rotate(16 13.5 14)"/>
              <ellipse cx="13.5" cy="35" rx="7" ry="12" transform="rotate(-16 13.5 35)"/>
              <ellipse cx="13.5" cy="35" rx="7" ry="12" transform="rotate(16 13.5 35)"/>
              <ellipse cx="13.5" cy="53" rx="6" ry="9"  transform="rotate(-16 13.5 53)"/>
              <ellipse cx="13.5" cy="53" rx="6" ry="9"  transform="rotate(16 13.5 53)"/>
              <path d="M12 70 C-4 58 -13 72 -7 90 C-3 78 4 70 12 73 Z"/>
              <path d="M15 70 C31 58 40 72 34 90 C30 78 23 70 15 73 Z"/>
            </g>

            {/* ── LOTUS / 4-PETAL FLOWER — top-right ── */}
            <g fill="#27AE60" opacity="0.09" transform="translate(270, 30)">
              <circle cx="22" cy="22" r="8"/>
              <ellipse cx="22" cy="4"  rx="7" ry="14"/>
              <ellipse cx="22" cy="40" rx="7" ry="14"/>
              <ellipse cx="4"  cy="22" rx="14" ry="7"/>
              <ellipse cx="40" cy="22" rx="14" ry="7"/>
              {/* diagonal petals */}
              <ellipse cx="9"  cy="9"  rx="6" ry="10" transform="rotate(-45 9 9)"/>
              <ellipse cx="35" cy="9"  rx="6" ry="10" transform="rotate(45 35 9)"/>
              <ellipse cx="9"  cy="35" rx="6" ry="10" transform="rotate(45 9 35)"/>
              <ellipse cx="35" cy="35" rx="6" ry="10" transform="rotate(-45 35 35)"/>
            </g>

            {/* ── SMALL FLOWER — bottom-left ── */}
            <g fill="#2E8B57" opacity="0.08" transform="translate(20, 250)">
              <circle cx="18" cy="18" r="6"/>
              <ellipse cx="18" cy="4"  rx="5" ry="11"/>
              <ellipse cx="18" cy="32" rx="5" ry="11"/>
              <ellipse cx="4"  cy="18" rx="11" ry="5"/>
              <ellipse cx="32" cy="18" rx="11" ry="5"/>
            </g>

            {/* ── VINE CURLS — left mid ── */}
            <g fill="none" stroke="#2E8B57" strokeWidth="2.5" opacity="0.08">
              {/* S-curve vine */}
              <path d="M50 190 C50 165 72 155 90 168 C108 181 130 172 128 148"/>
              <path d="M128 148 C126 134 112 128 100 136"/>
              {/* Small leaf on vine */}
              <path d="M90 168 C76 158 70 168 75 180 C78 172 84 167 90 168 Z" fill="#2E8B57"/>
              <path d="M118 160 C130 152 136 160 132 172 C129 164 124 159 118 160 Z" fill="#2E8B57"/>
              {/* Tendril curl */}
              <path d="M100 136 C96 126 104 118 110 124 C105 120 99 126 102 132"/>
            </g>

            {/* ── VINE CURLS — right mid ── */}
            <g fill="none" stroke="#27AE60" strokeWidth="2" opacity="0.07">
              <path d="M280 160 C295 145 310 148 308 165 C306 180 290 185 282 175"/>
              <path d="M282 175 C275 165 278 155 286 158"/>
              <path d="M286 158 C293 152 300 158 296 166 C292 162 286 162 286 158 Z" fill="#27AE60"/>
              <path d="M308 165 C314 155 322 158 318 170" />
              <path d="M318 170 C320 176 316 182 310 180 Z" fill="#27AE60"/>
            </g>

            {/* ── RUPEE WATERMARK — bottom-right ── */}
            <text x="238" y="322" fontSize="72" fontFamily="'Noto Serif',Georgia,serif"
              fill="#1A6B3C" opacity="0.06" textAnchor="middle">₹</text>

            {/* ── SMALL RUPEE — top-left corner ── */}
            <text x="16" y="72" fontSize="40" fontFamily="'Noto Serif',Georgia,serif"
              fill="#1A6B3C" opacity="0.05" textAnchor="middle">₹</text>

            {/* ── GRAIN / DOT cluster decoration ── */}
            <g fill="#2E8B57" opacity="0.06">
              <circle cx="260" cy="200" r="4"/>
              <circle cx="274" cy="196" r="3"/>
              <circle cx="252" cy="212" r="3"/>
              <circle cx="268" cy="214" r="4.5"/>
              <circle cx="280" cy="208" r="2.5"/>
            </g>

            {/* ── LEAF OUTLINE — bottom-centre ── */}
            <g fill="none" stroke="#2E8B57" strokeWidth="2" opacity="0.07">
              <path d="M170 260 C170 260 220 240 225 285 C200 268 180 260 170 260 Z"/>
              <path d="M170 260 L195 272"/>
              <path d="M170 260 C170 260 120 240 115 285 C140 268 160 260 170 260 Z"/>
              <path d="M170 260 L145 272"/>
            </g>

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pmfby-tile)"/>
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  CARD WATERMARKS — per-section inline SVG in card body
// ─────────────────────────────────────────────────────────────────────────────
const CardWatermark = ({ type }) => {
  const marks = {
    rupee: (
      <text x="10" y="150" fontSize="160" fontFamily="'Noto Serif',Georgia,serif" fill="#1A6B3C">₹</text>
    ),
    wheat: (
      <g fill="#1A6B3C">
        <rect x="77" y="2" width="6" height="130" rx="3"/>
        <ellipse cx="80" cy="20" rx="18" ry="28" transform="rotate(-15 80 20)"/>
        <ellipse cx="80" cy="20" rx="18" ry="28" transform="rotate(15 80 20)"/>
        <ellipse cx="80" cy="50" rx="15" ry="22" transform="rotate(-15 80 50)"/>
        <ellipse cx="80" cy="50" rx="15" ry="22" transform="rotate(15 80 50)"/>
        <ellipse cx="80" cy="75" rx="12" ry="18" transform="rotate(-15 80 75)"/>
        <ellipse cx="80" cy="75" rx="12" ry="18" transform="rotate(15 80 75)"/>
        <path d="M77 100 C50 84 30 105 42 132 C48 114 62 100 77 104 Z"/>
        <path d="M83 100 C110 84 130 105 118 132 C112 114 98 100 83 104 Z"/>
      </g>
    ),
    flower: (
      <g fill="#1A6B3C">
        <circle cx="80" cy="80" r="14"/>
        <ellipse cx="80" cy="22"  rx="12" ry="24"/>
        <ellipse cx="80" cy="138" rx="12" ry="24"/>
        <ellipse cx="22" cy="80"  rx="24" ry="12"/>
        <ellipse cx="138" cy="80" rx="24" ry="12"/>
        <ellipse cx="34"  cy="34"  rx="10" ry="20" transform="rotate(-45 34 34)"/>
        <ellipse cx="126" cy="34"  rx="10" ry="20" transform="rotate(45 126 34)"/>
        <ellipse cx="34"  cy="126" rx="10" ry="20" transform="rotate(45 34 126)"/>
        <ellipse cx="126" cy="126" rx="10" ry="20" transform="rotate(-45 126 126)"/>
      </g>
    ),
    shield: (
      <g fill="none" stroke="#1A6B3C" strokeWidth="7">
        <path d="M80 12 L18 40 L18 90 C18 128 80 152 80 152 C80 152 142 128 142 90 L142 40 Z"/>
        <polyline points="52 88 72 108 110 68"/>
      </g>
    ),
    chart: (
      <g fill="#1A6B3C">
        <rect x="10" y="95" width="32" height="58" rx="5"/>
        <rect x="57" y="62" width="32" height="91" rx="5"/>
        <rect x="104" y="28" width="32" height="125" rx="5"/>
        <line x1="10" y1="155" x2="140" y2="155" stroke="#1A6B3C" strokeWidth="5" strokeLinecap="round"/>
      </g>
    ),
    cloud: (
      <g fill="none" stroke="#1A6B3C" strokeWidth="6">
        <path d="M116 90 H90 A52 52 0 1 1 44 52 A40 40 0 0 1 116 90 Z"/>
        <line x1="60" y1="108" x2="54" y2="124"/>
        <line x1="80" y1="108" x2="80" y2="130"/>
        <line x1="100" y1="108" x2="106" y2="124"/>
      </g>
    ),
  };

  return (
    <div style={{ position:'absolute', right:-8, bottom:-8, opacity:0.042, pointerEvents:'none', userSelect:'none', zIndex:0 }}>
      <svg width="170" height="170" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        {marks[type] || marks.rupee}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION CARD — pastel background + card watermark + zoom on hover
// ─────────────────────────────────────────────────────────────────────────────
const CARD_PASTELS = {
  // light pastel card body backgrounds (matching PMFBY screenshot)
  green:  { bg:'#F0FAF3', border:'#B8DECA', headerBg:'#1A5E37',  headerEnd:'#2E8B57'  },
  teal:   { bg:'#E8FAF8', border:'#A8DDD8', headerBg:'#00796B',  headerEnd:'#00BFA5'  },
  blue:   { bg:'#EFF6FF', border:'#B3D1F5', headerBg:'#1565C0',  headerEnd:'#1E88E5'  },
  pink:   { bg:'#FFF0F5', border:'#F5B8CE', headerBg:'#AD1457',  headerEnd:'#E91E8C'  },
  orange: { bg:'#FFF6ED', border:'#F5C98A', headerBg:'#D84315',  headerEnd:'#FF7043'  },
  purple: { bg:'#F5F0FF', border:'#C9B8EE', headerBg:'#5E35B1',  headerEnd:'#9575CD'  },
  amber:  { bg:'#FFFBEA', border:'#F5D878', headerBg:'#F57F17',  headerEnd:'#FFCA28'  },
};

export const SectionCard = ({ title, icon, children, theme, palette='green', watermark='rupee' }) => {
  const [hov, setHov] = useState(false);
  const isLight       = theme.name === 'light';
  const pal           = isLight ? CARD_PASTELS[palette] : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   isLight ? pal.bg  : theme.bgCard,
        border:       `1.5px solid ${isLight ? pal.border : theme.borderCard}`,
        borderRadius: 14,
        boxShadow:    hov ? theme.shadowHover : theme.shadowCard,
        marginBottom: 22,
        overflow:     'hidden',
        transform:    hov ? 'translateY(-6px) scale(1.008)' : 'translateY(0) scale(1)',
        transition:   'all 0.35s cubic-bezier(0.34,1.35,0.64,1)',
        position:     'relative',
        willChange:   'transform, box-shadow',
      }}
    >
      {/* ── Gradient header bar ── */}
      <div style={{
        background:    `linear-gradient(135deg, ${isLight ? pal.headerBg : theme.bgHeaderTop} 0%, ${isLight ? pal.headerEnd : theme.accentMid} 100%)`,
        padding:      '14px 24px',
        display:      'flex',
        alignItems:   'center',
        position:     'relative',
        overflow:     'hidden',
        minHeight:    54,
      }}>
        {/* Large ghost icon watermark in header */}
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', opacity:0.15, pointerEvents:'none' }}>
          <Ico n={icon} s={50} c="#FFFFFF"/>
        </div>
        {/* Subtle botanical swirl in header bg */}
        <svg style={{ position:'absolute', right:0, top:0, opacity:0.08, pointerEvents:'none' }} width="120" height="54" viewBox="0 0 120 54" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 54 C80 54 120 40 110 10 C100 -5 80 5 75 20 C70 35 85 38 90 28 C95 18 88 10 80 14" fill="none" stroke="white" strokeWidth="3"/>
          <ellipse cx="108" cy="12" rx="8" ry="12" transform="rotate(-30 108 12)" fill="white"/>
          <ellipse cx="76" cy="22" rx="6" ry="10" transform="rotate(20 76 22)" fill="white"/>
        </svg>
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
            <Ico n={icon} s={18} c="#FFFFFF"/>
          </div>
          <span style={{ color:'#FFFFFF', fontSize:14, fontWeight:700, fontFamily:"'Open Sans',sans-serif", letterSpacing:'0.2px', textShadow:'0 1px 3px rgba(0,0,0,0.2)' }}>
            {title}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding:'24px 28px', position:'relative', overflow:'hidden' }}>
        {isLight && <CardWatermark type={watermark}/>}
        {/* Subtle botanical sprig — top-right of body (light only) */}
        {isLight && (
          <svg style={{ position:'absolute', top:-4, right:60, opacity:0.045, pointerEvents:'none', zIndex:0 }} width="80" height="80" viewBox="0 0 80 80">
            <g fill="#1A6B3C">
              <rect x="38" y="4" width="4" height="55" rx="2"/>
              <ellipse cx="40" cy="16" rx="10" ry="16" transform="rotate(-14 40 16)"/>
              <ellipse cx="40" cy="16" rx="10" ry="16" transform="rotate(14 40 16)"/>
              <ellipse cx="40" cy="34" rx="8" ry="12" transform="rotate(-14 40 34)"/>
              <ellipse cx="40" cy="34" rx="8" ry="12" transform="rotate(14 40 34)"/>
              <path d="M38 55 C24 46 16 56 22 68 C26 58 32 54 38 57 Z"/>
              <path d="M42 55 C56 46 64 56 58 68 C54 58 48 54 42 57 Z"/>
            </g>
          </svg>
        )}
        <div style={{ position:'relative', zIndex:1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────────────────────────────────────
const LANGS = [
  { code:'en', label:'EN'     },
  { code:'ta', label:'தமிழ்' },
  { code:'hi', label:'हिंदी' },
];
const TR = {
  en:{ title:'AI Crop Insurance', sub:'Smart Agriculture Monitoring', process:'Process Claim', processing:'Processing…', logout:'Sign Out' },
  ta:{ title:'AI பயிர் காப்பீடு', sub:'ஸ்மார்ட் கண்காணிப்பு', process:'கோரிக்கை', processing:'செயலாக்கம்…', logout:'வெளியேறு' },
  hi:{ title:'AI फसल बीमा', sub:'स्मार्ट कृषि निगरानी', process:'दावा करें', processing:'प्रक्रिया…', logout:'लॉगआउट' },
};
const prevAbnormal = { flood:false, drought:false, disease:false };
export default function App() {
  const [farmer, setFarmer]         = useState(null);
  const [claims, setClaims]         = useState([]);
  const [claimsLoading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [language, setLang]         = useState('en');
  const [sensorData, setSensor]     = useState(null);
  const [isLive, setLive]           = useState(false);
  const [noPolicy, setNoPolicy]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [time, setTime]             = useState(new Date());
  const [debug, setDebug]           = useState('');
  const [isDark, setDark]           = useState(false);

  const theme   = isDark ? THEMES.dark : THEMES.light;
  const T       = TR[language];
  const isLight = !isDark;

  const fetchClaims = useCallback(async (fid) => {
    if (!fid) return;
    setLoading(true);
    try {
      let res = await fetch(`http://localhost:8080/api/claims?farmerId=${fid}`);
      if (!res.ok) res = await fetch(`http://localhost:8080/api/claims/farmer/${fid}`);
      if (res.ok) {
        const d = await res.json();
        setClaims(d); setNoPolicy(d.length === 0);
        setDebug(`Loaded ${d.length} claims for farmer #${fid}`);
      }
    } catch(e) { setDebug(`Error: ${e.message}`); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!farmer?.id) return;
    fetchClaims(farmer.id);
    const iv = setInterval(() => fetchClaims(farmer.id), 15000);
    return () => clearInterval(iv);
  }, [farmer, fetchClaims]);

  useEffect(() => {
    if (!farmer) return;
    const poll = async () => {
      try {
        const r = await fetch('http://localhost:8080/api/iot/latest');
if (r.ok) {
  const d = await r.json();
  setSensor(d); setLive(true);
  const isFlood   = d.waterLevel > 80 || d.soilMoisture > 85;
  const isDrought = d.temperature > 38 && d.soilMoisture < 20;
  const isDisease = d.humidity > 90 && d.temperature > 32;
  const newAlert  = (isFlood && !prevAbnormal.flood) || (isDrought && !prevAbnormal.drought) || (isDisease && !prevAbnormal.disease);
  if (newAlert) {
    window.dispatchEvent(new CustomEvent('sensorAlert', { detail: d }));
    playAlertSound();   // ← YOUR MP3 auto-plays on abnormal ESP32 reading
  }
  prevAbnormal.flood = isFlood; prevAbnormal.drought = isDrought; prevAbnormal.disease = isDisease;
} else { setLive(false); }      } catch { setLive(false); }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [farmer]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleLogin   = (f) => { setFarmer(f); setClaims([]); };
  const handleLogout  = () => { setFarmer(null); setClaims([]); setSensor(null); setLive(false); setNoPolicy(false); setDebug(''); };
  const handleClaim   = () => fetchClaims(farmer?.id);
  const handleManual  = () => { fetch('http://localhost:8080/api/iot/latest').then(r=>r.ok?r.json():null).then(d=>{if(d){setSensor(d);setLive(true);}}).catch(()=>{}); };
  const handleProcess = async () => {
    if (!farmer) return; setProcessing(true);
    try { await fetch(`http://localhost:8080/api/claims/process?farmerId=${farmer.id}`,{method:'POST'}); await fetchClaims(farmer.id); }
    catch { alert('Failed'); } finally { setProcessing(false); }
  };

  if (!farmer) return (
    <ThemeCtx.Provider value={theme}>
      <AuthPage onLoginSuccess={handleLogin} isDark={isDark} onToggle={()=>setDark(d=>!d)}/>
    </ThemeCtx.Provider>
  );

  return (
    <ThemeCtx.Provider value={theme}>
      <div style={{ minHeight:'100vh', background:theme.bg, fontFamily:"'Open Sans',sans-serif", transition:'background 0.25s', position:'relative', overflowX:'hidden' }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:'Open Sans',sans-serif;background:${theme.bg}}
          ::-webkit-scrollbar{width:7px}
          ::-webkit-scrollbar-track{background:${theme.bg}}
          ::-webkit-scrollbar-thumb{background:${theme.scrollbar};border-radius:4px}
          input:focus,select:focus{outline:none;border-color:${theme.accent}!important;box-shadow:0 0 0 3px ${isLight?'rgba(26,94,55,0.12)':'rgba(76,175,80,0.18)'}!important}
          @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
          button{cursor:pointer;font-family:'Open Sans',sans-serif}
        `}</style>

        {/* Page-wide botanical / dark-glow background */}
        <PageBackground isDark={isDark}/>

        <AlertSystem theme={theme} language={language}/>

        {/* ── TOP GOV STRIP ── */}
        <div style={{ background:theme.bgHeaderTop, padding:'4px 0', position:'relative', zIndex:10 }}>
          <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'rgba(255,255,255,0.78)', fontSize:11 }}>
              Government of India — Pradhan Mantri Fasal Bima Yojana
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:11, display:'flex', alignItems:'center', gap:5 }}>
                <Ico n="clock" s={11} c="rgba(255,255,255,0.65)"/>
                {time.toLocaleString('en-IN',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
              </span>
              <span style={{ color:'rgba(255,255,255,0.3)' }}>|</span>
              <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.78)', fontSize:11 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:isLive?'#69F0AE':'#FF5252',display:'inline-block',animation:'pulse 2s infinite' }}/>
                {isLive?'IoT Live':'IoT Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* ── HEADER ── */}
        <header style={{ background:theme.bgHeader, borderBottom:`3px solid ${isLight?theme.accentStrip:theme.border}`, position:'sticky', top:0, zIndex:200, boxShadow:scrolled?theme.shadow:'none', transition:'box-shadow 0.25s' }}>
          <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:68, gap:12, flexWrap:'wrap' }}>

            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:`linear-gradient(135deg,${theme.accentMid},${theme.accentLight})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${theme.accent}45` }}>
                <Ico n="leaf" s={24} c="#FFFFFF"/>
              </div>
              <div>
                <div style={{ color:theme.textHeading, fontFamily:"'Noto Serif',serif", fontWeight:700, fontSize:19, lineHeight:1.2 }}>{T.title}</div>
                <div style={{ color:theme.accentMid, fontSize:10, textTransform:'uppercase', letterSpacing:'1.1px', fontWeight:600, marginTop:1 }}>{T.sub}</div>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {/* Theme toggle */}
              <button onClick={()=>setDark(d=>!d)} style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:theme.bgBadge,border:`1px solid ${theme.border}`,borderRadius:20,color:theme.textLabel,fontSize:12,fontWeight:600,transition:'all 0.2s' }}>
                <Ico n={isDark?'sun':'moon'} s={13} c={theme.textLabel}/>
                {isDark?'Light':'Dark'}
              </button>

              {/* Language */}
              <div style={{ display:'flex',border:`1px solid ${theme.border}`,borderRadius:7,overflow:'hidden' }}>
                {LANGS.map(l=>(
                  <button key={l.code} onClick={()=>setLang(l.code)} style={{ padding:'7px 12px',fontSize:11,fontWeight:700,border:'none',borderRight:l.code!=='hi'?`1px solid ${theme.border}`:'none',background:language===l.code?theme.accent:theme.bgCard,color:language===l.code?'#FFFFFF':theme.textMuted,transition:'all 0.15s' }}>
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Farmer badge */}
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'7px 16px',background:isLight?'#EAF7EF':theme.bgBadge,border:`1px solid ${isLight?'#B5D9C2':theme.border}`,borderRadius:10 }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${theme.accentMid},${theme.accentLight})`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 2px 8px ${theme.accent}35` }}>
                  <Ico n="user" s={16} c="#FFFFFF"/>
                </div>
                <div>
                  <div style={{ color:theme.textPrimary,fontSize:14,fontWeight:700,lineHeight:1.15 }}>{farmer.name}</div>
                  <div style={{ color:theme.accentMid,fontSize:10,fontWeight:600 }}>ID #{farmer.id}{farmer.district?` · ${farmer.district}`:''}</div>
                </div>
              </div>

              {/* Process claim */}
              <button onClick={handleProcess} disabled={processing} style={{ display:'flex',alignItems:'center',gap:7,padding:'9px 18px',background:`linear-gradient(135deg,${theme.accentMid},${theme.accentLight})`,color:'#FFFFFF',border:'none',borderRadius:9,fontSize:13,fontWeight:700,boxShadow:`0 3px 12px ${theme.accent}45`,transition:'all 0.2s',opacity:processing?0.65:1 }}
                onMouseEnter={e=>{if(!processing){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 6px 20px ${theme.accent}55`;}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 3px 12px ${theme.accent}45`;}}
              >
                <Ico n="lightning" s={14} c="#FFFFFF"/>
                {processing?T.processing:T.process}
              </button>

              {/* Logout */}
              <button onClick={handleLogout} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 15px',background:theme.bgCard,border:`1px solid ${theme.border}`,borderRadius:9,color:theme.textMuted,fontSize:13,fontWeight:600,transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=theme.danger;e.currentTarget.style.color=theme.danger;e.currentTarget.style.background=theme.rejectedBg;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=theme.border;e.currentTarget.style.color=theme.textMuted;e.currentTarget.style.background=theme.bgCard;}}
              >
                <Ico n="logout" s={14} c="currentColor"/>
                {T.logout}
              </button>
            </div>
          </div>

          {/* Season sub-strip */}
          <div style={{ background:isLight?'#E2EEE7':theme.bgStrip, borderTop:`1px solid ${isLight?'#C0D8C8':theme.border}`, padding:'5px 28px' }}>
            <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
              {[
                { icon:'leaf',   text:'Kharif Season 2025–26' },
                { icon:'pin',    text:farmer.district||'Field Station' },
                { icon:'shield', text:'PMFBY Enrolled' },
                sensorData && { icon:'wifi', text:`${sensorData.temperature?.toFixed(1)}°C  |  ${sensorData.humidity?.toFixed(0)}% RH  |  Soil ${sensorData.soilMoisture?.toFixed(0)}%`, hi:true },
              ].filter(Boolean).map((item,i)=>(
                <React.Fragment key={i}>
                  {i>0 && <span style={{ color:theme.divider,fontSize:12 }}>|</span>}
                  <span style={{ display:'flex',alignItems:'center',gap:5,color:item.hi?theme.accent:theme.textLabel,fontSize:11,fontWeight:item.hi?700:500 }}>
                    <Ico n={item.icon} s={12} c={item.hi?theme.accent:theme.textLabel}/>
                    {item.text}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </header>

        {/* Debug bar */}
        {debug && (
          <div style={{ background:debug.includes('Error')?theme.rejectedBg:theme.approvedBg, borderBottom:`1px solid ${debug.includes('Error')?theme.rejectedBdr:theme.approvedBdr}`, padding:'6px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:9 }}>
            <span style={{ color:debug.includes('Error')?theme.danger:theme.approved, fontSize:12 }}>{debug}</span>
            <button onClick={()=>setDebug('')} style={{ background:'none',border:'none',color:theme.textMuted,fontSize:18 }}>×</button>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{ maxWidth:1400, margin:'0 auto', padding:'26px 28px 52px', animation:'fadeIn 0.35s ease', position:'relative', zIndex:1 }}>

          {!claimsLoading && noPolicy && <NoPolicyMessage farmer={farmer} language={language}/>}

          <SectionCard title="Farm Intelligence Dashboard" icon="chart"  theme={theme} palette="green"  watermark="chart">
            <DashboardStats claims={claims} loading={claimsLoading} language={language}/>
            <div style={{ marginTop:22 }}>
              <DashboardCharts claims={claims} language={language}/>
            </div>
          </SectionCard>

          <SectionCard title="IoT Field Monitoring"  icon="wifi"  theme={theme} palette="teal" watermark="wheat">
           <WebcamSettings language={language} />
           <SensorForm language={language} sensorData={sensorData} isLive={isLive} onManualSubmit={handleManual} farmerId={farmer?.id}/>
         </SectionCard>

          <SectionCard title="Weather Cross-Validation"   icon="cloud"  theme={theme} palette="blue"   watermark="cloud">
            <WeatherWidget sensorData={sensorData} language={language} farmer={farmer}/>
          </SectionCard>

          <SectionCard title="AI Disease Detection"       icon="camera" theme={theme} palette="pink"   watermark="flower">
            <ImageUpload language={language} farmerId={farmer.id} onClaimCreated={handleClaim}/>
          </SectionCard>

          <SectionCard title="My Claims History"          icon="list"   theme={theme} palette="orange" watermark="rupee">
            <ClaimsTable claims={claims} loading={claimsLoading} language={language}/>
          </SectionCard>

        </main>

        {/* Footer */}
        <footer style={{ background:theme.bgHeaderTop, borderTop:`4px solid ${isLight?theme.accentStrip:theme.accentMid}`, padding:'20px 28px', position:'relative', zIndex:1 }}>
          <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:8,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Ico n="leaf" s={20} c="#FFFFFF"/>
              </div>
              <div>
                <div style={{ color:'#FFFFFF',fontSize:14,fontWeight:700,fontFamily:"'Noto Serif',serif" }}>AI Crop Insurance System</div>
                <div style={{ color:'rgba(255,255,255,0.6)',fontSize:10,marginTop:1 }}>IoT · AI · Spring Boot · React</div>
              </div>
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)',fontSize:11 }}>
              Government of India · PMFBY Smart Initiative · © 2025
            </div>
          </div>
        </footer>

      </div>
    </ThemeCtx.Provider>
  );
}