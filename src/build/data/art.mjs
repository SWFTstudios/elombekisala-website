// Line art as inline SVG, in a technical-drawing style: object lines (.d),
// dimension/guide lines (.g), an accent mark (.a) and mono labels (.t).
// Every stroked shape gets pathLength="1" so CSS can draw it in on scroll.
// Previews (preview*) also loop small SMIL animations.

const withLen = s => s.replace(/<(path|line|rect|circle|ellipse|polyline|polygon)\b(?![^>]*pathLength)([^>]*class="(?:d|g)[^"]*")/g, '<$1 pathLength="1"$2');
const wrap = (vb, inner, label) => withLen(`<svg class="art" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);

// Dimension line with end ticks and a label.
const dim = (x1, y1, x2, y2, label, lx, ly) => `<line class="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>` +
  (y1 === y2 ? `<line class="g" x1="${x1}" y1="${y1 - 5}" x2="${x1}" y2="${y1 + 5}"/><line class="g" x1="${x2}" y1="${y2 - 5}" x2="${x2}" y2="${y2 + 5}"/>`
    : `<line class="g" x1="${x1 - 5}" y1="${y1}" x2="${x1 + 5}" y2="${y1}"/><line class="g" x1="${x2 - 5}" y1="${y2}" x2="${x2 + 5}" y2="${y2}"/>`) +
  (label ? `<text class="t" x="${lx}" y="${ly}">${label}</text>` : '');

export const art = {
  browser: () => wrap('0 0 400 300', `
    <rect class="d" x="70" y="55" width="260" height="180" rx="8"/>
    <line class="d" x1="70" y1="78" x2="330" y2="78"/>
    <circle class="d" cx="84" cy="66" r="3"/><circle class="d" cx="96" cy="66" r="3"/><circle class="d" cx="108" cy="66" r="3"/>
    <rect class="d" x="88" y="94" width="120" height="14" rx="2"/>
    <line class="d" x1="88" y1="122" x2="190" y2="122"/><line class="d" x1="88" y1="132" x2="176" y2="132"/>
    <rect class="d" x="88" y="148" width="54" height="16" rx="8"/>
    <rect class="d" x="222" y="94" width="92" height="70" rx="4"/>
    <path class="d" d="M222 150 L250 124 L270 142 L286 128 L314 152"/>
    <rect class="d" x="88" y="180" width="70" height="40" rx="3"/><rect class="d" x="166" y="180" width="70" height="40" rx="3"/><rect class="d" x="244" y="180" width="70" height="40" rx="3"/>
    ${dim(70, 255, 330, 255, '1440', 186, 272)}${dim(350, 55, 350, 235, '', 0, 0)}
    <line class="g" x1="40" y1="140" x2="360" y2="140" stroke-dasharray="3 5"/>
    <path class="d" d="M266 196 l0 18 l5 -5 l4 9 l3 -1 l-4 -9 l7 0 z"/>
    <circle class="a" cx="115" cy="156" r="4"/>`, 'Website wireframe'),

  storefront: () => wrap('0 0 400 300', `
    <path class="d" d="M80 110 L100 70 L300 70 L320 110"/>
    <path class="d" d="M80 110 q20 22 40 0 q20 22 40 0 q20 22 40 0 q20 22 40 0 q20 22 40 0 q20 22 40 0"/>
    <line class="d" x1="120" y1="70" x2="112" y2="110"/><line class="d" x1="160" y1="70" x2="156" y2="110"/><line class="d" x1="200" y1="70" x2="200" y2="110"/><line class="d" x1="240" y1="70" x2="244" y2="110"/><line class="d" x1="280" y1="70" x2="288" y2="110"/>
    <rect class="d" x="92" y="130" width="216" height="110"/>
    <rect class="d" x="108" y="146" width="90" height="70"/><rect class="d" x="214" y="146" width="40" height="94"/>
    <path class="d" d="M126 196 l12 -24 h24 l12 24 z"/><path class="d" d="M140 172 q10 -14 20 0"/>
    <circle class="d" cx="246" cy="196" r="2"/>
    ${dim(92, 258, 308, 258, 'storefront', 168, 276)}
    <line class="g" x1="200" y1="40" x2="200" y2="64" stroke-dasharray="2 4"/>
    <circle class="a" cx="150" cy="186" r="4"/>`, 'Storefront'),

  stack: () => wrap('0 0 400 300', `
    <rect class="d" x="120" y="60" width="180" height="120" rx="6"/>
    <rect class="d" x="100" y="85" width="180" height="120" rx="6"/>
    <rect class="d" x="80" y="110" width="180" height="120" rx="6"/>
    <line class="d" x1="80" y1="130" x2="260" y2="130"/>
    <circle class="d" cx="130" cy="180" r="18"/><circle class="d" cx="210" cy="160" r="12"/><circle class="d" cx="210" cy="205" r="9"/>
    <line class="d" x1="148" y1="176" x2="198" y2="163"/><line class="d" x1="146" y1="188" x2="201" y2="203"/>
    <path class="g" d="M260 150 C 320 150, 330 230, 290 250" stroke-dasharray="3 5"/>
    <text class="t" x="300" y="268">api · d1</text>
    ${dim(80, 250, 260, 250, '', 0, 0)}
    <circle class="a" cx="130" cy="180" r="4"/>`, 'Layered app windows'),

  phone: () => wrap('0 0 400 300', `
    <rect class="d" x="150" y="40" width="100" height="210" rx="18"/>
    <rect class="d" x="182" y="50" width="36" height="9" rx="4.5"/>
    <path class="g" d="M160 120 h80 M160 160 h80 M160 200 h80 M185 70 v170 M215 70 v170" stroke-dasharray="2 5"/>
    <path class="d" d="M168 228 C 180 190, 220 200, 205 150 S 196 96, 222 86"/>
    <circle class="d" cx="222" cy="86" r="22"/>
    <circle class="g" cx="222" cy="86" r="34" stroke-dasharray="3 4"/>
    <path class="d" d="M222 74 a8 8 0 0 1 8 8 c0 7 -8 14 -8 14 s-8 -7 -8 -14 a8 8 0 0 1 8 -8z"/>
    ${dim(270, 40, 270, 250, '', 0, 0)}<text class="t" x="280" y="150">0.50 mi</text>
    <circle class="a" cx="168" cy="228" r="4"><animateMotion dur="6s" repeatCount="indefinite" path="M0 0 C 12 -38, 52 -28, 37 -78 S 28 -132, 54 -142"/></circle>`, 'Phone with a geofenced route'),

  dashboard: () => wrap('0 0 400 300', `
    <rect class="d" x="60" y="50" width="280" height="190" rx="8"/>
    <line class="d" x1="120" y1="50" x2="120" y2="240"/>
    <line class="d" x1="74" y1="74" x2="106" y2="74"/><line class="d" x1="74" y1="92" x2="100" y2="92"/><line class="d" x1="74" y1="110" x2="104" y2="110"/><line class="d" x1="74" y1="128" x2="96" y2="128"/>
    <rect class="d" x="136" y="66" width="58" height="36" rx="3"/><rect class="d" x="204" y="66" width="58" height="36" rx="3"/><rect class="d" x="272" y="66" width="54" height="36" rx="3"/>
    <path class="d" d="M140 210 L170 180 L196 192 L228 150 L258 164 L290 124 L322 136"/>
    <line class="g" x1="136" y1="222" x2="326" y2="222"/><line class="g" x1="136" y1="118" x2="136" y2="222"/>
    <text class="t" x="270" y="262">role: client · admin</text>
    <circle class="a" cx="290" cy="124" r="4"/>`, 'Dashboard'),

  cards: () => wrap('0 0 400 300', `
    <rect class="d" x="90" y="80" width="150" height="100" rx="8" transform="rotate(-8 165 130)"/>
    <rect class="d" x="140" y="100" width="170" height="110" rx="8"/>
    <text class="t" x="168" y="150" style="font-size:18px;letter-spacing:0">Mbote!</text>
    <line class="d" x1="168" y1="168" x2="270" y2="168"/>
    <rect class="d" x="160" y="182" width="44" height="14" rx="7"/><rect class="d" x="212" y="182" width="44" height="14" rx="7"/>
    <path class="g" d="M310 150 C 350 150, 350 90, 300 80" stroke-dasharray="3 5"/>
    <path class="d" d="M296 74 l6 6 l-8 4"/>
    <text class="t" x="296" y="64">flip</text>
    ${dim(140, 230, 310, 230, 'review · day 3', 186, 248)}
    <circle class="a" cx="182" cy="189" r="4"/>`, 'Study cards'),

  calendar: () => wrap('0 0 400 300', `
    <rect class="d" x="70" y="70" width="150" height="150" rx="6"/>
    <line class="d" x1="70" y1="100" x2="220" y2="100"/>
    <line class="d" x1="100" y1="58" x2="100" y2="82"/><line class="d" x1="190" y1="58" x2="190" y2="82"/>
    <path class="g" d="M70 140 h150 M70 180 h150 M107 100 v120 M145 100 v120 M182 100 v120" stroke-dasharray="2 4"/>
    <rect class="d" x="230" y="120" width="110" height="70" rx="8"/>
    <line class="d" x1="230" y1="140" x2="340" y2="140"/>
    <line class="d" x1="244" y1="168" x2="284" y2="168"/><line class="d" x1="300" y1="168" x2="324" y2="168"/>
    <path class="g" d="M182 160 C 200 160, 205 150, 228 150" stroke-dasharray="3 4"/>
    <text class="t" x="232" y="214">deposit · 50%</text>
    <circle class="a" cx="164" cy="160" r="5"/>`, 'Calendar and card'),

  flow: () => wrap('0 0 400 300', `
    <rect class="d" x="40" y="128" width="64" height="44" rx="6"/><rect class="d" x="168" y="80" width="64" height="44" rx="6"/><rect class="d" x="168" y="176" width="64" height="44" rx="6"/><rect class="d" x="296" y="128" width="64" height="44" rx="6"/>
    <path class="d" d="M104 140 C 136 140, 136 102, 168 102"/><path class="d" d="M104 160 C 136 160, 136 198, 168 198"/>
    <path class="d" d="M232 102 C 264 102, 264 140, 296 140"/><path class="d" d="M232 198 C 264 198, 264 160, 296 160"/>
    <text class="t" x="52" y="194">form</text><text class="t" x="178" y="72">crm</text><text class="t" x="174" y="240">email</text><text class="t" x="304" y="194">follow-up</text>
    <circle class="a" r="4"><animateMotion dur="4s" repeatCount="indefinite" path="M104 140 C 136 140, 136 102, 168 102 L232 102 C 264 102, 264 140, 296 140"/></circle>`, 'Automation flow'),

  cms: () => wrap('0 0 400 300', `
    <rect class="d" x="70" y="50" width="180" height="200" rx="6"/>
    <rect class="d" x="86" y="70" width="148" height="40" rx="3"/>
    <rect class="d" x="86" y="120" width="70" height="56" rx="3"/><rect class="d" x="164" y="120" width="70" height="56" rx="3"/>
    <line class="d" x1="86" y1="192" x2="234" y2="192"/><line class="d" x1="86" y1="204" x2="210" y2="204"/><line class="d" x1="86" y1="216" x2="222" y2="216"/>
    <rect class="d" x="270" y="90" width="80" height="26" rx="4"/><rect class="d" x="270" y="126" width="80" height="26" rx="4"/><rect class="d" x="270" y="162" width="80" height="26" rx="4"/>
    <path class="g" d="M270 103 C 250 103, 250 90, 234 90" stroke-dasharray="3 4"/>
    <text class="t" x="276" y="208">blocks</text><text class="t" x="70" y="272">draft · v12 · live preview</text>
    <circle class="a" cx="281" cy="139" r="4"/>`, 'Content editor with blocks'),

  migrate: () => wrap('0 0 400 300', `
    <rect class="d" x="50" y="90" width="110" height="120" rx="6"/>
    <rect class="d" x="240" y="90" width="110" height="120" rx="6"/>
    <path class="g" d="M66 120 h78 M66 140 h60 M66 160 h70 M256 120 h78 M256 140 h60 M256 160 h70"/>
    <path class="d" d="M168 150 H 232"/><path class="d" d="M222 140 l10 10 l-10 10"/>
    <text class="t" x="68" y="232">before</text><text class="t" x="258" y="232">after</text>
    <path class="g" d="M105 90 C 105 40, 295 40, 295 90" stroke-dasharray="3 5"/>
    <text class="t" x="166" y="44">seo · redirects</text>
    <circle class="a" r="4"><animateMotion dur="3s" repeatCount="indefinite" path="M168 150 H 232"/></circle>`, 'Migration'),

  gauge: () => wrap('0 0 400 300', `
    <path class="d" d="M90 210 A 110 110 0 0 1 310 210"/>
    <path class="g" d="M110 210 A 90 90 0 0 1 290 210" stroke-dasharray="2 6"/>
    <line class="d" x1="200" y1="210" x2="270" y2="140"/>
    <circle class="d" cx="200" cy="210" r="8"/>
    <line class="d" x1="90" y1="210" x2="104" y2="210"/><line class="d" x1="200" y1="100" x2="200" y2="114"/><line class="d" x1="296" y1="210" x2="310" y2="210"/>
    <text class="t" x="84" y="234">slow</text><text class="t" x="286" y="234">fast</text><text class="t" x="176" y="262">lcp · 1.2s</text>
    <circle class="a" cx="270" cy="140" r="5"/>`, 'Speed gauge'),

  orbit: () => wrap('0 0 400 300', `
    <circle class="d" cx="170" cy="150" r="70"/><circle class="d" cx="240" cy="150" r="70"/>
    <ellipse class="g" cx="205" cy="150" rx="150" ry="46" stroke-dasharray="3 5"/>
    <circle class="d" cx="170" cy="150" r="4"/><circle class="d" cx="240" cy="150" r="4"/>
    <text class="t" x="128" y="246">your team</text><text class="t" x="250" y="246">me</text>
    <circle class="a" r="5"><animateMotion dur="9s" repeatCount="indefinite" path="M55 150 a150 46 0 1 0 300 0 a150 46 0 1 0 -300 0"/></circle>`, 'Two overlapping circles')
};

// ---------- animated previews for the featured editor section ----------
export const preview = {
  'built-by-me-ez': () => wrap('0 0 600 380', `
    ${['Package page', 'Stripe', 'Worker', 'Cal.com', 'Airtable'].map((l, i) => `<rect class="d" x="${20 + i * 116}" y="150" width="96" height="56" rx="8"/><text class="t" x="${30 + i * 116}" y="183">${l}</text>`).join('')}
    ${[0, 1, 2, 3].map(i => `<line class="g" x1="${116 + i * 116}" y1="178" x2="${136 + i * 116}" y2="178"/>`).join('')}
    <text class="t" x="252" y="246">credits: <tspan><animate attributeName="opacity" values="1;1" dur="1s"/>8 → 7</tspan></text>
    <text class="t" x="20" y="120">// pay → book → crm</text>
    <circle class="a" r="6" cy="0"><animateMotion dur="5s" repeatCount="indefinite" path="M68 178 H 532"/></circle>
    <path class="g" d="M68 230 C 68 300, 532 300, 532 230" stroke-dasharray="3 6"/>
    <text class="t" x="232" y="320">lead saved if they’re not ready</text>`, 'Payment to booking to CRM flow'),

  'snooze-lane': () => wrap('0 0 600 380', `
    <path class="g" d="M0 80 H600 M0 160 H600 M0 240 H600 M0 320 H600 M100 0 V380 M220 0 V380 M340 0 V380 M460 0 V380" stroke-dasharray="2 6"/>
    <path class="d" id="sl-route" d="M40 340 C 120 300, 140 220, 230 210 S 330 150, 380 120 S 470 70, 520 70"/>
    <circle class="d" cx="520" cy="70" r="26"/>
    <circle class="g" cx="520" cy="70" r="26"><animate attributeName="r" values="26;60" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite"/></circle>
    <text class="t" x="420" y="128">alarm @ 0.50 mi</text>
    <text class="t" x="40" y="40">MTA · NJ Transit · PATH</text>
    <circle class="a" r="7"><animateMotion dur="7s" repeatCount="indefinite" path="M40 340 C 120 300, 140 220, 230 210 S 330 150, 380 120 S 470 70, 520 70"/></circle>`, 'Route with a geofenced destination'),

  'only-at-the-kiosk': () => {
    let dots = '';
    for (let lat = -70; lat <= 70; lat += 14) for (let lon = -180; lon < 180; lon += 14) {
      const x = 300 + 140 * Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180);
      const z = Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180);
      if (z > 0) dots += `<circle cx="${x.toFixed(1)}" cy="${(190 - 140 * Math.sin(lat * Math.PI / 180)).toFixed(1)}" r="${(1 + z * 1.6).toFixed(2)}" class="dotf" opacity="${(0.25 + z * 0.75).toFixed(2)}"/>`;
    }
    return wrap('0 0 600 380', `
    <circle class="d" cx="300" cy="190" r="140"/>
    <ellipse class="g" cx="300" cy="190" rx="140" ry="40"/>
    <ellipse class="g" cx="300" cy="190" rx="70" ry="140"><animate attributeName="rx" values="140;0;140" dur="10s" repeatCount="indefinite"/></ellipse>
    <g>${dots}</g>
    <circle class="a" cx="356" cy="150" r="6"/>
    <circle class="g" cx="356" cy="150" r="6"><animate attributeName="r" values="6;30" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/></circle>
    <text class="t" x="380" y="140">you are here</text>`, 'Dotted globe with a visitor beacon');
  },

  'learn-lingala': () => wrap('0 0 600 380', `
    <rect class="d" x="60" y="60" width="220" height="140" rx="12"/>
    <text class="t" x="84" y="122" style="font-size:22px;letter-spacing:0">Nalingi lipa.</text>
    <text class="t" x="84" y="160">na · ling · i · lipa</text>
    <rect class="d" x="320" y="70" width="210" height="40" rx="20"/><text class="t" x="340" y="95">Mbote! Ozali malamu?</text>
    <g opacity="0"><rect class="d" x="360" y="130" width="170" height="40" rx="20"/><text class="t" x="380" y="155">Nazali malamu.</text><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.3;.4;.9;1" dur="6s" repeatCount="indefinite"/></g>
    <g opacity="0"><rect class="d" x="320" y="190" width="150" height="40" rx="20"/><text class="t" x="340" y="215">Malamu mingi!</text><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.55;.65;.9;1" dur="6s" repeatCount="indefinite"/></g>
    ${dim(60, 240, 280, 240, '227 phrases · 5 levels', 92, 262)}
    <circle class="a" cx="94" cy="300" r="6"/><text class="t" x="110" y="305">12-day streak</text>`, 'Study card and chat practice'),

  'finish-library': () => wrap('0 0 600 380', `
    <path class="d" d="M230 120 L300 80 L370 120 L370 220 L300 260 L230 220 Z"/>
    <path class="d" d="M230 120 L300 160 L370 120 M300 160 L300 260"/>
    <path class="g" d="M200 120 L300 62 L400 120 M200 232 L300 290 L400 232" stroke-dasharray="3 5"/>
    ${['ceramic', 'glass', 's. steel', 'plastic'].map((l, i) => `<rect class="d" x="${60 + i * 130}" y="20" width="110" height="28" rx="14"/><text class="t" x="${78 + i * 130}" y="39">${l}</text>`).join('')}
    ${[0, 1, 2, 3].map(i => `<circle cx="470" cy="${150 + i * 40}" r="14" class="sw"><animate attributeName="fill" values="${['#7fb069;#5b8bd6;#c97b5b;#d9c36a;#7fb069', '#5b8bd6;#c97b5b;#d9c36a;#7fb069;#5b8bd6', '#c97b5b;#d9c36a;#7fb069;#5b8bd6;#c97b5b', '#d9c36a;#7fb069;#5b8bd6;#c97b5b;#d9c36a'][i]}" dur="8s" repeatCount="indefinite"/></circle>`).join('')}
    <text class="t" x="430" y="330">108 finishes</text>
    <circle class="a" cx="300" cy="160" r="6"/>`, 'Wireframe product with finish swatches'),

  fizz: () => wrap('0 0 600 380', `
    <path class="d" d="M268 40 h64 v26 h-64 z"/>
    <path class="d" d="M262 66 h76 c10 0 16 8 16 18 v250 c0 14 -10 22 -22 22 h-64 c-12 0 -22 -8 -22 -22 v-250 c0 -10 6 -18 16 -18 z"/>
    <line class="g" x1="254" y1="110" x2="346" y2="110" stroke-dasharray="3 4"/>
    ${[[280, 0], [300, 1.2], [318, 2.1], [290, 3], [312, .6], [296, 2.6]].map(([x, d]) => `<circle class="bub" cx="${x}" cy="330" r="4"><animate attributeName="cy" values="330;120" dur="3.4s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="3.4s" begin="${d}s" repeatCount="indefinite"/></circle>`).join('')}
    ${dim(380, 40, 380, 356, '', 0, 0)}<text class="t" x="392" y="200">20 oz · no cans</text>
    <text class="t" x="120" y="200">co₂ refill</text><path class="g" d="M190 196 H 250" stroke-dasharray="3 4"/>
    <circle class="a" cx="300" cy="53" r="5"/>`, 'Bottle with rising bubbles')
};
