import React from 'react';

export function LiveHandPreview({ look, ar = false }) {
  const rx = { Almond: 30, Coffin: 9, Square: 4, Oval: 28 }[look.shape] ?? 28;
  const scaleY = { Short: .9, Medium: 1, Long: 1.14, XL: 1.26 }[look.length] ?? 1;
  const finishClass = look.finish.toLowerCase();

  return (
    <div className={ar ? 'ar-hand-wrap' : 'hand-stage'}>
      <svg className={`hand-svg ${finishClass}`} viewBox="0 0 620 680" role="img" aria-label="Nail preview">
        <defs>
          <linearGradient id={ar ? 'skinGradAr' : 'skinGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ar ? 'rgba(242,183,159,.18)' : '#f2b79f'} />
            <stop offset=".58" stopColor={ar ? 'rgba(220,143,140,.14)' : '#dc8f8c'} />
            <stop offset="1" stopColor={ar ? 'rgba(173,89,109,.11)' : '#ad596d'} />
          </linearGradient>
          <linearGradient id={ar ? 'nailGradAr' : 'nailGrad'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={look.color.a} />
            <stop offset=".52" stopColor={look.color.c} />
            <stop offset="1" stopColor={look.color.b} />
          </linearGradient>
          <linearGradient id={ar ? 'glossGradAr' : 'glossGrad'} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,.96)" />
            <stop offset=".62" stopColor="rgba(255,255,255,.25)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={ar ? 'palmGlowAr' : 'palmGlow'} cx=".45" cy=".18" r=".8">
            <stop offset="0" stopColor="rgba(255,255,255,.22)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g opacity={ar ? '.55' : '1'}>
          <path fill={`url(#${ar ? 'skinGradAr' : 'skinGrad'})`} d="M178 285c-23 3-42 24-39 49l29 223c4 34 33 59 67 59h177c47 0 86-38 86-86V316c0-24-19-43-43-43s-43 19-43 43v151h-12V239c0-26-21-47-47-47s-47 21-47 47v228h-12V263c0-25-20-45-45-45s-45 20-45 45v204h-12V329c0-27-23-48-51-44z"/>
          <path fill={`url(#${ar ? 'skinGradAr' : 'skinGrad'})`} d="M138 327c-22 6-35 29-29 51l37 139c7 27 35 43 62 36 25-7 40-33 34-58l-39-139c-7-22-30-35-65-29z"/>
          <path fill={`url(#${ar ? 'skinGradAr' : 'skinGrad'})`} d="M496 367c31 7 54 35 54 68v119c0 34-27 62-61 62h-45V412c0-28 24-51 52-45z"/>
          {!ar && <path fill={`url(#${ar ? 'palmGlowAr' : 'palmGlow'})`} d="M178 285c-23 3-42 24-39 49l29 223c4 34 33 59 67 59h177c47 0 86-38 86-86V316c0-24-19-43-43-43s-43 19-43 43v151h-12V239c0-26-21-47-47-47s-47 21-47 47v228h-12V263c0-25-20-45-45-45s-45 20-45 45v204h-12V329c0-27-23-48-51-44z" opacity=".75"/>}
        </g>

        <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: `scaleY(${scaleY})` }}>
          <rect className="nail thumb" fill={`url(#${ar ? 'nailGradAr' : 'nailGrad'})`} x="132" y="344" width="58" height="74" rx={rx} transform="rotate(-13 161 381)"/>
          <rect className="nail index" fill={`url(#${ar ? 'nailGradAr' : 'nailGrad'})`} x="198" y="260" width="65" height="84" rx={rx}/>
          <rect className="nail middle" fill={`url(#${ar ? 'nailGradAr' : 'nailGrad'})`} x="304" y="221" width="70" height="92" rx={rx}/>
          <rect className="nail ring" fill={`url(#${ar ? 'nailGradAr' : 'nailGrad'})`} x="413" y="283" width="64" height="80" rx={rx}/>
          <rect className="nail pinky" fill={`url(#${ar ? 'nailGradAr' : 'nailGrad'})`} x="504" y="418" width="46" height="62" rx={rx}/>
          <rect className="nail-gloss" fill={`url(#${ar ? 'glossGradAr' : 'glossGrad'})`} x="207" y="284" width="47" height="26" rx="3"/>
          <rect className="nail-gloss" fill={`url(#${ar ? 'glossGradAr' : 'glossGrad'})`} x="314" y="247" width="50" height="30" rx="3"/>
          <rect className="nail-gloss" fill={`url(#${ar ? 'glossGradAr' : 'glossGrad'})`} x="422" y="306" width="46" height="27" rx="3"/>
          <rect className="nail-gloss" fill={`url(#${ar ? 'glossGradAr' : 'glossGrad'})`} x="139" y="364" width="42" height="24" rx="3" transform="rotate(-13 160 376)"/>
          <rect className="nail-gloss" fill={`url(#${ar ? 'glossGradAr' : 'glossGrad'})`} x="510" y="438" width="34" height="20" rx="3"/>
        </g>

        {(look.finish === 'Glitter' || look.accent) && (
          <g className="sparkle-layer">
            <circle cx="228" cy="276" r="3" fill="#fff"/>
            <circle cx="336" cy="239" r="2.5" fill="#fff"/>
            <circle cx="453" cy="300" r="2.2" fill="#fff"/>
            <circle cx="161" cy="356" r="2.2" fill="#fff"/>
            <circle cx="526" cy="431" r="1.8" fill="#fff"/>
            <circle cx="244" cy="312" r="1.7" fill="#fff8dc"/>
            <circle cx="350" cy="286" r="1.9" fill="#fff8dc"/>
            <circle cx="432" cy="338" r="1.6" fill="#fff8dc"/>
          </g>
        )}
      </svg>
    </div>
  );
}
