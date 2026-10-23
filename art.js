/* Original SVG illustrations: glossy teeth for treatments, flat doctor portraits,
   smiles for the before/after gallery, and simple x-ray images. */
(function () {
  let gid = 0;
  const TOOTH = 'M30 12C15 12 8 27 10 42C12 56 18 63 20 80C22 95 30 98 33 86C35 76 38 69 50 69C62 69 65 76 67 86C70 98 78 95 80 80C82 63 88 56 90 42C92 27 85 12 70 12C60 12 58 18 50 18C42 18 40 12 30 12Z';
  const CROWN = 'M30 12C15 12 8 27 10 42C12 56 18 66 26 72L74 72C82 66 88 56 90 42C92 27 85 12 70 12C60 12 58 18 50 18C42 18 40 12 30 12Z';
  const spark = (x, y, s, o) => '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M0-10l2.6 7.4 7.4 2.6-7.4 2.6L0 10l-2.6-7.4L-10 0l7.4-2.6z" fill="#fff" opacity="' + (o || 1) + '"/>';

  function tooth(kind) {
    const id = 'tg' + (gid++);
    let extra = '';
    let body = TOOTH;
    if (kind === 'white') extra = spark(86, 14, 1, 1) + spark(14, 10, 0.6, 0.85) + spark(94, 50, 0.45, 0.8);
    if (kind === 'braces') extra = '<rect x="22" y="36" width="14" height="12" rx="3" fill="#9AA9B8"/><rect x="43" y="34" width="14" height="12" rx="3" fill="#9AA9B8"/><rect x="64" y="36" width="14" height="12" rx="3" fill="#9AA9B8"/><path d="M10 43Q50 36 92 43" stroke="#6E7F90" stroke-width="2.4" fill="none"/>';
    if (kind === 'implant') { body = CROWN; extra = '<g transform="translate(38 70)"><rect width="24" height="34" rx="5" fill="url(#m' + id + ')"/>' + [4, 11, 18, 25].map((y) => '<rect x="-3" y="' + y + '" width="30" height="3.5" rx="1.5" fill="#8C9BAA"/>').join('') + '</g>'; }
    if (kind === 'crown') { body = CROWN; extra = '<path d="M20 30L32 44L50 24L68 44L80 30" stroke="#E0A33B" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/><rect x="24" y="72" width="52" height="8" rx="4" fill="#C9D6E2"/>'; }
    if (kind === 'clean') extra = '<circle cx="86" cy="18" r="7" fill="#fff" opacity=".9"/><circle cx="95" cy="33" r="4" fill="#fff" opacity=".75"/><circle cx="12" cy="20" r="5" fill="#fff" opacity=".8"/>';
    if (kind === 'kid') extra = '<circle cx="38" cy="40" r="3.6" fill="#1B2B4F"/><circle cx="62" cy="40" r="3.6" fill="#1B2B4F"/><path d="M40 51Q50 60 60 51" stroke="#1B2B4F" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="30" cy="50" r="4" fill="#F4A5B5" opacity=".7"/><circle cx="70" cy="50" r="4" fill="#F4A5B5" opacity=".7"/>';
    if (kind === 'root') extra = '<path d="M33 82C36 64 40 50 50 40C60 50 64 64 67 82" stroke="#E07A7A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>';
    if (kind === 'fill') extra = '<path d="M36 26C42 22 58 22 64 26C62 34 38 34 36 26Z" fill="#9FB8CC"/>';
    if (kind === 'ext') extra = '<path d="M50 -2V8M44 2L50 -4L56 2" stroke="#3FA987" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<svg viewBox="0 -6 104 118" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="35%" cy="25%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#EEF5FA"/><stop offset="1" stop-color="#BFD3E2"/></radialGradient><linearGradient id="m' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#C5D0DA"/><stop offset=".5" stop-color="#F2F5F8"/><stop offset="1" stop-color="#A9B6C2"/></linearGradient></defs><ellipse cx="52" cy="108" rx="34" ry="5" fill="#000" opacity=".12"/><path d="' + body + '" fill="url(#' + id + ')" stroke="#B4C7D6" stroke-width="1"/><path d="M26 20C20 22 16 30 17 40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>' + extra + '</svg>';
  }

  /* flat doctor / person portrait */
  function person(p, mode) {
    const id = 'pg' + (gid++);
    const back = p.f ? '<path d="M64 92C58 46 142 46 136 92L142 156C126 166 74 166 58 156Z" fill="' + p.hair + '"/>' : '';
    const top = p.f
      ? '<path d="M69 90C66 54 134 50 131 88C122 70 104 62 86 70C78 74 72 80 69 90Z" fill="' + p.hair + '"/>'
      : '<path d="M69 88C64 50 136 48 131 88C129 72 120 64 100 64C82 64 72 72 69 88Z" fill="' + p.hair + '"/>';
    const beard = p.beard ? '<path d="M72 96C74 128 126 128 128 96C124 112 112 116 100 116C88 116 76 112 72 96Z" fill="' + p.hair + '" opacity=".92"/>' : '';
    const coat = p.coat === false
      ? '<path d="M18 210C22 160 56 140 100 140C144 140 178 160 182 210Z" fill="' + p.shirt + '"/>'
      : '<path d="M18 210C22 160 56 140 100 140C144 140 178 160 182 210Z" fill="url(#c' + id + ')"/><path d="M84 140L100 176L116 140Z" fill="' + p.shirt + '"/>' + (p.tie ? '<path d="M96 146L104 146L106 172L100 180L94 172Z" fill="' + p.tie + '"/>' : '') + '<path d="M84 140L100 182L76 160Z" fill="#EEF3F7"/><path d="M116 140L100 182L124 160Z" fill="#EEF3F7"/><path d="M74 146C66 170 78 186 92 180" stroke="#2F3B4A" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="92" cy="180" r="4.5" fill="#8C9BAA"/>';
    const face = '<path d="M84 80Q90 76 95 79M105 79Q110 76 116 80" stroke="' + p.hair + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="88" rx="2.8" ry="3.3" fill="#2A2420"/><ellipse cx="110" cy="88" rx="2.8" ry="3.3" fill="#2A2420"/><path d="M100 92Q97 100 101 102" stroke="' + p.skin2 + '" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M92 108Q100 114 108 108" stroke="#A4574F" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="' + (mode || 'xMidYMax slice') + '" aria-hidden="true"><defs><linearGradient id="b' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.bg[0] + '"/><stop offset="1" stop-color="' + p.bg[1] + '"/></linearGradient><linearGradient id="c' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#DCE5EC"/></linearGradient></defs>' +
      '<rect x="-200" y="-200" width="600" height="600" fill="url(#b' + id + ')"/><circle cx="160" cy="40" r="60" fill="#fff" opacity=".08"/><circle cx="30" cy="170" r="50" fill="#fff" opacity=".06"/>' +
      back + '<rect x="88" y="112" width="24" height="30" rx="8" fill="' + p.skin2 + '"/>' + coat +
      '<ellipse cx="100" cy="90" rx="30" ry="35" fill="' + p.skin + '"/><ellipse cx="70" cy="94" rx="5" ry="8" fill="' + p.skin2 + '"/><ellipse cx="130" cy="94" rx="5" ry="8" fill="' + p.skin2 + '"/>' +
      beard + top + face + '</svg>';
  }

  /* smile for the before/after gallery; shade: 0 = stained, 1 = white */
  function smile(shade, gap) {
    const c = shade ? '#FFFFFF' : '#E7D6A6';
    return '<svg viewBox="0 0 120 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="120" height="76" fill="' + (shade ? '#F3E8E4' : '#EADBD6') + '"/><path d="M14 30Q60 6 106 30Q60 66 14 30Z" fill="#C46A6E"/><path d="M22 32Q60 18 98 32Q60 52 22 32Z" fill="#6E1F2B"/>' +
      [0, 1, 2, 3, 4, 5].map((k) => '<rect x="' + (30 + k * 10 + (gap && k > 2 ? 2 : 0)) + '" y="' + (25 + Math.abs(2.5 - k) * 1.2) + '" width="' + (gap ? 8 : 9) + '" height="11" rx="3" fill="' + c + '"/>').join('') + '</svg>';
  }

  /* simple radiograph images */
  function xray(kind) {
    const id = 'xr' + (gid++);
    if (kind === 'pano') {
      const teeth = [];
      for (let k = 0; k < 14; k++) {
        const x = 22 + k * 11.5, up = 48 - Math.sin(k / 13 * Math.PI) * 6, lo = 70 + Math.sin(k / 13 * Math.PI) * 6;
        teeth.push('<rect x="' + x + '" y="' + (up - 24) + '" width="9" height="24" rx="4" fill="#DCE3E8" opacity="' + (0.55 + (k % 3) * 0.12) + '"/><rect x="' + x + '" y="' + lo + '" width="9" height="24" rx="4" fill="#DCE3E8" opacity="' + (0.55 + ((k + 1) % 3) * 0.12) + '"/>');
      }
      return '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#3A4450"/><stop offset="1" stop-color="#0B0F14"/></radialGradient></defs><rect width="200" height="120" fill="url(#' + id + ')"/><path d="M14 30Q100 -6 186 30L186 50Q100 18 14 50Z" fill="#8A96A0" opacity=".35"/><path d="M14 92Q100 128 186 92L186 74Q100 104 14 74Z" fill="#8A96A0" opacity=".35"/>' + teeth.join('') + '<rect x="114" y="74" width="9" height="24" rx="4" fill="#fff" opacity=".95"/><text x="8" y="114" font-size="8" fill="#9AA5AE" font-family="monospace">PANO · R</text></svg>';
    }
    return '<svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#46515C"/><stop offset="1" stop-color="#0B0F14"/></radialGradient></defs><rect width="120" height="120" fill="url(#' + id + ')"/>' +
      '<g transform="translate(18 14) scale(.82)" opacity=".85"><path d="' + TOOTH + '" fill="#C9D2D9"/></g><g transform="translate(-34 18) scale(.7)" opacity=".5"><path d="' + TOOTH + '" fill="#C9D2D9"/></g><g transform="translate(82 18) scale(.7)" opacity=".5"><path d="' + TOOTH + '" fill="#C9D2D9"/></g>' +
      (kind === 'rct' ? '<path d="M46 86C48 72 52 62 59 54C66 62 70 72 72 86" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>' : '') + '<text x="6" y="114" font-size="8" fill="#9AA5AE" font-family="monospace">PA · 36</text></svg>';
  }

  /* Bite mark (logo) */
  const logo = (s) => '<svg viewBox="0 0 64 64" width="' + (s || 40) + '" height="' + (s || 40) + '" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#1B2B4F"/><text x="30" y="45" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="36" fill="#fff" text-anchor="middle">B</text><circle cx="49" cy="20" r="5" fill="#67CDAB"/></svg>';

  window.ART = { tooth, person, smile, xray, logo };
})();
