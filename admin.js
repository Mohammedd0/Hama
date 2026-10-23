/* Bite admin — edits the patient app's content. Saves a draft in this browser; "Publish" exports content.js. */
(function () {
  const KEY = 'bite_content_v1';
  const D = window.DATA;
  const BUDGET = 2400000; /* characters the browser reliably keeps in localStorage */
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s);
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, p, v) => { const ks = p.split('.'), l = ks.pop(); ks.reduce((a, k) => a[k], o)[l] = v; };

  let C = { v: 1, promos: clone(D.PROMOS), doctors: clone(D.DOCTORS), services: clone(D.SERVICES), reviews: clone(D.REVIEWS), clinic: clone(D.CLINIC), tiles: clone(D.TILES) };
  C.promos.forEach((p) => { if (!p.theme) p.theme = 'navy'; });
  let tab = 'promos';
  const open = new Set();
  let hasDraft = false;
  try { hasDraft = !!localStorage.getItem(KEY); } catch (e) { /* ignore */ }

  const TABS = [['promos', 'هەواڵ و ڕیکلام'], ['doctors', 'دکتۆرەکان'], ['services', 'چارەسەرەکان'], ['reviews', 'هەڵسەنگاندن'], ['brand', 'ڕەنگ و لۆگۆ'], ['tiles', 'وێنەکانی سەرەکی'], ['clinic', 'کلینیک'], ['publish', 'بڵاوکردنەوە']];
  const DAYS = [[6, 'شەممە'], [0, 'یەکشەممە'], [1, 'دووشەممە'], [2, 'سێشەممە'], [3, 'چوارشەممە'], [4, 'پێنجشەممە'], [5, 'هەینی']];
  const CATS = D.CATS;
  const ARTS = [['clean', 'پاککردنەوە'], ['white', 'سپیکردنەوە'], ['fill', 'پڕکردنەوە'], ['root', 'ڕەگ'], ['crown', 'کراون'], ['braces', 'تەل'], ['implant', 'ئیمپلانت'], ['ext', 'هەڵکێشان'], ['kid', 'منداڵان']];
  const THEME_NAMES = Object.keys(D.THEMES);

  /* ---------- saving ---------- */
  let st;
  function size() { return JSON.stringify(C).length; }
  function status(msg, err) { const s = $('#state'); s.textContent = msg; s.className = 'state' + (err ? ' err' : ''); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(C)); hasDraft = true; status('ڕەشنووس پاشەکەوت کرا'); }
    catch (e) { status('شوێن پڕ بووە! وێنەکان بچووکتر بکە', true); toast('شوێنی پاشەکەوتکردن پڕ بووە. وێنەیەک لابەرە.', true); }
  }
  const saveSoon = () => { clearTimeout(st); st = setTimeout(save, 250); };
  function toast(t, err) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (err ? ' err' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => { e.className = 'toast'; }, 2600); }

  /* ---------- field helpers ---------- */
  const val = (p) => esc(get(C, p));
  const tx = (label, p, o) => { o = o || {}; return '<label class="f"><span>' + label + '</span><input type="' + (o.type || 'text') + '" data-b="' + p + '"' + (o.num ? ' data-num="1"' : '') + (o.step ? ' step="' + o.step + '"' : '') + (o.dir ? ' class="ltr"' : '') + ' value="' + val(p) + '"' + (o.ph ? ' placeholder="' + o.ph + '"' : '') + '></label>'; };
  const pair = (label, p, area) => '<div class="f"><span>' + label + '</span><div class="pair">' +
    ['en', 'ku'].map((l, k) => (area ? '<div><textarea data-b="' + p + '.' + k + '" data-l="' + l + '" placeholder="' + (k ? 'کوردی' : 'English') + '">' + val(p + '.' + k) + '</textarea></div>'
      : '<div><input type="text" data-b="' + p + '.' + k + '" data-l="' + l + '" placeholder="' + (k ? 'کوردی' : 'English') + '" value="' + val(p + '.' + k) + '"></div>')).join('') + '</div></div>';
  const sel = (label, p, opts) => '<label class="f"><span>' + label + '</span><select data-b="' + p + '">' + opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (String(get(C, p)) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
  const chk = (label, p) => '<div class="checks"><label><input type="checkbox" data-b="' + p + '" data-chk="1"' + (get(C, p) ? ' checked' : '') + '>' + label + '</label></div>';
  const group = (label, p, opts) => '<div class="f"><span>' + label + '</span><div class="checks">' + opts.map(([v, t]) => '<label><input type="checkbox" data-arr="' + p + '" data-val="' + esc(v) + '"' + ((get(C, p) || []).map(String).includes(String(v)) ? ' checked' : '') + '>' + esc(t) + '</label>').join('') + '</div></div>';
  const SPEC = { svc: [600, 600, 0.5, 0.8], wel: [900, 640, 0.5, 0.8], tile: [600, 520, 0.5, 0.8], doc: [700, 700, 0.2, 0.8], promo: [800, 400, 0.5, 0.8], gal: [520, 360, 0.5, 0.78] };
  let fid = 0;
  const photo = (label, p, spec, hint) => { const v = get(C, p), id = 'f' + (++fid); return '<div class="f"><span>' + label + '</span><div class="pbox"><label for="' + id + '" class="thumb ' + spec + '"' + (v ? ' style="background-image:url(' + v + ')"' : '') + '>' + (v ? '' : '<span class="plus">＋<small>وێنە</small></span>') + '</label><div><label for="' + id + '" class="btn soft sm">' + (v ? 'گۆڕینی وێنە' : 'هەڵبژاردنی وێنە') + '</label><input id="' + id + '" class="vh" type="file" accept="image/*" data-img="' + p + '" data-spec="' + spec + '">' + (v ? ' <button class="btn ghost sm" data-act="clr" data-p="' + p + '">لابردن</button>' : '') + (hint ? '<div class="hint" style="margin:6px 0 0">' + hint + '</div>' : '') + '</div></div></div>'; };

  /* ---------- cards ---------- */
  const chev = '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
  const card = (key, av, title, sub, body, o) => { o = o || {}; return '<div class="card' + (open.has(key) ? ' open' : '') + (o.hid ? ' hid' : '') + '"><button class="ch" data-act="tg" data-k="' + key + '">' + av + '<span class="tt"><b' + (o.tp ? ' data-t="' + o.tp + '"' : '') + '>' + esc(title) + '</b><small>' + esc(sub) + '</small></span>' + (o.badge ? '<span class="badge">' + o.badge + '</span>' : '') + chev + '</button><div class="body">' + body + '</div></div>'; };
  const av = (src, txt) => '<span class="av"' + (src ? ' style="background-image:url(' + src + ')"' : '') + '>' + (src ? '' : esc((txt || '·').trim().charAt(0))) + '</span>';
  const btns = (i, n, key, extra) => '<div class="row">' + (key ? '<button class="btn ghost sm" data-act="up" data-k="' + key + '" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + '>↑ سەرەوە</button><button class="btn ghost sm" data-act="dn" data-k="' + key + '" data-i="' + i + '"' + (i === n - 1 ? ' disabled' : '') + '>↓ خوارەوە</button>' : '') + (extra || '') + '</div>';

  const swatches = (p) => '<div class="f"><span>ڕەنگی پێشخان</span><div class="sw">' + THEME_NAMES.map((t) => '<label><input type="radio" name="' + p + '" data-b="' + p + '" value="' + t + '"' + (get(C, p) === t ? ' checked' : '') + '><i style="background:' + D.THEMES[t] + '"></i></label>').join('') + '</div></div>';

  function viewPromos() {
    const svcOpts = [['book', 'نۆرەگرتن (گشتی)']].concat(C.services.filter((s) => !s[9]).map((s) => [s[0], s[2]]));
    return '<h2>هەواڵ و ڕیکلام</h2><p class="hint">ئەمانە وەک بانەرێکی جوڵاو لە سەرەوەی لاپەڕەی سەرەکی دەردەکەون. دەتوانیت وێنە دابنێیت یان ڕەنگ هەڵبژێریت.</p>' +
      C.promos.map((p, i) => { const k = 'p' + i; return card(k, av(p.photo, P(p.t)), P(p.t) || 'بانەری نوێ', P(p.s), tx0(i) , { hid: p.off, badge: p.off ? 'شاراوە' : '', tp: 'promos.' + i + '.t.1' }); }).join('') +
      '<button class="add" data-act="addp">＋ بانەری نوێ</button>';
    function tx0(i) {
      const b = 'promos.' + i;
      return pair('دەستپێکی بچووک (وەک «ئەم مانگە»)', b + '.k') + pair('سەردێڕ', b + '.t') + pair('دەقی ژێر سەردێڕ', b + '.s') +
        photo('وێنەی پێشخان (ئارەزوومەندانە)', b + '.photo', 'promo', 'ئەگەر وێنە دابنێیت، ڕەنگ و ددانە کێشراوەکە نامێنن. وێنەیەک بەکاربهێنە کە لای ڕاست/چەپی کراوە بێت بۆ نووسینەکە.') +
        (p_has(i) ? '' : swatches(b + '.theme')) +
        '<div class="g3">' + sel('کلیک بۆ کوێ ببات', b + '.svc', svcOpts) + sel('ددانی کێشراو', b + '.art', ARTS) + '</div>' +
        chk('شاردنەوە لە ئەپ', b + '.off') +
        btns(i, C.promos.length, 'promos', '<button class="btn red sm" data-act="del" data-k="promos" data-i="' + i + '">سڕینەوە</button>');
    }
  }
  const p_has = (i) => !!C.promos[i].photo;
  const P = (pair2) => (pair2 && (pair2[1] || pair2[0])) || '';

  function viewDoctors() {
    const svcAll = C.services.map((s) => [s[0], s[2] + (s[9] ? ' (شاراوە)' : '')]);
    return '<h2>دکتۆرەکان</h2><p class="hint">زانیاری و وێنەی هەر دکتۆرێک. دکتۆرە سەرەتاییەکان (نموونەکان) تەنها دەتوانرێت بشاردرێنەوە، چونکە نەخۆشی نموونەیی پەیوەندی پێوەیانە. دکتۆری نوێ دەتوانیت بسڕیتەوە.</p>' +
      C.doctors.map((d, i) => {
        const b = 'doctors.' + i, core = D.CORE_DOCS.includes(d.id), gal = Array.isArray(d.gallery);
        return card('d' + i, av(d.photo, d.ku), d.ku || d.en, P(d.spec) + ' · ' + (d.hidden ? 'شاراوەیە' : 'دەردەکەوێت'),
          namePair(b) +
          pair('ناوی کورت (لەسەر کارتەکان)', b + '.short') + pair('پسپۆڕی', b + '.spec') + pair('دەربارە', b + '.bio', true) +
          photo('وێنەی دکتۆر', b + '.photo', 'doc', 'وێنەیەکی ڕووخسار بە ڕوونی؛ لە ناوەڕاستەوە دەبڕدرێت (چوارگۆشە).') +
          '<div class="g3">' + tx('ساڵی ئەزموون', b + '.years', { type: 'number', num: 1 }) + tx('ژمارەی نەخۆش', b + '.patients', { type: 'number', num: 1 }) + tx('هەڵسەنگاندن (٠-٥)', b + '.rating', { type: 'number', num: 1, step: '0.1' }) + tx('ژمارەی هەڵسەنگاندن', b + '.reviews', { type: 'number', num: 1 }) + '</div>' +
          group('ڕۆژانی پشوو', b + '.off', DAYS) + group('چارەسەرەکانی', b + '.services', svcAll) +
          '<div class="f"><span>گەلەریی بزە (پێش/دوای)</span>' +
          (gal ? '<div class="gl">' + d.gallery.map((g, j) => '<div class="gi"><div class="thumb gal" style="background-image:url(' + g.src + ')"></div>' + pair2tag(b + '.gallery.' + j + '.tag') + '<button class="btn red sm" style="margin-top:6px" data-act="delg" data-i="' + i + '" data-j="' + j + '">لابردن</button></div>').join('') + '</div>' : '<div class="hint">' + (['d2', 'd3', 'd4'].includes(d.id) ? 'ئێستا وێنە کێشراوەکانی نموونە نیشان دەدرێن. کە وێنە زیاد دەکەیت، جێگەیان دەگرنەوە.' : 'گەلەری نییە.') + '</div>') +
          '<div class="row"><label class="btn soft sm">＋ زیادکردنی وێنە<input class="vh" type="file" accept="image/*" multiple data-gal="' + i + '"></label>' + (!gal || d.gallery.length ? '<button class="btn ghost sm" data-act="nog" data-i="' + i + '">شاردنەوەی گەلەری</button>' : '') + '</div></div>' +
          chk('شاردنەوە لە ئەپ (نۆرەی نوێی بۆ ناگیرێت)', b + '.hidden') +
          btns(i, C.doctors.length, 'doctors', core ? '' : '<button class="btn red sm" data-act="del" data-k="doctors" data-i="' + i + '">سڕینەوە</button>'),
          { hid: d.hidden, badge: d.hidden ? 'شاراوە' : '', tp: b + '.ku' });
      }).join('') +
      '<div class="row" style="margin-top:6px"><button class="add" style="flex:1" data-act="addd" data-g="m">＋ دکتۆری نێر</button><button class="add" style="flex:1" data-act="addd" data-g="f">＋ دکتۆری مێ</button></div>';
  }
  const namePair = (b) => '<div class="f"><span>ناوی تەواو</span><div class="pair"><div><input type="text" data-b="' + b + '.en" data-l="en" placeholder="English" value="' + val(b + '.en') + '"></div><div><input type="text" data-b="' + b + '.ku" data-l="ku" placeholder="کوردی" value="' + val(b + '.ku') + '"></div></div></div>';
  const pair2tag = (p) => '<div class="pair" style="gap:4px">' + [0, 1].map((k) => '<input type="text" data-b="' + p + '.' + k + '" data-l="' + (k ? 'ku' : 'en') + '" placeholder="' + (k ? 'ناونیشان' : 'Label') + '" value="' + val(p + '.' + k) + '">').join('') + '</div>';

  function viewServices() {
    return '<h2>چارەسەرەکان و نرخ</h2><p class="hint">نرخەکان بە دیناری عێراقی (IQD). چارەسەرە سەرەتاییەکان تەنها دەشاردرێنەوە.</p>' +
      C.services.map((s, i) => {
        const b = 'services.' + i, core = D.CORE_SVCS.includes(s[0]);
        return card('s' + i, av(s[10], s[2]), s[2] || s[1], (CATS.find((c) => c[0] === s[3]) || [0, 0, ''])[2] + ' · ' + Number(s[5]).toLocaleString('en-US') + ' IQD', namePair2(b) +
          pair2(b, 7, 'وەسفی کورت') +
          '<div class="g3">' + sel('جۆر', b + '.3', CATS.map((c) => [c[0], c[2]])) + tx('خولەک', b + '.4', { type: 'number', num: 1 }) + tx('نرخ لە (IQD)', b + '.5', { type: 'number', num: 1 }) + sel('وێنەی ددان', b + '.6', ARTS) + '</div>' +
          photo('وێنەی چارەسەر', b + '.10', 'svc', 'جێگەی ددانە کێشراوەکە دەگرێتەوە لە لاپەڕەی سەرەکی، لیستی چارەسەرەکان، نۆرەگرتن و لاپەڕەی چارەسەرەکە. وێنەی «پاککردنەوە» لە کارتی «کاتی پشکنینەکەتە»ش دەردەکەوێت.') +
          chk('شاردنەوە لە ئەپ', b + '.9') +
          btns(i, C.services.length, 'services', core ? '' : '<button class="btn red sm" data-act="del" data-k="services" data-i="' + i + '">سڕینەوە</button>'), { hid: s[9], badge: s[9] ? 'شاراوە' : '', tp: b + '.2' });
      }).join('') + '<button class="add" data-act="adds">＋ چارەسەری نوێ</button><p class="hint">دوای زیادکردنی چارەسەرێکی نوێ، لە بەشی «دکتۆرەکان» دیاری بکە کام دکتۆر ئەنجامی دەدات.</p>';
  }
  const namePair2 = (b) => '<div class="f"><span>ناو</span><div class="pair"><div><input type="text" data-b="' + b + '.1" data-l="en" placeholder="English" value="' + val(b + '.1') + '"></div><div><input type="text" data-b="' + b + '.2" data-l="ku" placeholder="کوردی" value="' + val(b + '.2') + '"></div></div></div>';
  const pair2 = (b, k, label) => '<div class="f"><span>' + label + '</span><div class="pair"><div><input type="text" data-b="' + b + '.' + k + '" data-l="en" placeholder="English" value="' + val(b + '.' + k) + '"></div><div><input type="text" data-b="' + b + '.' + (k + 1) + '" data-l="ku" placeholder="کوردی" value="' + val(b + '.' + (k + 1)) + '"></div></div></div>';

  function viewReviews() {
    return '<h2>هەڵسەنگاندنی نەخۆشەکان</h2><p class="hint">ئەمانە لە پرۆفایلی دکتۆر دەردەکەون. تەنها ئەو هەڵسەنگاندنانە بنووسە کە ڕاستەقینەن و نەخۆشەکە ڕەزامەندە.</p>' +
      C.reviews.map((r, i) => { const b = 'reviews.' + i; return card('r' + i, av('', r[1]), r[1] || r[0], '★'.repeat(Number(r[2]) || 0) + ' · ' + (r[4] || r[3] || ''), namePair3(b) + sel('ئەستێرە', b + '.2', [5, 4, 3, 2, 1].map((n) => [n, '★'.repeat(n)])) + pair3(b, 'دەقی هەڵسەنگاندن') + btns(0, 1, null, '<button class="btn red sm" data-act="del" data-k="reviews" data-i="' + i + '">سڕینەوە</button>'), { tp: b + '.1' }); }).join('') +
      '<button class="add" data-act="addr">＋ هەڵسەنگاندنی نوێ</button>';
  }
  const namePair3 = (b) => '<div class="f"><span>ناوی نەخۆش</span><div class="pair"><div><input type="text" data-b="' + b + '.0" data-l="en" placeholder="English" value="' + val(b + '.0') + '"></div><div><input type="text" data-b="' + b + '.1" data-l="ku" placeholder="کوردی" value="' + val(b + '.1') + '"></div></div></div>';
  const pair3 = (b, label) => '<div class="f"><span>' + label + '</span><div class="pair"><div><textarea data-b="' + b + '.3" data-l="en" placeholder="English">' + val(b + '.3') + '</textarea></div><div><textarea data-b="' + b + '.4" data-l="ku" placeholder="کوردی">' + val(b + '.4') + '</textarea></div></div></div>';

  let sugg = [];
  const PRESETS = ['#67CDAB', '#2A9D8F', '#3B82C4', '#1F5FA8', '#6B5BC9', '#C2407A', '#D9822B', '#B8963E', '#1B2B4F'];
  function viewBrand() {
    const b = C.clinic.brand || '#67CDAB', p = D.palette(b) || {}, logo = C.clinic.logo;
    const pv = 'style="' + Object.keys(p).map((k) => k + ':' + p[k]).join(';') + '"';
    return '<h2>ڕەنگ و لۆگۆ</h2><p class="hint">ڕەنگی سەرەکی جێگەی سەوزەکە دەگرێتەوە لە دوگمەکان، مینوی خوارەوە، دوگمەی ＋، کارتی نۆرە، بانەرەکان و هتد. ئەو شوێنانەی واتای «سەرکەوتوو/پشتڕاستکراوە»یان هەیە (وەک «پشتڕاستکراوە» و «ئەمڕۆ بەردەستە» و پارەی دراو) بە سەوزی دەمێننەوە، و دوگمەی واتسئاپیش هەر سەوزە.</p>' +
      '<div class="card"><div class="body" style="display:block;border:0">' +
      '<div class="f"><span>لۆگۆی کلینیک (باشترە PNG بێت بە پشتی ڕوون)</span><div class="pbox"><label for="lg" class="thumb" style="background:#fff' + (logo ? ' url(' + logo + ') center/contain no-repeat' : '') + '">' + (logo ? '' : '<span class="plus">＋<small>لۆگۆ</small></span>') + '</label><div><label for="lg" class="btn soft sm">' + (logo ? 'گۆڕینی لۆگۆ' : 'هەڵبژاردنی لۆگۆ') + '</label><input id="lg" class="vh" type="file" accept="image/*" data-logo="1">' + (logo ? ' <button class="btn ghost sm" data-act="clr" data-p="clinic.logo">لابردن</button>' : '') + '<div class="hint" style="margin:6px 0 0">لە پەڕەی بەخێرهاتن و چات دەردەکەوێت. ڕەنگەکانی لۆگۆکە خۆکارانە دەدۆزرێنەوە.</div></div></div></div>' +
      (sugg.length ? '<div class="f"><span>ڕەنگەکانی ناو لۆگۆکە (کلیک بکە بۆ هەڵبژاردن)</span><div class="sw">' + sugg.map((h) => '<button class="pick" data-act="brand" data-c="' + h + '" style="background:' + h + '" title="' + h + '"></button>').join('') + '</div></div>' : '') +
      '<div class="f"><span>ڕەنگی سەرەکی</span><div class="row" style="margin-top:0"><input type="color" id="bc" value="' + esc(b) + '"><input type="text" id="bh" class="ltr" style="width:130px" value="' + esc(b) + '" placeholder="#67CDAB"><button class="btn ghost sm" data-act="brand" data-c="#67CDAB">گەڕانەوە بۆ سەوزی ئێستا</button></div></div>' +
      '<div class="f"><span>ڕەنگی ئامادە</span><div class="sw">' + PRESETS.map((h) => '<button class="pick' + (h.toLowerCase() === b.toLowerCase() ? ' on' : '') + '" data-act="brand" data-c="' + h + '" style="background:' + h + '"></button>').join('') + '</div></div>' +
      '<div class="sec">پێشبینین</div><div class="bprev" ' + pv + '>' +
        '<div class="bp-row"><span class="bp-btn">ئێستا نۆرە بگرە</span><span class="bp-soft">نۆرە بگرە</span><span class="bp-ok">● پشتڕاستکراوە</span></div>' +
        '<div class="bp-tile"><b>نۆرە بگرە</b><small>لە خولەکێکدا کات هەڵبژێرە</small></div>' +
        '<div class="bp-bar"><span class="on">سەرەکی</span><span>نۆرەکان</span><i>＋</i><span>پەڕگەکەم</span><span>پرۆفایل</span></div>' +
      '</div></div></div>';
  }
  function setBrand(h) {
    if (!/^#[0-9a-f]{6}$/i.test(h)) return;
    C.clinic.brand = h; save(); render();
  }
  function shrinkLogo(file) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const n = 256, c = document.createElement('canvas'); c.width = n; c.height = n;
        const x = c.getContext('2d'), r = Math.min(n / im.width, n / im.height), w = im.width * r, h = im.height * r;
        x.drawImage(im, (n - w) / 2, (n - h) / 2, w, h); URL.revokeObjectURL(u);
        /* the logo's own colours: saturated pixels, grouped */
        const px = x.getImageData(0, 0, n, n).data, bins = {};
        for (let k = 0; k < px.length; k += 16) {
          const R = px[k], G = px[k + 1], B = px[k + 2], A = px[k + 3]; if (A < 200) continue;
          const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 510, sat = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255));
          if (sat < 0.25 || l < 0.12 || l > 0.9) continue;
          const key = (R >> 5) + '-' + (G >> 5) + '-' + (B >> 5); const bn = bins[key] || (bins[key] = [0, 0, 0, 0]); bn[0] += R; bn[1] += G; bn[2] += B; bn[3]++;
        }
        const cols = []; Object.values(bins).sort((p, q) => q[3] - p[3]).forEach((bn) => { const cc = [0, 1, 2].map((j) => Math.round(bn[j] / bn[3])); if (cols.length < 5 && !cols.some((o) => Math.hypot(o[0] - cc[0], o[1] - cc[1], o[2] - cc[2]) < 60)) cols.push(cc); });
        sugg = cols.map((cc) => '#' + cc.map((v) => v.toString(16).padStart(2, '0')).join(''));
        res(c.toDataURL('image/png'));
      };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }

  function viewTiles() {
    if (!C.tiles) C.tiles = clone(D.DEFAULTS.TILES);
    return '<h2>وێنەکانی لاپەڕەی سەرەکی</h2><p class="hint">وێنەی پەڕەی بەخێرهاتن و چوار دوگمە گەورەکەی سەرەکی (نۆرە، ڕەچەتە، تیشک، پارەدان). ئەگەر وێنەی خۆت دابنێیت، جێگەی وێنە کێشراوەکە دەگرێتەوە. وێنەی چارەسەرەکان لە بەشی «چارەسەرەکان»ـە، وێنەی دکتۆرەکان لە «دکتۆرەکان» و وێنەی بانەرەکان لە «هەواڵ و ڕیکلام».</p><div class="card"><div class="body" style="display:block;border:0">' + photo('وێنەی پەڕەی بەخێرهاتن (پێش چوونەژوورەوە)', 'tiles.welcome', 'wel') +
      [['book', 'نۆرە بگرە'], ['rx', 'ڕەچەتەکان'], ['xray', 'تیشک'], ['pay', 'پارەدان']].map(([k, l]) => photo(l, 'tiles.' + k, 'tile')).join('') + '</div></div>';
  }

  function viewClinic() {
    return '<h2>زانیاری کلینیک</h2><p class="hint">ئەمانە لە لاپەڕەی سەرەکی و پرۆفایل و دوگمەی پەیوەندی و واتسئاپ بەکاردێن.</p><div class="card"><div class="body" style="display:block;border:0">' +
      tx('ناوی کلینیک', 'clinic.name') + tx('ژمارەی تەلەفۆن', 'clinic.phone', { type: 'tel', dir: 1 }) + tx('ژمارەی واتسئاپ (بە کۆدی وڵات، بەبێ + ، بۆ نموونە 9647501234567)', 'clinic.wa', { type: 'tel', dir: 1 }) +
      pair('ناونیشان', 'clinic.address') + pair('کاتی دەوام', 'clinic.hours') + tx('لینکی نەخشە (Google Maps)', 'clinic.map', { type: 'url', dir: 1 }) + tx('لینکی ئینستاگرام', 'clinic.instagram', { type: 'url', dir: 1 }) + '</div></div>';
  }

  function viewPublish() {
    const n = size(), pc = Math.min(100, Math.round(n / BUDGET * 100));
    return '<h2>بڵاوکردنەوە</h2><p class="hint">ئەو گۆڕانکارییانەی لێرە دەیکەیت <b>تەنها لەسەر ئەم مۆبایل/کۆمپیوتەرە دەردەکەون</b> (ڕەشنووس). بۆ ئەوەی هەموو نەخۆشەکان ببینن، دەبێت فایلی نوێ بار بکەیت.</p>' +
      '<div class="card"><div class="body" style="display:block;border:0"><div class="sec" style="margin-top:4px">قەبارەی ڕەشنووس</div><div class="meter' + (pc > 85 ? ' hot' : '') + '"><i style="width:' + pc + '%"></i></div><small style="color:var(--text-2)">' + Math.round(n / 1000) + ' KB لە نزیکەی ' + Math.round(BUDGET / 1000) + ' KB ' + (pc > 85 ? '· نزیکە پڕ بێت، وێنەکان کەم بکەرەوە' : '') + '</small>' +
      '<div class="row"><button class="btn mint" data-act="exp">⬇ داگرتنی content.js</button><button class="btn soft" data-act="share">هاوبەشکردن (مۆبایل)</button></div>' +
      '<div class="sec">چۆن بڵاوی دەکەیتەوە</div><ol class="steps"><li>«داگرتنی content.js» بکە.</li><li>بچۆ ناو ڕیپۆی ئەپەکە لە GitHub.</li><li><b>Add file ← Upload files</b>، فایلی <span dir="ltr">content.js</span> هەڵبژێرە. دەبێت ناوەکەی هەمان ناو بێت و جێگەی فایلە کۆنەکە بگرێتەوە.</li><li>Commit بکە، دوای نزیکەی یەک خولەک هەموو نەخۆشەکان گۆڕانکارییەکان دەبینن.</li></ol>' +
      '<div class="note">پێش بڵاوکردنەوە دوگمەی «پێشبینین» بکە بۆ ئەوەی ئەپەکە بە گۆڕانکارییەکانەوە ببینیت. لەسەر ئەپەکە نیشانەی «ڕەشنووس» دەردەکەوێت.</div></div></div>' +
      '<div class="card"><div class="body" style="display:block;border:0"><div class="sec" style="margin-top:4px">گواستنەوە و گەڕاندنەوە</div><p class="hint">بۆ بەردەوامبوون لە ئامێرێکی تر، فایلی content.js بار بکە.</p><div class="row" style="margin-top:0"><label class="btn ghost">بارکردنی content.js<input type="file" accept=".js,.json,text/javascript,application/json" class="vh" id="imp"></label>' +
      '<button class="btn ghost" data-act="disc">لابردنی ڕەشنووس (گەڕانەوە بۆ بڵاوکراوەکە)</button><button class="btn red" data-act="rst">گەڕانەوە بۆ نموونەی یەکەم</button></div>' + (hasDraft ? '' : '<div class="note ok" style="margin-top:10px">ئێستا ڕەشنووسێک نییە؛ ئەوەی دەیبینیت هەمان بڵاوکراوەکەیە.</div>') + '</div></div>';
  }

  const VIEWS = { brand: viewBrand, tiles: viewTiles, promos: viewPromos, doctors: viewDoctors, services: viewServices, reviews: viewReviews, clinic: viewClinic, publish: viewPublish };
  function render() {
    $('#tabs').innerHTML = TABS.map(([k, t]) => '<button data-act="tab" data-k="' + k + '" class="' + (k === tab ? 'on' : '') + '">' + t + '</button>').join('');
    $('#main').innerHTML = VIEWS[tab]();
    if (!hasDraft) status('ڕەشنووس نییە'); else if (!$('#state').classList.contains('err')) status('ڕەشنووس هەیە');
  }

  /* ---------- images ---------- */
  function shrink(file, spec) {
    const [w, h, bias, q] = SPEC[spec];
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'), r = Math.max(w / im.width, h / im.height), sw = w / r, sh = h / r;
        x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
        x.drawImage(im, (im.width - sw) / 2, (im.height - sh) * bias, sw, sh, 0, 0, w, h);
        URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', q));
      };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }

  /* ---------- actions ---------- */
  const uid = (p) => p + Date.now().toString(36);
  const mv = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; const t = arr[i]; arr[i] = arr[j]; arr[j] = t; };
  const LISTS = { promos: () => C.promos, doctors: () => C.doctors, services: () => C.services, reviews: () => C.reviews };
  const PFX = { promos: 'p', doctors: 'd', services: 's', reviews: 'r' };
  const ACT = {
    tab(e) { tab = e.dataset.k; window.scrollTo(0, 0); render(); },
    tg(e) { const k = e.dataset.k; if (open.has(k)) open.delete(k); else open.add(k); e.parentNode.classList.toggle('open'); },
    up(e) { const i = +e.dataset.i; mv(LISTS[e.dataset.k](), i, -1); open.clear(); open.add(PFX[e.dataset.k] + (i - 1)); save(); render(); },
    dn(e) { const i = +e.dataset.i; mv(LISTS[e.dataset.k](), i, 1); open.clear(); open.add(PFX[e.dataset.k] + (i + 1)); save(); render(); },
    del(e) { if (!confirm('دڵنیایت لە سڕینەوە؟')) return; LISTS[e.dataset.k]().splice(+e.dataset.i, 1); open.clear(); save(); render(); },
    clr(e) { set(C, e.dataset.p, ''); if (e.dataset.p === 'clinic.logo') sugg = []; save(); render(); },
    brand(e) { setBrand(e.dataset.c); },
    addp() { C.promos.push({ k: ['New', 'نوێ'], t: ['New offer', 'پێشکەشی نوێ'], s: ['Details here', 'وردەکاری لێرە'], art: 'white', svc: 'book', theme: 'green' }); open.clear(); open.add('p' + (C.promos.length - 1)); save(); render(); },
    addd(e) {
      const f = e.dataset.g === 'f', base = D.DEFAULTS.DOCTORS.find((d) => d.id === (f ? 'd2' : 'd5'));
      C.doctors.push({ id: uid('d'), en: 'Dr. New', ku: 'د. نوێ', short: ['Dr. New', 'د. نوێ'], spec: ['General dentistry', 'ددانی گشتی'], rating: 5, reviews: 0, patients: 0, years: 1, off: [5], services: ['consult', 'clean', 'fill'], bio: ['', ''], art: clone(base.art) });
      open.clear(); open.add('d' + (C.doctors.length - 1)); save(); render();
    },
    adds() { C.services.push([uid('s'), 'New treatment', 'چارەسەری نوێ', 'general', 30, 50000, 'clean', '', '', false]); open.clear(); open.add('s' + (C.services.length - 1)); save(); render(); },
    addr() { C.reviews.push(['Name', 'ناو', 5, '', '']); open.clear(); open.add('r' + (C.reviews.length - 1)); save(); render(); },
    delg(e) { C.doctors[+e.dataset.i].gallery.splice(+e.dataset.j, 1); save(); render(); },
    nog(e) { C.doctors[+e.dataset.i].gallery = []; save(); render(); },
    preview() { save(); window.open('index.html#/home', '_blank'); },
    exp() { download(); },
    share() { share(); },
    disc() { if (!confirm('ڕەشنووسەکە دەسڕدرێتەوە و ئەوەی بڵاوکراوەتەوە دەمێنێتەوە. بەردەوام بم؟')) return; try { localStorage.removeItem(KEY); } catch (er) { /* ignore */ } location.reload(); },
    rst() { if (!confirm('هەموو گۆڕانکارییەکان دەسڕدرێنەوە و دەگەڕێتەوە بۆ نموونەی یەکەم. بەردەوام بم؟')) return; C = { v: 1, promos: clone(D.DEFAULTS.PROMOS), doctors: clone(D.DEFAULTS.DOCTORS), services: clone(D.DEFAULTS.SERVICES), reviews: clone(D.DEFAULTS.REVIEWS), clinic: clone(D.DEFAULTS.CLINIC), tiles: clone(D.DEFAULTS.TILES) }; open.clear(); save(); render(); toast('گەڕایەوە بۆ نموونەی یەکەم'); }
  };
  const fileText = () => 'window.CONTENT = ' + JSON.stringify(C) + ';\n';
  function download() {
    const b = new Blob(['/* Published from admin.html */\n' + fileText()], { type: 'text/javascript' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'content.js'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('content.js داگیرا');
  }
  function share() {
    const f = new File(['/* Published from admin.html */\n' + fileText()], 'content.js', { type: 'text/javascript' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'content.js' }).catch(() => {});
    else { download(); }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-act]'); if (!t) return;
    const f = ACT[t.dataset.act]; if (f) { ev.preventDefault(); f(t); }
  });
  function onEdit(ev) {
    const t = ev.target;
    if (t.dataset.arr) {
      const arr = get(C, t.dataset.arr) || [], isNum = /\.off$/.test(t.dataset.arr), v = isNum ? Number(t.dataset.val) : t.dataset.val, k = arr.indexOf(v);
      if (t.checked && k < 0) arr.push(v); else if (!t.checked && k >= 0) arr.splice(k, 1);
      set(C, t.dataset.arr, arr); saveSoon(); return;
    }
    if (!t.dataset.b) return;
    let v = t.dataset.chk ? t.checked : t.dataset.num ? (t.value === '' ? 0 : Number(t.value)) : t.value;
    if (t.type === 'radio' && !t.checked) return;
    set(C, t.dataset.b, v);
    const tt = document.querySelector('[data-t="' + t.dataset.b + '"]'); if (tt) tt.textContent = t.value || '…';
    saveSoon();
  }
  document.addEventListener('input', onEdit);
  document.addEventListener('change', async (ev) => {
    const t = ev.target;
    if (t.id === 'imp') return importFile(t.files[0]);
    if (t.id === 'bc') return setBrand(t.value);
    if (t.id === 'bh') return setBrand(t.value.trim().startsWith('#') ? t.value.trim() : '#' + t.value.trim());
    if (t.dataset.logo && t.files[0]) {
      try { C.clinic.logo = await shrinkLogo(t.files[0]); if (sugg.length && (!C.clinic.brand || C.clinic.brand === '#67CDAB')) C.clinic.brand = sugg[0]; save(); render(); toast(sugg.length ? 'ڕەنگی لۆگۆکە هەڵبژێردرا؛ دەتوانیت بیگۆڕیت' : 'لۆگۆ دانرا'); } catch (e) { toast('نەتوانرا لۆگۆکە بکرێتەوە', true); }
      return;
    }
    if (t.dataset.img && t.files[0]) {
      try { set(C, t.dataset.img, await shrink(t.files[0], t.dataset.spec)); save(); render(); } catch (e) { toast('نەتوانرا وێنەکە بکرێتەوە', true); }
      return;
    }
    if (t.dataset.gal && t.files.length) {
      const d = C.doctors[+t.dataset.gal]; if (!Array.isArray(d.gallery)) d.gallery = [];
      for (const f of t.files) { try { d.gallery.push({ src: await shrink(f, 'gal'), tag: ['', ''] }); } catch (e) { toast('وێنەیەک نەکرایەوە', true); } }
      save(); render(); return;
    }
    if (t.type === 'checkbox' || t.tagName === 'SELECT' || t.type === 'radio') {
      onEdit(ev);
      if (t.dataset.b && /\.(off|hidden|9)$/.test(t.dataset.b)) render();
    }
  });
  function importFile(f) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = String(r.result), j = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
        if (j.v !== 1 || !Array.isArray(j.doctors)) throw new Error('bad');
        C = Object.assign({ v: 1, promos: [], doctors: [], services: [], reviews: [], clinic: clone(D.DEFAULTS.CLINIC), tiles: clone(D.DEFAULTS.TILES) }, j);
        save(); render(); toast('فایلەکە بارکرا');
      } catch (e) { toast('ئەم فایلە دروست نییە', true); }
    };
    r.readAsText(f);
  }
  render();
})();
