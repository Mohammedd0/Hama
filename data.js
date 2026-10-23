/* Demo content for the Bite patient app. Everything is sample data; dates are
   built relative to today so the demo always looks current. */
(function () {
  const CATS = [
    ['general', 'General', 'گشتی'],
    ['cosmetic', 'Cosmetic', 'جوانکاری'],
    ['ortho', 'Orthodontics', 'ئۆرتۆ'],
    ['implant', 'Implants & surgery', 'ئیمپلانت و نەشتەرگەری'],
    ['kids', 'Kids', 'منداڵان']
  ];
  /* id, en, ku, category, minutes, price from (IQD), art, short en, short ku */
  const SERVICES = [
    ['consult', 'Check-up & consultation', 'پشکنین و ڕاوێژ', 'general', 30, 25000, 'clean', 'Exam, advice and a treatment plan', 'پشکنین، ئامۆژگاری و پلانی چارەسەر'],
    ['clean', 'Cleaning & polish', 'پاککردنەوە و پۆلیش', 'general', 45, 50000, 'clean', 'Removes plaque and stains', 'لابردنی چەوری و ڕەنگی ددان'],
    ['fill', 'White filling', 'پڕکردنەوەی سپی', 'general', 45, 75000, 'fill', 'Tooth-coloured composite', 'کۆمپۆزیتی هاوڕەنگی ددان'],
    ['rct', 'Root canal treatment', 'چارەسەری ڕەگ', 'general', 90, 450000, 'root', 'Saves an infected tooth', 'پاراستنی ددانی هەوکردوو'],
    ['crown', 'Zirconia crown', 'کراونی زیرکۆنیا', 'cosmetic', 60, 600000, 'crown', 'Strong, natural-looking cap', 'کراونی بەهێز و سروشتی'],
    ['white', 'Teeth whitening', 'سپیکردنەوەی ددان', 'cosmetic', 60, 250000, 'white', 'Several shades whiter in one visit', 'چەند پلە سپیتر لە یەک سەرداندا'],
    ['veneer', 'E-max veneers', 'ڤینیەری E-max', 'cosmetic', 60, 800000, 'white', 'Smile makeover, per tooth', 'گۆڕینی شێوەی بزە، بۆ هەر ددانێک'],
    ['braces', 'Braces', 'تەلی ددان', 'ortho', 60, 2500000, 'braces', 'Fixed metal or ceramic braces', 'تەلی جێگیر، کانزا یان سیرامیک'],
    ['aligner', 'Clear aligners', 'ئەلاینەری ڕوون', 'ortho', 45, 4000000, 'braces', 'Nearly invisible trays', 'قاڵبی ڕوون کە بە زەحمەت دەبینرێن'],
    ['implant', 'Dental implant', 'ئیمپلانتی ددان', 'implant', 120, 1500000, 'implant', 'Permanent tooth replacement', 'جێگرەوەی هەمیشەیی ددان'],
    ['ext', 'Tooth extraction', 'هەڵکێشانی ددان', 'implant', 30, 50000, 'ext', 'Simple or surgical', 'ئاسایی یان نەشتەرگەری'],
    ['kids', "Children's check-up", 'پشکنینی منداڵان', 'kids', 30, 25000, 'kid', 'Gentle first visits and fluoride', 'سەردانی نەرم و فلۆراید']
  ];
  const DOCTORS = [
    { id: 'd5', en: 'Dr. Karwan Mahmood', ku: 'د. کاروان مەحمود', short: ['Dr. Karwan', 'د. کاروان'], spec: ['General & children\'s dentistry', 'ددانی گشتی و منداڵان'], rating: 4.9, reviews: 286, patients: 2140, years: 9, off: [5], services: ['consult', 'clean', 'fill', 'kids', 'ext'],
      bio: ['Dr. Karwan looks after families: check-ups, cleanings and fillings for adults, and calm, playful first visits for children.', 'د. کاروان چاودێری خێزانەکان دەکات: پشکنین، پاککردنەوە و پڕکردنەوە بۆ گەورەکان، و سەردانی ئارام و خۆش بۆ منداڵان.'],
      art: { bg: ['#5FC4C9', '#2B8E95'], skin: '#E8B996', skin2: '#D9A27D', hair: '#2B211C', shirt: '#2F4A6D', tie: '#1B2B4F', beard: true } },
    { id: 'd2', en: 'Dr. Shilan Aziz', ku: 'د. شیلان عەزیز', short: ['Dr. Shilan', 'د. شیلان'], spec: ['Cosmetic dentistry', 'ددانی جوانکاری'], rating: 5.0, reviews: 312, patients: 1240, years: 12, off: [5, 1], services: ['consult', 'white', 'veneer', 'crown', 'clean'],
      bio: ['Dr. Shilan designs smiles: whitening, veneers and crowns planned digitally so you can see the result before treatment starts.', 'د. شیلان بزە دیزاین دەکات: سپیکردنەوە، ڤینیەر و کراون بە شێوەی دیجیتاڵ پلان دەکرێن بۆ ئەوەی پێش دەستپێکردن ئەنجامەکە ببینیت.'],
      art: { bg: ['#8FD3C0', '#3E9E86'], skin: '#F0C7A8', skin2: '#E2B08E', hair: '#5A3A28', shirt: '#E7D3C8', f: true } },
    { id: 'd1', en: 'Dr. Aras Karim', ku: 'د. ئاراس کەریم', short: ['Dr. Aras', 'د. ئاراس'], spec: ['Root canal specialist', 'پسپۆڕی چارەسەری ڕەگ'], rating: 4.8, reviews: 198, patients: 1630, years: 11, off: [5], services: ['consult', 'rct', 'fill', 'crown'],
      bio: ['Dr. Aras treats painful and infected teeth with a microscope, so most root canals are finished in two or three comfortable visits.', 'د. ئاراس ددانی بەئازار و هەوکردوو بە مایکرۆسکۆپ چارەسەر دەکات، بۆیە زۆربەی چارەسەرەکانی ڕەگ لە دوو بۆ سێ سەردانی ئاسوودەدا تەواو دەبن.'],
      art: { bg: ['#6BB7D6', '#2F6FA0'], skin: '#DDAA85', skin2: '#CB946D', hair: '#1E1A18', shirt: '#7A2E3B' } },
    { id: 'd3', en: 'Dr. Hemn Rashid', ku: 'د. هێمن ڕەشید', short: ['Dr. Hemn', 'د. هێمن'], spec: ['Orthodontics', 'ئۆرتۆدۆنتیک'], rating: 4.9, reviews: 241, patients: 980, years: 10, off: [5, 3], services: ['consult', 'braces', 'aligner'],
      bio: ['Dr. Hemn straightens teeth for children and adults with braces or clear aligners, with monthly check-ins you can book here.', 'د. هێمن ددانی منداڵان و گەورەکان بە تەل یان ئەلاینەری ڕوون ڕێک دەخات، لەگەڵ سەردانی مانگانە کە لێرە دەتوانیت نۆرەی بۆ بگریت.'],
      art: { bg: ['#7FC7B3', '#2E7D6E'], skin: '#E6B590', skin2: '#D49E78', hair: '#3A2C22', shirt: '#DCE6EE', tie: '#2A9D8F' } },
    { id: 'd4', en: 'Dr. Rezhin Ahmed', ku: 'د. ڕێژین ئەحمەد', short: ['Dr. Rezhin', 'د. ڕێژین'], spec: ['Implants & oral surgery', 'ئیمپلانت و نەشتەرگەری دەم'], rating: 4.9, reviews: 174, patients: 760, years: 8, off: [5, 0], services: ['consult', 'implant', 'ext'],
      bio: ['Dr. Rezhin places implants and removes wisdom teeth using 3D scans for precise, gentle surgery.', 'د. ڕێژین ئیمپلانت دادەنێت و ددانی عەقڵ هەڵدەکێشێت بە بەکارهێنانی سکانی سێ ڕەهەندی بۆ نەشتەرگەرییەکی ورد و نەرم.'],
      art: { bg: ['#9EC9E8', '#4D7FB8'], skin: '#EEC3A2', skin2: '#DDAA86', hair: '#2E2420', shirt: '#C9D6E2', f: true } }
  ];
  const REVIEWS = [
    ['Sara M.', 'سارا م.', 5, 'Very gentle and explained everything. No pain at all.', 'زۆر نەرم بوو و هەموو شتێکی ڕوون کردەوە. هیچ ئازارێکم نەبوو.'],
    ['Karzan O.', 'کارزان ع.', 5, 'On time, clean clinic and friendly staff.', 'لە کاتی خۆیدا، کلینیکێکی پاک و ستافێکی دڵسۆز.'],
    ['Nishtman A.', 'نیشتمان ئ.', 4, 'Great result. Parking nearby is hard in the evening.', 'ئەنجامی زۆر باش. ئێواران شوێنی ئۆتۆمبێل لە نزیکەوە کەمە.']
  ];
  const PROMOS = [
    { k: ['This month', 'ئەم مانگە'], t: ['A brighter smile', 'بزەیەکی گەشتر'], s: ['20% off whitening this month', '٢٠٪ داشکاندن بۆ سپیکردنەوە'], art: 'white', svc: 'white', theme: 'navy', bg: 'radial-gradient(120% 140% at 85% 20%,#2C5C8F 0%,#1B2B4F 55%,#14213D 100%)' },
    { k: ['For families', 'بۆ خێزان'], t: ['Kids smile check', 'پشکنینی منداڵان'], s: ['Free fluoride with every child check-up', 'فلۆرایدی بەخۆڕایی بۆ منداڵان'], art: 'kid', svc: 'kids', theme: 'green', bg: 'radial-gradient(120% 140% at 85% 20%,#4FB79A 0%,#2E8C79 55%,#1E6B55 100%)' },
    { k: ['Missing a tooth?', 'ددانێکت کەمە؟'], t: ['Free implant consult', 'ڕاوێژی ئیمپلانت بەخۆڕایی'], s: ['3D scan and plan in one visit', 'سکان و پلان لە یەک سەرداندا'], art: 'implant', svc: 'implant', theme: 'blue', bg: 'radial-gradient(120% 140% at 85% 20%,#5B7FB8 0%,#2A3F72 55%,#1B2B4F 100%)' }
  ];
  const CLINIC = {
    name: 'Bite for Dentistry', phone: '07505430000', wa: '9647505430000',
    address: ['Nergz Plaza, 3rd floor, Gulan Street, Erbil', 'نێرگز پلازا، نهۆمی ٣، شەقامی گوڵان، هەولێر'],
    hours: ['Sat – Thu · 12:00 – 21:00', 'شەممە – پێنجشەممە · ١٢:٠٠ – ٢١:٠٠'],
    map: 'https://www.google.com/maps/search/?api=1&query=Nergz+Plaza+Gulan+Street+Erbil',
    instagram: 'https://instagram.com/'
  };

  /* ---------- editable content ----------
     The admin page (admin.html) saves a draft in this browser (bite_content_v1) and can export
     content.js. Draft wins on the admin's own device; everyone else gets content.js. */
  const g = (a, b) => 'radial-gradient(120% 140% at 85% 20%,' + a + ' 0%,' + b + ' 55%,' + '#14213D 100%)';
  const THEMES = {
    navy: g('#2C5C8F', '#1B2B4F'), green: g('#4FB79A', '#2E8C79').replace('#14213D', '#1E6B55'),
    blue: g('#5B7FB8', '#2A3F72').replace('#14213D', '#1B2B4F'), purple: g('#7A68D6', '#4A3E9A').replace('#14213D', '#2B2467'),
    rose: g('#D8708A', '#A5405E').replace('#14213D', '#6E2540'), amber: g('#E3A04B', '#B8742A').replace('#14213D', '#7A4610')
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const DEFAULTS = clone({ SERVICES, DOCTORS, REVIEWS, PROMOS, CLINIC });
  const CORE_DOCS = DEFAULTS.DOCTORS.map((d) => d.id), CORE_SVCS = DEFAULTS.SERVICES.map((x) => x[0]);
  let draft = false;
  (function applyContent() {
    let c = null;
    try { const raw = localStorage.getItem('bite_content_v1'); if (raw) { c = JSON.parse(raw); draft = true; } } catch (e) { c = null; }
    if (!c || c.v !== 1) { c = window.CONTENT; draft = false; }
    if (!c || c.v !== 1) { draft = false; return; }
    const rep = (arr, next) => { if (Array.isArray(next) && next.length) { arr.length = 0; next.forEach((x) => arr.push(x)); } };
    rep(DOCTORS, c.doctors); rep(SERVICES, c.services); rep(REVIEWS, c.reviews);
    if (Array.isArray(c.promos)) { PROMOS.length = 0; c.promos.forEach((x) => PROMOS.push(x)); }
    if (c.clinic) Object.assign(CLINIC, c.clinic);
    /* the sample patient's records point at these, so they can be hidden but never removed */
    DEFAULTS.DOCTORS.forEach((d) => { if (!DOCTORS.some((x) => x.id === d.id)) DOCTORS.push(Object.assign(clone(d), { hidden: true })); });
    DEFAULTS.SERVICES.forEach((v) => { if (!SERVICES.some((x) => x[0] === v[0])) SERVICES.push(clone(v).concat([true])); });
    DOCTORS.forEach((d) => {
      const base = DEFAULTS.DOCTORS.find((x) => x.id === d.id) || DEFAULTS.DOCTORS[0];
      if (!d.art) d.art = clone(base.art);
      ['short', 'spec', 'bio'].forEach((k) => { if (!Array.isArray(d[k])) d[k] = [d.en || '', d.ku || '']; });
      d.off = Array.isArray(d.off) ? d.off : [5]; d.services = Array.isArray(d.services) ? d.services : ['consult'];
      ['rating', 'reviews', 'patients', 'years'].forEach((k) => { d[k] = Number(d[k]) || 0; });
    });
    PROMOS.forEach((p) => { if (p.theme && THEMES[p.theme]) p.bg = THEMES[p.theme]; if (!p.bg) p.bg = THEMES.navy; });
  })();

  /* ---------- the demo patient's own records ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(s, n) { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return ymd(d); }
  /* nearest open day (not Friday, not doctor's day off) */
  function workday(s, docId, dir) {
    const off = (DOCTORS.find((d) => d.id === docId) || { off: [5] }).off;
    let x = s;
    while (off.includes(new Date(x + 'T12:00:00').getDay())) x = addDays(x, dir || 1);
    return x;
  }

  function build(lang) {
    const T = ymd(new Date());
    const ku = lang === 'ku';
    const L = (en, k) => (ku ? k : en);
    const appts = [
      { id: 'a1', svc: 'clean', doc: 'd5', date: workday(addDays(T, -190), 'd5', -1), time: '17:00', status: 'done', rated: 5 },
      { id: 'a2', svc: 'consult', doc: 'd1', date: workday(addDays(T, -31), 'd1', -1), time: '18:30', status: 'done', note: L('Pain on the lower left', 'ئازار لە لای چەپی خوارەوە') },
      { id: 'a3', svc: 'rct', doc: 'd1', date: workday(addDays(T, -24), 'd1', -1), time: '16:00', status: 'done', step: [1, 3] },
      { id: 'a4', svc: 'rct', doc: 'd1', date: workday(addDays(T, -9), 'd1', -1), time: '17:30', status: 'done', step: [2, 3] },
      { id: 'a5', svc: 'rct', doc: 'd1', date: workday(addDays(T, 3), 'd1'), time: '17:30', status: 'confirmed', step: [3, 3] }
    ];
    return {
      v: 1, lang,
      profile: { name: L('Lana Ahmed', 'لانا ئەحمەد'), phone: '0750 123 4567', email: 'lana@example.com', dob: '1996-04-18', file: 1042, gender: 'f', blood: 'A+', allergies: [L('Penicillin', 'پەنسلین')] },
      appts,
      plan: [
        { id: 'pl1', title: L('Root canal · tooth 36', 'چارەسەری ڕەگ · ددانی ٣٦'), done: 2, total: 3, doc: 'd1', status: 'active' },
        { id: 'pl2', title: L('Zirconia crown · tooth 36', 'کراونی زیرکۆنیا · ددانی ٣٦'), done: 0, total: 2, doc: 'd2', status: 'next' }
      ],
      teeth: { 36: 'rct', 26: 'fill', 47: 'fill', 18: 'missing', 28: 'missing' },
      rx: [
        { id: 'rx1', date: appts[3].date, doc: 'd1', meds: [
          { n: 'Amoxicillin 500 mg', d: L('1 capsule · 3 times a day · 7 days', '١ کەپسول · ٣ جار لە ڕۆژێکدا · ٧ ڕۆژ') },
          { n: 'Ibuprofen 400 mg', d: L('1 tablet when needed · max 3 a day · after food', '١ حەب لە کاتی پێویستدا · زۆرترین ٣ جار · دوای نان') },
          { n: 'Chlorhexidine 0.12%', d: L('Rinse 15 ml · twice a day · 10 days', '١٥ ملل غەرغەرە · ٢ جار لە ڕۆژێکدا · ١٠ ڕۆژ') }
        ], advice: L('Avoid chewing on the left side until the crown is fitted.', 'تا کراونەکە دادەنرێت، بە لای چەپ مەجوو.') },
        { id: 'rx2', date: appts[0].date, doc: 'd5', meds: [
          { n: 'Fluoride toothpaste 1450 ppm', d: L('Twice a day · spit, don\'t rinse', '٢ جار لە ڕۆژێکدا · تف بکە، مەیشۆ') }
        ], advice: L('Floss once a day. Next check-up in 6 months.', 'ڕۆژانە یەکجار دەزوو بەکاربهێنە. پشکنینی داهاتوو دوای ٦ مانگ.') }
      ],
      xrays: [
        { id: 'x1', kind: 'rct', title: L('Periapical · tooth 36 · after cleaning the canals', 'پێریئەپیکاڵ · ددانی ٣٦ · دوای پاککردنەوەی ڕەگ'), date: appts[3].date, doc: 'd1' },
        { id: 'x2', kind: 'pa', title: L('Periapical · tooth 36 · diagnosis', 'پێریئەپیکاڵ · ددانی ٣٦ · دەستنیشانکردن'), date: appts[1].date, doc: 'd1' },
        { id: 'x3', kind: 'pano', title: L('Panoramic · full mouth', 'پانۆرامیک · هەموو دەم'), date: appts[0].date, doc: 'd5' }
      ],
      invoices: [
        { id: 'INV-2214', date: appts[2].date, doc: 'd1', items: [[L('Root canal treatment · tooth 36', 'چارەسەری ڕەگ · ددانی ٣٦'), 450000]], total: 450000, payments: [[appts[2].date, 150000, 'FIB'], [appts[3].date, 150000, L('Cash', 'نەختینە')]], plan: 3 },
        { id: 'INV-2190', date: appts[1].date, doc: 'd1', items: [[L('Consultation', 'ڕاوێژ'), 25000], [L('Periapical x-ray', 'تیشکی پێریئەپیکاڵ'), 15000]], total: 40000, payments: [[appts[1].date, 40000, L('Card', 'کارت')]] },
        { id: 'INV-1980', date: appts[0].date, doc: 'd5', items: [[L('Cleaning & polish', 'پاککردنەوە و پۆلیش'), 50000], [L('Panoramic x-ray', 'تیشکی پانۆرامیک'), 30000]], total: 80000, payments: [[appts[0].date, 80000, L('Cash', 'نەختینە')]] }
      ],
      notes: [
        { id: 'n1', icon: 'calendar', c: 'mint', t: L('Appointment confirmed', 'نۆرەکەت پشتڕاستکرایەوە'), s: L('Root canal (3/3) with Dr. Aras', 'چارەسەری ڕەگ (٣/٣) لەگەڵ د. ئاراس'), at: addDays(T, -1), go: '#/visits', read: false },
        { id: 'n2', icon: 'wallet', c: 'amber', t: L('Instalment due', 'کاتی قیستە'), s: L('150,000 IQD left on INV-2214', '١٥٠,٠٠٠ د.ع لە پسوولەی INV-2214 ماوە'), at: addDays(T, -2), go: '#/file?tab=bills', read: false },
        { id: 'n3', icon: 'pill', c: 'blue', t: L('New prescription', 'ڕەچەتەی نوێ'), s: L('From Dr. Aras Karim', 'لەلایەن د. ئاراس کەریم'), at: appts[3].date, go: '#/file?tab=rx', read: true },
        { id: 'n4', icon: 'sparkles', c: 'purple', t: L('20% off whitening', '٢٠٪ داشکاندن بۆ سپیکردنەوە'), s: L('This month only', 'تەنها ئەم مانگە'), at: addDays(T, -5), go: '#/service/white', read: true }
      ],
      chat: [
        { me: false, t: L('Hello Lana 🌿 Welcome to Bite. How can we help you today?', 'سڵاو لانا 🌿 بەخێربێیت بۆ Bite. ئەمڕۆ چۆن یارمەتیت بدەین؟'), at: addDays(T, -9) + 'T18:40' },
        { me: true, t: L('Hi, my tooth feels sensitive after the visit, is that normal?', 'سڵاو، دوای سەردانەکە ددانەکەم هەستیارە، ئاساییە؟'), at: addDays(T, -8) + 'T10:12' },
        { me: false, t: L('Yes, some sensitivity for 2–3 days is normal after a root canal. Take the ibuprofen as prescribed. If it gets worse, call us and Dr. Aras will see you.', 'بەڵێ، هەستیاری بۆ ٢–٣ ڕۆژ دوای چارەسەری ڕەگ ئاساییە. ئیبوپرۆفینەکە وەک ڕەچەتەکە بخۆ. ئەگەر خراپتر بوو پەیوەندیمان پێوە بکە و د. ئاراس دەتبینێت.'), at: addDays(T, -8) + 'T10:20' }
      ],
      favs: ['d1'], extraPay: [], rated: {},
      settings: { remind: true, offers: true }
    };
  }

  window.DATA = { CATS, SERVICES, DOCTORS, REVIEWS, PROMOS, CLINIC, build, addDays, ymd, workday, DEFAULTS, THEMES, CORE_DOCS, CORE_SVCS, draft };
})();
