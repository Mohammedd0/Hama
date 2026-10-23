/* Bite patient app — demo (no server). Data lives in this browser's localStorage. */
(function () {
  const KU = window.Lang === 'ku';
  const T = (en, ku) => (KU ? ku : en);
  const P = (pair) => (KU ? pair[1] : pair[0]);
  const N = (s) => (KU ? String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) : String(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const i = (n, c) => I(n, c || '');
  const BACK = 'chevR', FWD = 'chevL'; /* icons are drawn for RTL and mirrored in English */
  const { SERVICES, DOCTORS, CATS, REVIEWS, PROMOS, CLINIC } = window.DATA;
  const addDays = DATA.addDays, ymd = DATA.ymd;
  const KEY = 'bite_app_v1';

  /* ---------- state ---------- */
  let S = load();
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (s && s.v === 1 && s.lang === window.Lang) return s;
    const fresh = DATA.build(window.Lang);
    if (s && s.v === 1) { // language changed: keep what the user did, rebuild the texts
      ['appts', 'favs', 'settings', 'extraPay', 'seen', 'rated'].forEach((k) => { if (s[k] !== undefined) fresh[k] = s[k]; });
      fresh.profile.phone = s.profile.phone; fresh.profile.email = s.profile.email; fresh.profile.dob = s.profile.dob;
    }
    save(fresh);
    return fresh;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s || S)); } catch (e) { /* storage full or blocked */ } }
  S.extraPay = S.extraPay || [];

  /* ---------- formatting ---------- */
  const MON = KU ? ['ک.دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'ت.یەکەم', 'ت.دووەم', 'ک.یەکەم'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONF = KU ? ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYF = KU ? ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS = KU ? ['ی', 'د', 'س', 'چ', 'پ', 'ه', 'ش'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = () => ymd(new Date());
  const dt = (s) => new Date(s + 'T12:00:00');
  const dow = (s) => dt(s).getDay();
  const dd = (s) => N(dt(s).getDate());
  const fDate = (s, withDay) => { const d = dt(s); return (withDay ? DAYF[d.getDay()] + (KU ? ' ' : ', ') : '') + N(d.getDate()) + (KU ? 'ی ' : ' ') + MON[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + N(d.getFullYear()) : ''); };
  const fTime = (t) => { const [h, m] = t.split(':').map(Number); const h12 = ((h + 11) % 12) + 1; return N(h12 + ':' + String(m).padStart(2, '0')) + ' ' + (KU ? (h < 12 ? 'بەیانی' : h < 17 ? 'دوانیوەڕۆ' : 'ئێوارە') : (h < 12 ? 'AM' : 'PM')); };
  const diff = (a, b) => Math.round((dt(a) - dt(b)) / 864e5);
  const rel = (s) => { const n = diff(s, today()); if (n === 0) return T('Today', 'ئەمڕۆ'); if (n === 1) return T('Tomorrow', 'سبەینێ'); if (n === -1) return T('Yesterday', 'دوێنێ'); if (n > 1 && n < 7) return T('In ' + n + ' days', 'دوای ' + N(n) + ' ڕۆژ'); return fDate(s); };
  const ago = (s) => { const n = diff(today(), s); if (n < 1) return T('Today', 'ئەمڕۆ'); if (n === 1) return T('Yesterday', 'دوێنێ'); if (n < 30) return T(n + ' days ago', N(n) + ' ڕۆژ لەمەوبەر'); const m = Math.round(n / 30.4); return T(m + (m === 1 ? ' month ago' : ' months ago'), N(m) + ' مانگ لەمەوبەر'); };
  const money = (n) => N(Math.round(n).toLocaleString('en-US')) + (KU ? ' د.ع' : ' IQD');
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  /* ---------- lookups ---------- */
  const svc = (id) => { const s = SERVICES.find((x) => x[0] === id); return s && { id: s[0], name: KU ? s[2] : s[1], cat: s[3], min: s[4], price: s[5], art: s[6], desc: KU ? s[8] : s[7], hidden: !!s[9] }; };
  const doc = (id) => { const d = DOCTORS.find((x) => x.id === id); return d && Object.assign({}, d, { name: KU ? d.ku : d.en, sn: P(d.short), sp: P(d.spec), about: P(d.bio) }); };
  const allDocs = () => DOCTORS.filter((d) => !d.hidden).map((d) => doc(d.id));
  const catName = (id) => { const c = CATS.find((x) => x[0] === id); return c ? (KU ? c[2] : c[1]) : ''; };
  const ME = { bg: ['#DDEFF3', '#BFE3EA'], skin: '#F0C7A8', skin2: '#E2B08E', hair: '#3A2A20', shirt: '#E7D3C8', f: true, coat: false };
  const upcoming = () => S.appts.filter((a) => ['pending', 'confirmed'].includes(a.status) && a.date >= today()).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  const past = () => S.appts.filter((a) => a.status === 'done' || a.status === 'cancelled' || (a.date < today() && a.status !== 'pending' && a.status !== 'confirmed')).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const paidOf = (inv) => inv.payments.reduce((s, p) => s + p[1], 0) + S.extraPay.filter((p) => p.inv === inv.id).reduce((s, p) => s + p.amount, 0);
  const balance = () => S.invoices.reduce((s, inv) => s + Math.max(0, inv.total - paidOf(inv)), 0);
  const unread = () => S.notes.filter((n) => !n.read).length;
  const isOff = (d, date) => doc(d).off.includes(dow(date));
  const METHODS = { fib: 'FIB', fastpay: 'FastPay', zain: 'ZainCash', card: T('Card', 'کارت'), clinic: T('At the clinic', 'لە کلینیک') };

  /* deterministic "busy" slots so every doctor's diary looks real */
  function hash(s) { let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); } return (h >>> 0) % 100; }
  function slots(docId, date, minutes) {
    const out = [];
    if (isOff(docId, date)) return out;
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const mine = S.appts.filter((a) => a.date === date && ['pending', 'confirmed'].includes(a.status) && a.id !== B.editId);
    for (let m = 12 * 60; m + (minutes || 30) <= 21 * 60; m += 30) {
      const t = fromMin(m);
      let free = hash(docId + date + t) >= 40;
      if (date === today() && m < nowM + 60) free = false;
      if (mine.some((a) => { const s0 = toMin(a.time), e0 = s0 + svc(a.svc).min; return m < e0 && m + (minutes || 30) > s0; })) free = false;
      out.push({ t, free });
    }
    return out;
  }
  function nextFree(docId, minutes) {
    for (let k = 0; k < 21; k++) { const d = addDays(today(), k); const f = slots(docId, d, minutes).find((x) => x.free); if (f) return { date: d, time: f.t }; }
    return null;
  }

  /* ---------- UI helpers ---------- */
  const app = () => document.getElementById('app');
  function toast(msg, icon) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = i(icon || 'check', 's') + '<span>' + esc(msg) + '</span>';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  let sheetEl = null;
  function sheet(html, mount) {
    closeSheet(true);
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const sh = document.createElement('div'); sh.className = 'bsheet'; sh.setAttribute('role', 'dialog');
    sh.innerHTML = '<div class="grab"></div>' + html;
    document.body.append(scrim, sh);
    requestAnimationFrame(() => { scrim.classList.add('on'); sh.classList.add('on'); });
    scrim.addEventListener('click', () => closeSheet());
    sheetEl = { scrim, sh };
    if (mount) mount(sh);
    return sh;
  }
  function closeSheet(now) {
    if (!sheetEl) return;
    const { scrim, sh } = sheetEl; sheetEl = null;
    if (now) { scrim.remove(); sh.remove(); return; }
    scrim.classList.remove('on'); sh.classList.remove('on');
    setTimeout(() => { scrim.remove(); sh.remove(); }, 250);
  }
  function confirmSheet(title, text, ok, danger) {
    return new Promise((res) => {
      sheet('<h3>' + esc(title) + '</h3><p class="p">' + esc(text) + '</p><div class="row mt2"><button class="btn out lg grow" data-no>' + T('Keep it', 'نەخێر') + '</button><button class="btn lg grow ' + (danger ? 'red' : 'navy') + '" data-yes>' + esc(ok) + '</button></div>', (sh) => {
        sh.querySelector('[data-no]').onclick = () => { closeSheet(); res(false); };
        sh.querySelector('[data-yes]').onclick = () => { closeSheet(); res(true); };
      });
    });
  }
  function note(icon, c, t, s, go) { S.notes.unshift({ id: 'n' + Date.now(), icon, c, t, s, at: today(), go, read: false }); }
  const stars = (n) => '<span class="stars">' + [1, 2, 3, 4, 5].map((k) => '<span class="' + (k <= n ? '' : 'off') + '">' + i('star') + '</span>').join('') + '</span>';
  const statusBadge = (st) => ({ pending: '<span class="badge b-amber"><i></i>' + T('Waiting for confirmation', 'چاوەڕوانی پشتڕاستکردنەوە') + '</span>', confirmed: '<span class="badge b-mint"><i></i>' + T('Confirmed', 'پشتڕاستکراوە') + '</span>', done: '<span class="badge b-gray">' + T('Completed', 'تەواوبوو') + '</span>', cancelled: '<span class="badge b-red">' + T('Cancelled', 'هەڵوەشێنرایەوە') + '</span>' }[st] || '');
  const top = (title, sub, back, right) => '<div class="top">' + (back !== false ? '<button class="ib" data-a="back" aria-label="' + T('Back', 'گەڕانەوە') + '">' + i(BACK) + '</button>' : '') + '<h1>' + title + (sub ? '<span class="sub">' + sub + '</span>' : '') + '</h1>' + (right || '') + '</div>';
  const portrait = (d, mode) => { const x = DOCTORS.find((y) => y.id === d); return x.photo ? '<img src="' + esc(x.photo) + '" alt="">' : ART.person(x.art, mode); };
  function icsFor(a) {
    const s = svc(a.svc), d = doc(a.doc);
    const st = a.date.replace(/-/g, '') + 'T' + a.time.replace(':', '') + '00';
    const en = fromMin(toMin(a.time) + s.min);
    const et = a.date.replace(/-/g, '') + 'T' + en.replace(':', '') + '00';
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bite//Patient app//EN', 'BEGIN:VEVENT', 'UID:' + a.id + '@bite.krd', 'DTSTART:' + st, 'DTEND:' + et, 'SUMMARY:' + s.name + ' — Bite for Dentistry', 'DESCRIPTION:' + d.name, 'LOCATION:' + P(CLINIC.address), 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Bite', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const el = document.createElement('a'); el.href = url; el.download = 'bite-appointment.ics'; document.body.appendChild(el); el.click(); el.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(T('Added to your calendar', 'زیادکرا بۆ ڕۆژژمێرەکەت'), 'calendar');
  }
  const waLink = (text) => 'https://wa.me/' + CLINIC.wa + '?text=' + encodeURIComponent(text || '');

  /* ---------- tab bar ---------- */
  function tabbar(on) {
    const t = [['home', 'home', T('Home', 'سەرەکی')], ['visits', 'calendar', T('Visits', 'نۆرەکان')], ['book', '', ''], ['file', 'file', T('My file', 'پەڕگەکەم')], ['profile', 'user', T('Profile', 'پرۆفایل')]];
    return '<nav class="tabbar">' + t.map(([k, ic, l]) => k === 'book'
      ? '<a class="tab" href="#/book"><span class="fab">' + i('plus') + '</span><span style="margin-top:3px;color:var(--mint-2);font-weight:600">' + T('Book', 'نۆرە') + '</span></a>'
      : '<a class="tab ' + (k === on ? 'on' : '') + '" href="#/' + k + '">' + i(ic, 'l') + l + (k === 'visits' && upcoming().some((a) => a.status === 'pending') ? '<span class="bd">' + N(upcoming().filter((a) => a.status === 'pending').length) + '</span>' : '') + '</a>').join('') + '</nav>';
  }

  /* =================================================================== screens */
  const SCREENS = {};

  /* ----- welcome (shown first time and after sign-out) ----- */
  SCREENS.welcome = () => ({
    html: '<div class="page nobar" style="display:flex;flex-direction:column;min-height:100vh">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' + ART.logo(44) + '<button class="ib lang" data-a="lang">' + i('translate', 's') + T('کوردی', 'English') + '</button></div>' +
      '<div style="position:relative;height:260px;margin:24px -18px 0"><div style="position:absolute;inset:0;background:radial-gradient(closest-side,rgba(103,205,171,.28),transparent)"></div><div style="position:absolute;inset:20px 80px">' + ART.tooth('white') + '</div></div>' +
      '<h1 class="h2" style="font-size:28px;line-height:1.2">' + T('Your smile, looked after.', 'بزەکەت، لە دەستی دڵسۆزدا.') + '</h1>' +
      '<p class="p mt">' + T('Book visits, see your treatment, prescriptions, x-rays and bills — all in one place.', 'نۆرە بگرە، چارەسەر، ڕەچەتە، تیشک و پسوولەکانت ببینە، هەموو لە یەک شوێندا.') + '</p>' +
      '<div style="flex:1"></div>' +
      '<div class="field mt2"><label>' + T('Mobile number', 'ژمارەی مۆبایل') + '</label><input class="in ltr" inputmode="tel" value="' + esc(S.profile.phone) + '" data-phone></div>' +
      '<button class="btn pri lg block" data-a="enter">' + T('Continue', 'بەردەوامبە') + i(FWD, 's') + '</button>' +
      '<p class="demo">' + T('Demo version · no code is sent and no real data is used', 'وەشانی نموونە · هیچ کۆدێک نانێردرێت و هیچ داتایەکی ڕاستەقینە بەکارنایەت') + '</p></div>'
  });

  /* ----- home ----- */
  SCREENS.home = () => {
    const h = new Date().getHours();
    const greet = h < 12 ? T('Good morning', 'بەیانیت باش') : h < 17 ? T('Good afternoon', 'ڕۆژت باش') : T('Good evening', 'ئێوارەت باش');
    const up = upcoming()[0];
    const lastClean = S.appts.filter((a) => ['clean', 'kids'].includes(a.svc) && a.status === 'done').sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    const showRecall = lastClean && diff(today(), lastClean.date) > 150 && !upcoming().some((a) => a.svc === 'clean');
    const bal = balance();
    let html = '<div class="page">' +
      '<div class="hd"><a class="me" href="#/profile">' + ART.person(ME) + '</a><span class="hello grow"><small>' + greet + ' 👋</small><b>' + esc(S.profile.name) + '</b></span>' +
      '<button class="ib lang" data-a="lang" aria-label="language">' + T('کوردی', 'EN') + '</button>' +
      '<a class="ib" href="#/chat" aria-label="chat">' + i('message') + '</a><a class="ib" href="#/notifications" aria-label="notifications">' + i('bell') + (unread() ? '<span class="dot"></span>' : '') + '</a></div>' +
      '<div class="hero-wrap"><div class="heros" data-heros>' + PROMOS.filter((p) => !p.off).map((p) => '<a class="hero' + (p.photo ? ' has-img' : '') + '" href="' + (p.svc && p.svc !== 'book' ? '#/service/' + p.svc : '#/book') + '" style="background:' + (p.photo ? 'url(' + p.photo + ') center/cover' : p.bg) + '"><div class="txt"><div class="k">' + esc(P(p.k)) + '</div><h3>' + esc(P(p.t)) + '</h3><p>' + esc(P(p.s)) + '</p><span class="cta">' + T('Book now', 'ئێستا نۆرە بگرە') + '</span></div><div class="art"><svg class="ring" viewBox="0 0 160 180"><circle cx="86" cy="92" r="74" fill="#67CDAB" opacity=".15"/><circle cx="86" cy="92" r="50" fill="#67CDAB" opacity=".17"/></svg><div class="t">' + ART.tooth(p.art || 'white') + '</div></div></a>').join('') + '</div></div>' +
      '<div class="dots" data-dots>' + PROMOS.filter((p) => !p.off).map((p, k) => '<i class="' + (k === 0 ? 'on' : '') + '"></i>').join('') + '</div>';
    if (up) {
      const s = svc(up.svc), d = doc(up.doc);
      html += '<a class="next" href="#/visits"><span class="cal"><small>' + MON[dt(up.date).getMonth()] + '</small><b>' + dd(up.date) + '</b></span><span class="grow"><div class="t">' + esc(s.name) + (up.step ? ' (' + N(up.step[0] + '/' + up.step[1]) + ')' : '') + '</div><div class="s">' + rel(up.date) + ' · ' + fTime(up.time) + ' · ' + esc(d.sn) + '</div><div style="margin-top:4px">' + statusBadge(up.status) + '</div></span><span class="go">' + i(FWD, 's') + '</span></a>';
    } else {
      html += '<div class="next"><span class="cal">' + i('calendar') + '</span><span class="grow"><div class="t">' + T('No upcoming visits', 'هیچ نۆرەیەکی داهاتووت نییە') + '</div><div class="s">' + T('Book a check-up in under a minute', 'لە کەمتر لە خولەکێکدا نۆرە بگرە') + '</div></span><a class="btn sm mint" href="#/book">' + T('Book', 'نۆرە بگرە') + '</a></div>';
    }
    if (showRecall) html += '<div class="recall"><span class="c">' + ART.tooth('clean') + '</span><span class="grow"><b>' + T('Time for your check-up', 'کاتی پشکنینەکەتە') + '</b><small>' + T('Last cleaning ', 'دوایین پاککردنەوە ') + ago(lastClean.date) + '</small></span><a class="btn sm mint" href="#/book?svc=clean">' + T('Book', 'نۆرە بگرە') + '</a></div>';
    const TL = DATA.TILES || {};
    html += '<div class="sec"><b>' + T('My care', 'خزمەتگوزارییەکانم') + '</b></div><div class="tiles">' + [
      ['book', '#/book', 'plus', T('Book a visit', 'نۆرە بگرە'), T('Pick a time in a minute', 'لە خولەکێکدا کات هەڵبژێرە')],
      ['rx', '#/file?tab=rx', 'pill', T('Prescriptions', 'ڕەچەتەکان'), N(S.rx.length) + T(' prescriptions', ' ڕەچەتە')],
      ['xray', '#/file?tab=xray', 'image', T('X-rays', 'تیشک'), N(S.xrays.length) + T(' images', ' وێنە')],
      ['pay', '#/file?tab=bills', 'wallet', bal ? T('Pay', 'پارەدان') : T('Bills', 'پسوولەکان'), bal ? money(bal) + T(' due', ' ماوە') : T('All paid', 'هەمووی دراوە')]
    ].map(([k, h2, ic, l, sub]) => '<a class="tile t-' + k + (TL[k] ? ' has-img' : '') + '" href="' + h2 + '"' + (TL[k] ? ' style="background-image:url(' + TL[k] + ')"' : '') + '>' + (TL[k] ? '' : '<span class="bg">' + ART.scene(k) + '</span>') + '<span class="ic">' + i(ic) + '</span><b>' + l + '</b><small>' + sub + '</small></a>').join('') + '</div>';
    html += '<div class="sec"><b>' + T('Treatments', 'چارەسەرەکان') + '</b><a href="#/services">' + T('See all', 'هەمووی') + '</a></div>' +
      '<div class="svcs">' + ['white', 'braces', 'implant', 'kids'].filter((id) => !svc(id).hidden).map((id, k) => { const s = svc(id); return '<a class="sv' + (k === 0 ? ' hl' : '') + '" href="#/service/' + id + '"><div class="art">' + ART.tooth(s.art) + '</div><b>' + esc(P({ white: ['Whitening', 'سپیکردنەوە'], braces: ['Braces', 'تەل'], implant: ['Implants', 'ئیمپلانت'], kids: ['Kids', 'منداڵان'] }[id])) + '</b></a>'; }).join('') + '</div>';
    html += '<div class="sec"><b>' + T('Our doctors', 'دکتۆرەکانمان') + '</b><a href="#/doctors">' + T('See all', 'هەمووی') + '</a></div><div class="hscroll">' + allDocs().map(docCard).join('') + '</div>';
    html += '<div class="sec"><b>' + T('Visit us', 'سەردانمان بکە') + '</b></div><div class="card info">' +
      '<div class="li"><span class="c mint">' + i('home') + '</span><span class="grow"><div class="row-t">' + CLINIC.name + '</div><div class="row-s">' + esc(P(CLINIC.address)) + '</div></span></div>' +
      '<div class="li"><span class="c blue">' + i('clock') + '</span><span class="grow"><div class="row-t">' + T('Opening hours', 'کاتی دەوام') + '</div><div class="row-s">' + P(CLINIC.hours) + '</div></span></div>' +
      '<div class="row mt"><a class="btn out sm grow" href="tel:' + CLINIC.phone + '">' + i('phone', 's') + T('Call', 'پەیوەندی') + '</a><a class="btn wa sm grow" target="_blank" rel="noopener" href="' + waLink('') + '">' + i('whatsapp', 's') + 'WhatsApp</a><a class="btn out sm grow" target="_blank" rel="noopener" href="' + CLINIC.map + '">' + i('globe', 's') + T('Directions', 'ڕێگا') + '</a></div></div>' +
      '<p class="demo">' + T('Demo app · sample data only', 'ئەپی نموونە · تەنها داتای نموونەیی') + '</p></div>' + tabbar('home');
    return {
      html,
      mount(root) {
        const sc = root.querySelector('[data-heros]'), dots = root.querySelectorAll('[data-dots] i');
        if (!sc) return;
        const idx = () => Math.round(Math.abs(sc.scrollLeft) / sc.clientWidth);
        sc.addEventListener('scroll', () => { const k = idx(); dots.forEach((d, j) => d.classList.toggle('on', j === k)); }, { passive: true });
        clearInterval(window.__heroT);
        window.__heroT = setInterval(() => { if (!document.body.contains(sc)) return clearInterval(window.__heroT); const k = (idx() + 1) % Math.max(1, PROMOS.filter((p) => !p.off).length); sc.scrollTo({ left: (KU ? -1 : 1) * k * (sc.clientWidth + 12), behavior: 'smooth' }); }, 4500);
      }
    };
  };
  function docCard(d) {
    const fav = S.favs.includes(d.id);
    return '<a class="dc" href="#/doctor/' + d.id + '"><div class="ph">' + portrait(d.id) + '<span class="rt">' + i('star') + N(d.rating.toFixed(1)) + '</span><button class="fav ' + (fav ? 'on' : '') + '" data-a="fav" data-x="' + d.id + '" aria-label="' + T('Favourite', 'دڵخواز') + '">' + I('star') + '</button></div><b>' + esc(d.sn) + '</b><small>' + esc(d.sp) + '</small><button class="bk" data-a="bookdoc" data-x="' + d.id + '">' + T('Book', 'نۆرە بگرە') + '</button></a>';
  }

  /* ----- services ----- */
  const SV = { cat: 'all' };
  SCREENS.services = () => {
    const list = SERVICES.map((s) => svc(s[0])).filter((s) => !s.hidden).filter((s) => SV.cat === 'all' || s.cat === SV.cat);
    return {
      html: '<div class="page">' + top(T('Treatments', 'چارەسەرەکان'), T('Prices are starting prices', 'نرخەکان نرخی دەستپێکن')) +
        '<div class="chips">' + [['all', T('All', 'هەموو')]].concat(CATS.map((c) => [c[0], KU ? c[2] : c[1]])).map(([k, l]) => '<button class="chip ' + (SV.cat === k ? 'on' : '') + '" data-a="svcat" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        list.map((s) => '<a class="svrow" href="#/service/' + s.id + '"><span class="art">' + ART.tooth(s.art) + '</span><span class="grow"><div class="row-t">' + esc(s.name) + '</div><div class="row-s">' + esc(s.desc) + '</div><div class="row-s" style="margin-top:2px">' + N(s.min) + T(' min', ' خولەک') + ' · ' + T('from ', 'لە ') + money(s.price) + '</div></span><span class="muted">' + i(FWD, 's') + '</span></a>').join('') +
        '</div>' + tabbar('')
    };
  };
  SCREENS.service = (id) => {
    const s = svc(id);
    if (!s) return SCREENS.services();
    const ds = allDocs().filter((d) => d.services.includes(id));
    const steps = {
      general: [T('Exam and digital x-ray if needed', 'پشکنین و تیشکی دیجیتاڵ ئەگەر پێویست بێت'), T('Clear plan and price before we start', 'پلان و نرخی ڕوون پێش دەستپێکردن'), T('Aftercare advice sent to the app', 'ئامۆژگاری دوای چارەسەر لە ئەپەکەدا')],
      cosmetic: [T('Digital smile preview', 'پێشبینینی دیجیتاڵی بزە'), T('Shade matched to your face', 'ڕەنگی گونجاو لەگەڵ ڕووخسارت'), T('Follow-up visit included', 'سەردانی بەدواداچوون لەخۆدەگرێت')],
      ortho: [T('3D scan, no messy impressions', 'سکانی سێ ڕەهەندی بەبێ قاڵبی ناخۆش'), T('Monthly check-ins you book here', 'سەردانی مانگانە کە لێرە دەیگریت'), T('Instalments available', 'قیست بەردەستە')],
      implant: [T('3D scan and planning', 'سکان و پلانی سێ ڕەهەندی'), T('Gentle local anaesthesia', 'بێهۆشکردنی ناوچەیی نەرم'), T('Instalments available', 'قیست بەردەستە')],
      kids: [T('Calm, playful first visit', 'سەردانی یەکەمی ئارام و خۆش'), T('Free fluoride this month', 'فلۆرایدی بەخۆڕایی ئەم مانگە'), T('Parents stay in the room', 'دایک و باوک لە ژوورەکەدا دەمێننەوە')]
    }[s.cat];
    return {
      html: '<div class="page nobar">' + top(esc(s.name), esc(catName(s.cat))) +
        '<div style="height:190px;border-radius:24px;background:radial-gradient(120% 140% at 50% 20%,#2C5C8F 0%,#1B2B4F 60%,#14213D 100%);position:relative;overflow:hidden"><svg viewBox="0 0 300 190" style="position:absolute;inset:0;width:100%;height:100%"><circle cx="150" cy="96" r="80" fill="#67CDAB" opacity=".14"/><circle cx="150" cy="96" r="54" fill="#67CDAB" opacity=".16"/></svg><div style="position:absolute;left:50%;top:18px;width:150px;height:160px;margin-left:-75px">' + ART.tooth(s.art) + '</div></div>' +
        '<div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><span class="c blue">' + i('clock', 's') + '</span><b>' + N(s.min) + T(' min', ' خولەک') + '</b><small>' + T('per visit', 'بۆ هەر سەردانێک') + '</small></div><div class="stat"><span class="c amber">' + i('wallet', 's') + '</span><b>' + money(s.price) + '</b><small>' + T('starting price', 'نرخی دەستپێک') + '</small></div></div>' +
        '<p class="p mt">' + esc(s.desc) + '.</p>' +
        '<div class="lbl">' + T('What to expect', 'چی چاوەڕێ بکەیت') + '</div><div class="card">' + steps.map((x, k) => '<div class="li' + (k ? ' mt' : '') + '"><span class="c mint" style="width:30px;height:30px;border-radius:10px">' + i('check', 's') + '</span><span class="grow p" style="color:var(--text)">' + x + '</span></div>').join('') + '</div>' +
        '<div class="lbl">' + T('Doctors', 'دکتۆرەکان') + '</div>' + ds.map((d) => '<a class="svrow" href="#/doctor/' + d.id + '"><span class="dav">' + portrait(d.id) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + esc(d.sp) + ' · ' + i('star', 's') + ' ' + N(d.rating.toFixed(1)) + '</div></span><span class="muted">' + i(FWD, 's') + '</span></a>').join('') +
        '</div><div class="foot"><a class="btn wa lg" style="padding-inline:14px" target="_blank" rel="noopener" href="' + waLink(T('Hello, I have a question about ', 'سڵاو، پرسیارێکم هەیە دەربارەی ') + s.name) + '">' + i('whatsapp', 'l') + '</a><a class="btn pri lg grow" href="#/book?svc=' + id + '">' + i('calendar') + T('Book this treatment', 'نۆرە بۆ ئەم چارەسەرە بگرە') + '</a></div>'
    };
  };

  /* ----- doctors ----- */
  const DV = { q: '', f: 'all' };
  SCREENS.doctors = (x, q) => {
    if (q.fav) DV.f = 'fav';
    let list = allDocs();
    if (DV.f === 'fav') list = list.filter((d) => S.favs.includes(d.id));
    else if (DV.f !== 'all') list = list.filter((d) => d.services.some((s) => svc(s).cat === DV.f && s !== 'consult'));
    if (DV.q) { const k = DV.q.toLowerCase(); list = list.filter((d) => (d.en + ' ' + d.ku + ' ' + d.spec.join(' ')).toLowerCase().includes(k)); }
    return {
      html: '<div class="page">' + top(T('Doctors', 'دکتۆرەکان'), N(allDocs().length) + T(' specialists', ' پسپۆڕ')) +
        '<label class="search">' + i('search') + '<input data-dq placeholder="' + T('Search by name or specialty', 'گەڕان بەپێی ناو یان پسپۆڕی') + '" value="' + esc(DV.q) + '"></label>' +
        '<div class="chips">' + [['all', T('All', 'هەموو')], ['fav', T('Favourites', 'دڵخوازەکان')]].concat(CATS.filter((c) => c[0] !== 'general').map((c) => [c[0], KU ? c[2] : c[1]])).map(([k, l]) => '<button class="chip ' + (DV.f === k ? 'on' : '') + '" data-a="dfilter" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        (list.length ? '<div class="dgrid">' + list.map(docCard).join('') + '</div>' : '<div class="empty"><div class="c">' + i('users', 'xl') + '</div>' + (DV.f === 'fav' ? T('Tap the star on a doctor to save them here', 'ئەستێرەی سەر دکتۆرێک دابگرە بۆ ئەوەی لێرە پاشەکەوت بێت') : T('No doctors found', 'هیچ دکتۆرێک نەدۆزرایەوە')) + '</div>') +
        '</div>' + tabbar(''),
      mount(root) {
        const inp = root.querySelector('[data-dq]');
        inp.addEventListener('input', () => { DV.q = inp.value; const pos = inp.selectionStart; render(); const n = app().querySelector('[data-dq]'); n.focus(); n.setSelectionRange(pos, pos); });
      }
    };
  };
  const DS = { date: null, doc: null };
  SCREENS.doctor = (id) => {
    const d = doc(id);
    if (!d) return SCREENS.doctors(null, {});
    if (DS.doc !== id) { DS.doc = id; DS.date = null; }
    const days = [];
    for (let k = 0; days.length < 10 && k < 20; k++) { const x = addDays(today(), k); if (!isOff(id, x)) days.push(x); }
    if (!DS.date || !days.includes(DS.date)) DS.date = days.find((x) => slots(id, x).some((s) => s.free)) || days[0];
    const sl = slots(id, DS.date);
    const fav = S.favs.includes(id);
    const todayOpen = !isOff(id, today()) && slots(id, today()).some((s) => s.free);
    const nf = nextFree(id);
    const reviews = REVIEWS.map((r, k) => ({ n: KU ? r[1] : r[0], s: r[2], t: KU ? r[4] : r[3], d: addDays(today(), -(k * 9 + 3)) }));
    return {
      html: '<div class="page flush nobar"><div class="cover">' + portrait(id, 'xMidYMax meet') + '<div class="tb"><button class="gb" data-a="back">' + i(BACK) + '</button><span class="row"><button class="gb ' + (fav ? 'on' : '') + '" data-a="fav" data-x="' + id + '" aria-label="' + T('Favourite', 'دڵخواز') + '">' + I('star') + '</button><button class="gb" data-a="share" data-x="' + id + '">' + i('link') + '</button></span></div></div>' +
        '<div class="sheet-top"><div class="nm"><span><b>' + esc(d.name) + '</b><small>' + esc(d.sp) + '</small></span>' + (todayOpen ? '<span class="badge b-mint">' + i('check', 's') + T('Available today', 'ئەمڕۆ بەردەستە') + '</span>' : nf ? '<span class="badge b-blue">' + T('Next: ', 'داهاتوو: ') + rel(nf.date) + '</span>' : '') + '</div>' +
        '<div class="stats">' + [['star', 'amber', N(d.rating.toFixed(1)), N(d.reviews) + T(' reviews', ' هەڵسەنگاندن')], ['users', 'mint', N(d.patients.toLocaleString('en-US')), T('patients', 'نەخۆش')], ['shield', 'blue', N(d.years), T('years', 'ساڵ ئەزموون')]].map(([ic, c, v, l]) => '<div class="stat"><span class="c ' + c + '">' + i(ic, 's') + '</span><b>' + v + '</b><small>' + l + '</small></div>').join('') + '</div>' +
        '<div class="lbl">' + T('About', 'دەربارە') + '</div><p class="p">' + esc(d.about) + '</p>' +
        '<div class="lbl">' + T('Treatments', 'چارەسەرەکان') + '</div><div class="tags">' + d.services.filter((s) => svc(s) && !svc(s).hidden).map((s) => '<a class="tag" href="#/service/' + s + '">' + esc(svc(s).name) + '</a>').join('') + '</div>' +
        (Array.isArray(d.gallery) && d.gallery.length ? '<div class="lbl">' + T('Smile gallery', 'گەلەریی بزە') + '<span>' + T('shared with patient consent', 'بە ڕەزامەندی نەخۆش') + '</span></div><div class="gal">' + d.gallery.map((g) => '<div class="ba"><img src="' + esc(g.src) + '" alt="">' + (g.tag && P(g.tag) ? '<span class="tg">' + esc(P(g.tag)) + '</span>' : '') + '</div>').join('') + '</div>' : (!Array.isArray(d.gallery) && ['d2', 'd3', 'd4'].includes(id) ? '<div class="lbl">' + T('Smile gallery', 'گەلەریی بزە') + '<span>' + T('shared with patient consent', 'بە ڕەزامەندی نەخۆش') + '</span></div><div class="gal"><div class="ba">' + ART.smile(0) + '<span class="tg">' + T('Before', 'پێش') + '</span></div><div class="ba">' + ART.smile(1) + '<span class="tg">' + T('After', 'دوای') + '</span></div><div class="ba">' + ART.smile(1, true) + '<span class="tg">' + (id === 'd3' ? T('Aligners', 'ئەلاینەر') : T('Veneers', 'ڤینیەر')) + '</span></div></div>' : '')) +
        '<div class="lbl">' + T('Free times', 'کاتە بەتاڵەکان') + '<span>' + MONF[dt(DS.date).getMonth()] + '</span></div>' +
        '<div class="days">' + days.map((x) => '<button class="d ' + (x === DS.date ? 'on' : '') + '" data-a="dsday" data-x="' + x + '"><small>' + (x === today() ? T('Today', 'ئەمڕۆ') : DAYS[dow(x)]) + '</small><b>' + dd(x) + '</b></button>').join('') + '</div>' +
        (sl.some((s) => s.free) ? '<div class="slots">' + sl.filter((s) => s.free).slice(0, 8).map((s) => '<button class="sl" data-a="dsslot" data-x="' + s.t + '">' + fTime(s.t).split(' ')[0] + '</button>').join('') + '</div>' : '<div class="empty" style="padding:14px">' + T('Fully booked this day', 'ئەم ڕۆژە پڕە') + '</div>') +
        '<div class="lbl">' + T('Reviews', 'هەڵسەنگاندنەکان') + '<span>' + stars(Math.round(d.rating)) + ' ' + N(d.rating.toFixed(1)) + '</span></div>' +
        reviews.map((r) => '<div class="rev"><div class="row between"><b style="font-size:13.5px">' + esc(r.n) + '</b>' + stars(r.s) + '</div><p class="p small" style="margin-top:4px">' + esc(r.t) + '</p><div class="small muted" style="margin-top:2px">' + ago(r.d) + '</div></div>').join('') +
        '</div></div><div class="foot"><a class="btn wa lg" style="padding-inline:14px" target="_blank" rel="noopener" href="' + waLink(T('Hello, I would like to book with ', 'سڵاو، دەمەوێت نۆرە بگرم لای ') + d.name) + '">' + i('whatsapp', 'l') + '</a><button class="btn pri lg grow" data-a="bookdoc" data-x="' + id + '">' + i('calendar') + T('Book with ', 'نۆرە لای ') + esc(d.sn) + '</button></div>'
    };
  };

  /* ----- booking flow ----- */
  let B = { svc: null, doc: null, date: null, time: null, note: '', remind: true, editId: null, lock: null };
  function startBooking(q) {
    B = { svc: q.svc || null, doc: q.doc || null, date: null, time: null, note: '', remind: S.settings.remind, editId: null, lock: q.doc ? 'doc' : null };
    if (B.svc && B.doc && !doc(B.doc).services.includes(B.svc)) B.doc = null;
    go(B.svc ? (B.doc ? '#/book/time' : '#/book/doc') : '#/book/svc', true);
  }
  const STEPNAMES = [T('Treatment', 'چارەسەر'), T('Doctor', 'دکتۆر'), T('Date & time', 'ڕۆژ و کات'), T('Confirm', 'پشتڕاستکردنەوە')];
  const stepBar = (k) => '<div class="steps">' + STEPNAMES.map((l, j) => '<div class="st ' + (j < k ? 'done' : j === k ? 'on' : '') + '"><i></i><span>' + l + '</span></div>').join('') + '</div>';
  SCREENS.book = (step, q) => {
    if (!step) { startBooking(q); return null; }
    if (step !== 'svc' && step !== 'done' && !B.svc) { go('#/book/svc', true); return null; }
    if ((step === 'time' || step === 'review') && !B.doc) { go('#/book/doc', true); return null; }
    const title = B.editId ? T('Change appointment', 'گۆڕینی نۆرە') : T('New appointment', 'نۆرەی نوێ');
    if (step === 'svc') {
      const list = SERVICES.map((s) => svc(s[0])).filter((s) => !s.hidden).filter((s) => !B.doc || doc(B.doc).services.includes(s.id));
      return {
        html: '<div class="page nobar">' + top(title, B.doc ? T('with ', 'لای ') + esc(doc(B.doc).name) : '') + stepBar(0) +
          '<div class="lbl" style="margin-top:0">' + T('What do you need?', 'چیت پێویستە؟') + '</div>' +
          list.map((s) => '<button class="svrow ' + (B.svc === s.id ? 'on' : '') + '" data-a="bsvc" data-x="' + s.id + '"><span class="art">' + ART.tooth(s.art) + '</span><span class="grow"><div class="row-t">' + esc(s.name) + '</div><div class="row-s">' + N(s.min) + T(' min', ' خولەک') + ' · ' + T('from ', 'لە ') + money(s.price) + '</div></span><span class="radio"></span></button>').join('') +
          '<p class="small muted mt">' + T('Not sure? Choose “Check-up & consultation” and the doctor will advise you.', 'دڵنیا نیت؟ «پشکنین و ڕاوێژ» هەڵبژێرە و دکتۆرەکە ئامۆژگاریت دەکات.') + '</p></div>' +
          '<div class="foot"><button class="btn pri lg block" data-a="bnext" ' + (B.svc ? '' : 'disabled') + '>' + T('Continue', 'بەردەوامبە') + i(FWD, 's') + '</button></div>'
      };
    }
    if (step === 'doc') {
      const s = svc(B.svc);
      const ds = allDocs().filter((d) => d.services.includes(B.svc));
      const any = ds.map((d) => ({ d, n: nextFree(d.id, s.min) })).filter((x) => x.n).sort((a, b) => (a.n.date + a.n.time < b.n.date + b.n.time ? -1 : 1))[0];
      const opt = (id, img, name, sub, extra) => '<button class="svrow ' + (B.doc === id ? 'on' : '') + '" data-a="bdoc" data-x="' + id + '">' + img + '<span class="grow"><div class="row-t">' + name + '</div><div class="row-s">' + sub + '</div>' + (extra ? '<div class="row-s" style="color:var(--mint-2);font-weight:600">' + extra + '</div>' : '') + '</span><span class="radio"></span></button>';
      return {
        html: '<div class="page nobar">' + top(title, esc(s.name)) + stepBar(1) +
          '<div class="lbl" style="margin-top:0">' + T('Choose a doctor', 'دکتۆر هەڵبژێرە') + '</div>' +
          (ds.length > 1 && any ? opt('any', '<span class="dav c mint" style="display:grid;place-items:center">' + i('sparkles', 'l') + '</span>', T('First available', 'یەکەم کاتی بەتاڵ'), T('Any doctor who does this treatment', 'هەر دکتۆرێک کە ئەم چارەسەرە دەکات'), rel(any.n.date) + ' · ' + fTime(any.n.time)) : '') +
          ds.map((d) => { const n = nextFree(d.id, s.min); return opt(d.id, '<span class="dav">' + portrait(d.id) + '</span>', esc(d.name) + (S.favs.includes(d.id) ? ' <span style="color:#E05656">♥</span>' : ''), esc(d.sp) + ' · ★ ' + N(d.rating.toFixed(1)), n ? T('Next free: ', 'یەکەم کات: ') + rel(n.date) + ' · ' + fTime(n.time) : ''); }).join('') + '</div>' +
          '<div class="foot"><button class="btn pri lg block" data-a="bnext" ' + (B.doc ? '' : 'disabled') + '>' + T('Continue', 'بەردەوامبە') + i(FWD, 's') + '</button></div>'
      };
    }
    if (step === 'time') {
      const s = svc(B.svc);
      const docs = B.doc && B.doc !== 'any' ? [B.doc] : allDocs().filter((d) => d.services.includes(B.svc)).map((d) => d.id);
      const days = [];
      for (let k = 0; k < 21; k++) days.push(addDays(today(), k));
      const open = (x) => docs.some((id) => !isOff(id, x) && slots(id, x, s.min).some((y) => y.free));
      if (!B.date || !open(B.date)) B.date = days.find(open) || days[0];
      const merged = {};
      docs.forEach((id) => slots(id, B.date, s.min).forEach((y) => { if (y.free && !merged[y.t]) merged[y.t] = id; else if (!(y.t in merged)) merged[y.t] = null; }));
      const times = Object.keys(merged).sort();
      const groups = [[T('Afternoon', 'دوانیوەڕۆ'), (t) => toMin(t) < 17 * 60], [T('Evening', 'ئێوارە'), (t) => toMin(t) >= 17 * 60]];
      return {
        html: '<div class="page nobar">' + top(title, esc(s.name) + ' · ' + (B.doc === 'any' ? T('first available', 'یەکەم کاتی بەتاڵ') : esc(doc(B.doc).sn))) + stepBar(2) +
          '<div class="lbl" style="margin-top:0">' + MONF[dt(B.date).getMonth()] + ' ' + N(dt(B.date).getFullYear()) + '<span>' + T('Closed on Fridays', 'هەینی داخراوە') + '</span></div>' +
          '<div class="days">' + days.map((x) => '<button class="d ' + (x === B.date ? 'on' : '') + (open(x) ? '' : ' off') + '" data-a="bday" data-x="' + x + '"><small>' + (x === today() ? T('Today', 'ئەمڕۆ') : DAYS[dow(x)]) + '</small><b>' + dd(x) + '</b></button>').join('') + '</div>' +
          groups.map(([l, f]) => { const ts = times.filter(f); return ts.length ? '<div class="lbl">' + l + '</div><div class="slots">' + ts.map((t) => '<button class="sl ' + (merged[t] ? '' : 'x') + (B.time === t ? ' on' : '') + '" data-a="btime" data-x="' + t + '">' + fTime(t).split(' ')[0] + '</button>').join('') + '</div>' : ''; }).join('') +
          '<p class="small muted mt">' + T('Times shown are the start of a ', 'کاتەکان دەستپێکی ') + N(s.min) + T('-minute visit.', ' خولەک سەردانن.') + '</p></div>' +
          '<div class="foot"><button class="btn pri lg block" data-a="bnext" ' + (B.time ? '' : 'disabled') + '>' + (B.time ? fDate(B.date, true) + ' · ' + fTime(B.time) : T('Pick a time', 'کاتێک هەڵبژێرە')) + '</button></div>'
      };
    }
    if (step === 'review') {
      if (!B.time) { go('#/book/time', true); return null; }
      const s = svc(B.svc), d = doc(B.doc);
      return {
        html: '<div class="page nobar">' + top(title, '') + stepBar(3) +
          '<div class="card"><div class="li"><span class="dav">' + portrait(B.doc) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + esc(d.sp) + '</div></span></div>' +
          '<div class="mt">' + [[T('Treatment', 'چارەسەر'), esc(s.name)], [T('Date', 'ڕۆژ'), fDate(B.date, true)], [T('Time', 'کات'), fTime(B.time) + ' · ' + N(s.min) + T(' min', ' خولەک')], [T('Price from', 'نرخ لە'), money(s.price)], [T('Where', 'شوێن'), esc(P(CLINIC.address))]].map(([a, b]) => '<div class="sum"><span>' + a + '</span><b>' + b + '</b></div>').join('') + '</div></div>' +
          '<div class="lbl">' + T('Anything we should know?', 'شتێک هەیە پێویست بێت بیزانین؟') + '<span>' + T('optional', 'ئارەزوومەندانە') + '</span></div><textarea class="in" data-bnote placeholder="' + T('e.g. pain on the lower left, nervous about needles', 'بۆ نموونە: ئازار لە لای چەپی خوارەوە، ترس لە دەرزی') + '">' + esc(B.note) + '</textarea>' +
          '<div class="card mt"><div class="toggle" style="padding:2px 0"><span class="c wa" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('whatsapp') + '</span><span class="grow"><div class="row-t">' + T('Remind me on WhatsApp', 'لە واتسئاپ بیرم بخەرەوە') + '</div><div class="row-s">' + T('One day before the visit', 'ڕۆژێک پێش سەردانەکە') + '</div></span><button class="sw ' + (B.remind ? 'on' : '') + '" data-a="bremind" aria-label="remind"></button></div></div>' +
          '<p class="small muted mt">' + i('info', 's') + ' ' + T('Free to change or cancel up to 24 hours before.', 'دەتوانیت بەبێ تێچوو تا ٢٤ کاتژمێر پێشتر بیگۆڕیت یان هەڵیبوەشێنیتەوە.') + '</p></div>' +
          '<div class="foot"><button class="btn pri lg block" data-a="bconfirm">' + i('check') + (B.editId ? T('Save the new time', 'پاشەکەوتکردنی کاتی نوێ') : T('Request appointment', 'داواکردنی نۆرە')) + '</button></div>',
        mount(root) { const ta = root.querySelector('[data-bnote]'); ta.addEventListener('input', () => { B.note = ta.value; }); }
      };
    }
    if (step === 'done') {
      const a = S.appts.find((x) => x.id === B.lastId);
      if (!a) { go('#/visits', true); return null; }
      const s = svc(a.svc), d = doc(a.doc);
      return {
        html: '<div class="page nobar center"><div class="done-art">' + i('check') + '</div><h1 class="h2">' + T('Request sent', 'داواکارییەکە نێردرا') + '</h1><p class="p mt" style="max-width:320px;margin-inline:auto">' + T('The clinic will confirm your appointment on WhatsApp shortly. You will also see it here.', 'کلینیک بەم زووانە لە واتسئاپ نۆرەکەت پشتڕاست دەکاتەوە. لێرەش دەیبینیت.') + '</p>' +
          '<div class="card mt2" style="text-align:start"><div class="li"><span class="cal"><small>' + MON[dt(a.date).getMonth()] + '</small><b>' + dd(a.date) + '</b></span><span class="grow"><div class="row-t">' + esc(s.name) + '</div><div class="row-s">' + fDate(a.date, true) + ' · ' + fTime(a.time) + '</div><div class="row-s">' + esc(d.name) + '</div></span></div></div>' +
          '<button class="btn out lg block mt" data-a="ics" data-x="' + a.id + '">' + i('calendar') + T('Add to calendar', 'زیادکردن بۆ ڕۆژژمێر') + '</button><a class="btn navy lg block mt" href="#/visits">' + T('See my visits', 'نۆرەکانم ببینە') + '</a><a class="btn lg block mt" href="#/home" style="color:var(--mint-2)">' + T('Back to home', 'گەڕانەوە بۆ سەرەکی') + '</a></div>'
      };
    }
    return null;
  };

  /* ----- visits ----- */
  const VV = { tab: 'up' };
  SCREENS.visits = () => {
    const ups = upcoming(), ps = past();
    let body = '';
    if (VV.tab === 'up') {
      body = ups.length ? ups.map((a, k) => visitCard(a, k === 0)).join('') : '<div class="empty"><div class="c">' + i('calendar', 'xl') + '</div>' + T('No upcoming visits', 'هیچ نۆرەیەکی داهاتووت نییە') + '<div class="mt"><a class="btn mint" href="#/book">' + T('Book a visit', 'نۆرە بگرە') + '</a></div></div>';
    } else {
      body = ps.length ? ps.map((a) => visitCard(a, false)).join('') : '<div class="empty">' + T('No past visits yet', 'هێشتا هیچ سەردانێکی پێشووت نییە') + '</div>';
    }
    return {
      html: '<div class="page">' + top(T('My visits', 'نۆرەکانم'), '', false, '<a class="ib" href="#/book">' + i('plus') + '</a>') +
        '<div class="seg"><button class="' + (VV.tab === 'up' ? 'on' : '') + '" data-a="vtab" data-x="up">' + T('Upcoming', 'داهاتوو') + ' (' + N(ups.length) + ')</button><button class="' + (VV.tab === 'past' ? 'on' : '') + '" data-a="vtab" data-x="past">' + T('Past', 'ڕابردوو') + ' (' + N(ps.length) + ')</button></div>' + body + '</div>' + tabbar('visits')
    };
  };
  function visitCard(a, big) {
    const s = svc(a.svc), d = doc(a.doc);
    const name = esc(s.name) + (a.step ? ' (' + N(a.step[0] + '/' + a.step[1]) + ')' : '');
    const active = ['pending', 'confirmed'].includes(a.status) && a.date >= today();
    let acts = '';
    if (active) acts = '<div class="acts"><button class="btn out sm" data-a="ics" data-x="' + a.id + '">' + i('calendar', 's') + T('Calendar', 'ڕۆژژمێر') + '</button><button class="btn out sm" data-a="resched" data-x="' + a.id + '">' + i('clock', 's') + T('Change', 'گۆڕین') + '</button><button class="btn ' + (big ? 'out' : 'red') + ' sm" data-a="cancel" data-x="' + a.id + '">' + i('x', 's') + T('Cancel', 'هەڵوەشاندنەوە') + '</button></div>';
    else if (a.status === 'done') acts = '<div class="acts"><button class="btn soft sm" data-a="again" data-x="' + a.id + '">' + i('refresh', 's') + T('Book again', 'دووبارە نۆرە بگرە') + '</button>' + ((S.rated || {})[a.id] || a.rated ? '<span class="btn sm" style="flex:0">' + stars((S.rated || {})[a.id] || a.rated) + '</span>' : '<button class="btn out sm" data-a="rate" data-x="' + a.id + '">' + i('star', 's') + T('Rate visit', 'هەڵسەنگاندن') + '</button>') + '</div>';
    if (big) {
      const n = diff(a.date, today());
      return '<div class="vc big"><div class="row between" style="position:relative;z-index:1"><span class="row-s">' + T('Next visit', 'نۆرەی داهاتوو') + ' · ' + (n === 0 ? T('today', 'ئەمڕۆ') : n === 1 ? T('tomorrow', 'سبەینێ') : T('in ' + n + ' days', 'دوای ' + N(n) + ' ڕۆژ')) + '</span>' + statusBadge(a.status) + '</div>' +
        '<div class="when">' + fDate(a.date, true) + ' · ' + fTime(a.time) + '</div><div class="row-s" style="position:relative;z-index:1">' + name + ' · ' + N(s.min) + T(' min', ' خولەک') + '</div>' +
        '<div class="li mt" style="position:relative;z-index:1;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)"><span class="dav" style="width:36px;height:36px;border-radius:11px">' + portrait(a.doc) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + esc(P(CLINIC.address)) + '</div></span><a class="ib" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff" target="_blank" rel="noopener" href="' + CLINIC.map + '">' + i('globe') + '</a></div>' + acts + '</div>';
    }
    return '<div class="vc"><div class="r1"><span class="cal"><small>' + MON[dt(a.date).getMonth()] + '</small><b>' + dd(a.date) + '</b></span><span class="grow"><div class="row-t">' + name + '</div><div class="row-s">' + fDate(a.date, true) + ' · ' + fTime(a.time) + '</div><div class="row-s">' + esc(d.name) + '</div></span></div><div class="mt" style="margin-top:8px">' + statusBadge(a.status) + '</div>' + (a.note ? '<p class="small muted" style="margin-top:6px">“' + esc(a.note) + '”</p>' : '') + acts + '</div>';
  }

  /* ----- my file ----- */
  SCREENS.file = (x, q) => {
    const tab = ['visits', 'rx', 'xray', 'bills'].includes(q.tab) ? q.tab : 'visits';
    const p = S.profile;
    let html = '<div class="page">' + top(T('My file', 'پەڕگەکەم'), '', false, '<button class="ib" data-a="sharefile">' + i('download') + '</button>') +
      '<div class="pcard"><span class="me">' + ART.person(ME) + '</span><span class="grow"><div class="row-t" style="font-size:16px">' + esc(p.name) + '</div><div class="row-s">' + T('File #', 'پەڕگەی #') + N(p.file) + ' · ' + T('Blood ', 'خوێن ') + '<span class="ltr">' + p.blood + '</span></div><div class="row" style="margin-top:5px;flex-wrap:wrap">' + p.allergies.map((a) => '<span class="badge b-red">' + T('Allergy: ', 'هەستیاری: ') + esc(a) + '</span>').join('') + '</div></span></div>' +
      '<div class="seg mt">' + [['visits', T('Treatment', 'چارەسەر')], ['rx', T('Prescriptions', 'ڕەچەتە')], ['xray', T('X-rays', 'تیشک')], ['bills', T('Bills', 'پسوولە')]].map(([k, l]) => '<button class="' + (k === tab ? 'on' : '') + '" data-a="ftab" data-x="' + k + '">' + l + '</button>').join('') + '</div>';
    if (tab === 'visits') {
      html += S.plan.map((pl) => '<div class="plan"><div class="row between"><span class="small muted">' + T('Treatment plan', 'پلانی چارەسەر') + ' · ' + esc(doc(pl.doc).sn) + '</span>' + (pl.status === 'active' ? '<span class="badge b-blue">' + T('In progress', 'بەردەوامە') + '</span>' : '<span class="badge b-gray">' + T('Next step', 'هەنگاوی داهاتوو') + '</span>') + '</div><div class="row-t" style="font-size:15.5px;color:var(--navy);margin-top:4px">' + esc(pl.title) + '</div><div class="bar"><i style="width:' + Math.round(pl.done / pl.total * 100) + '%"></i></div><div class="row between small muted"><span>' + N(pl.done) + T(' of ', ' لە ') + N(pl.total) + T(' visits done', ' سەردان تەواوبوو') + '</span>' + (pl.status === 'active' && upcoming()[0] ? '<span>' + T('Next: ', 'داهاتوو: ') + rel(upcoming()[0].date) + '</span>' : '') + '</div></div>').join('');
      const up = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], lo = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
      html += '<div class="lbl">' + T('My teeth', 'ددانەکانم') + '<span>' + T('your right ← → your left', 'ڕاستت ← → چەپت') + '</span></div><div class="card"><div class="teeth">' + up.map((n) => '<span class="th ' + (S.teeth[n] || '') + '">' + n + '</span>').join('') + '</div><div class="teeth" style="margin-top:4px">' + lo.map((n) => '<span class="th ' + (S.teeth[n] || '') + '">' + n + '</span>').join('') + '</div><div class="legend"><span><i style="background:#DCE8F7"></i>' + T('Filling', 'پڕکراوەتەوە') + '</span><span><i style="background:#FBE3E3"></i>' + T('Root canal', 'چارەسەری ڕەگ') + '</span><span><i style="background:#E3E9EC"></i>' + T('Missing', 'نییە') + '</span></div></div>';
      const done = S.appts.filter((a) => a.status === 'done').sort((a, b) => (a.date < b.date ? 1 : -1));
      html += '<div class="lbl">' + T('Visit history', 'مێژووی سەردان') + '<span>' + N(done.length) + T(' visits', ' سەردان') + '</span></div><div class="tl">' + done.map((a) => {
        const rx = S.rx.find((r) => r.date === a.date), xr = S.xrays.find((y) => y.date === a.date), inv = S.invoices.find((v) => v.date === a.date);
        return '<div class="it"><span class="dt">' + i('check', 's') + '</span><div class="bx"><div class="r1"><span class="row-t">' + esc(svc(a.svc).name) + (a.step ? ' (' + N(a.step[0] + '/' + a.step[1]) + ')' : '') + '</span>' + (inv ? (paidOf(inv) >= inv.total ? '<span class="badge b-mint">' + T('Paid', 'دراوە') + '</span>' : '<span class="badge b-amber">' + T('Instalments', 'قیست') + '</span>') : '') + '</div><div class="row-s">' + fDate(a.date) + ' · ' + esc(doc(a.doc).name) + '</div>' + (rx || xr ? '<div class="att">' + (rx ? '<button data-a="rx" data-x="' + rx.id + '">' + i('pill', 's') + T('Prescription', 'ڕەچەتە') + '</button>' : '') + (xr ? '<button data-a="xray" data-x="' + xr.id + '">' + i('image', 's') + T('X-ray', 'تیشک') + '</button>' : '') + '</div>' : '') + '</div></div>';
      }).join('') + '</div>';
    }
    if (tab === 'rx') {
      html += S.rx.map((r) => '<button class="card" style="display:block;width:100%;text-align:start" data-a="rx" data-x="' + r.id + '"><div class="li"><span class="c blue">' + i('pill') + '</span><span class="grow"><div class="row-t">' + esc(r.meds.map((m) => m.n.split(' ')[0]).join(' · ')) + '</div><div class="row-s">' + fDate(r.date) + ' · ' + esc(doc(r.doc).name) + '</div></span><span class="muted">' + i(FWD, 's') + '</span></div></button>').join('');
    }
    if (tab === 'xray') {
      html += '<div class="xg">' + S.xrays.map((x2) => '<button class="xi ' + (x2.kind === 'pano' ? 'wide' : '') + '" data-a="xray" data-x="' + x2.id + '"><div class="im">' + ART.xray(x2.kind) + '</div><div class="tx"><div class="row-t" style="font-size:13px">' + esc(x2.title) + '</div><div class="row-s">' + fDate(x2.date) + '</div></div></button>').join('') + '</div>';
    }
    if (tab === 'bills') {
      const bal = balance();
      html += '<div class="vc big"><div class="row between" style="position:relative;z-index:1"><span class="row-s">' + T('Balance to pay', 'بڕی ماوە بۆ پارەدان') + '</span>' + (bal ? '<span class="badge b-amber">' + T('Instalment due', 'کاتی قیستە') + '</span>' : '<span class="badge b-mint">' + T('All paid', 'هەمووی دراوە') + '</span>') + '</div><div class="when">' + money(bal) + '</div>' + (bal ? '<div class="acts"><button class="btn pri" data-a="pay" data-x="' + (S.invoices.find((v) => paidOf(v) < v.total) || {}).id + '">' + i('wallet', 's') + T('Pay now', 'ئێستا بیدە') + '</button></div>' : '') + '</div>' +
        '<div class="lbl">' + T('Invoices', 'پسوولەکان') + '</div>' + S.invoices.map((v) => { const pd = paidOf(v), left = v.total - pd; return '<button class="card" style="display:block;width:100%;text-align:start" data-a="inv" data-x="' + v.id + '"><div class="li"><span class="c ' + (left > 0 ? 'amber' : 'mint') + '">' + i('receipt') + '</span><span class="grow"><div class="row-t ltr" style="text-align:start">' + v.id + '</div><div class="row-s">' + fDate(v.date) + ' · ' + esc(v.items[0][0]) + '</div></span><span class="e"><div class="amt">' + money(v.total) + '</div>' + (left > 0 ? '<span class="badge b-amber">' + money(left) + T(' left', ' ماوە') + '</span>' : '<span class="badge b-mint">' + T('Paid', 'دراوە') + '</span>') + '</span></div></button>'; }).join('');
    }
    return { html: html + '</div>' + tabbar('file') };
  };

  /* ----- notifications ----- */
  SCREENS.notifications = () => ({
    html: '<div class="page">' + top(T('Notifications', 'ئاگادارکردنەوەکان'), '', true, unread() ? '<button class="btn sm soft" data-a="readall">' + T('Mark all read', 'هەمووی خوێندرایەوە') + '</button>' : '') +
      (S.notes.length ? S.notes.map((n) => '<button class="nt ' + (n.read ? '' : 'unread') + '" data-a="note" data-x="' + n.id + '"><span class="c ' + n.c + '" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none">' + i(n.icon) + '</span><span class="grow"><div class="row-t">' + esc(n.t) + '</div><div class="row-s">' + esc(n.s) + '</div><div class="small muted" style="margin-top:2px">' + ago(n.at) + '</div></span></button>').join('') : '<div class="empty">' + T('Nothing new', 'هیچ شتێکی نوێ نییە') + '</div>') + '</div>' + tabbar('')
  });

  /* ----- chat ----- */
  SCREENS.chat = () => {
    let last = '';
    const msgs = S.chat.map((m) => { const day = m.at.slice(0, 10); const tag = day !== last ? '<span class="daytag">' + rel(day) + '</span>' : ''; last = day; return tag + '<div class="msg ' + (m.me ? 'mine' : 'them') + '">' + esc(m.t) + '<small>' + fTime(m.at.slice(11, 16)) + '</small></div>'; }).join('');
    const qr = [T('Book an appointment', 'دەمەوێت نۆرە بگرم'), T('Prices', 'نرخەکان'), T('Opening hours', 'کاتی دەوام'), T('Where are you?', 'لە کوێن؟'), T('I have pain', 'ئازارم هەیە')];
    return {
      html: '<div class="page nobar" style="padding-bottom:150px"><div class="chathd"><button class="ib" data-a="back">' + i(BACK) + '</button>' + ART.logo(42) + '<span class="grow"><div class="row-t">' + T('Bite reception', 'پێشوازیی Bite') + '</div><div class="row-s"><span style="color:var(--mint-2)">●</span> ' + T('Usually replies within minutes', 'بە زۆری لە چەند خولەکێکدا وەڵام دەداتەوە') + '</div></span><a class="ib" href="tel:' + CLINIC.phone + '">' + i('phone') + '</a></div><div class="msgs" data-msgs>' + msgs + '</div></div>' +
        '<div class="compose" style="bottom:0;padding-bottom:calc(12px + var(--safe-b))"><div class="qr">' + qr.map((x2) => '<button data-a="qr">' + esc(x2) + '</button>').join('') + '</div><form class="bx" data-cf><input data-ci placeholder="' + T('Write a message…', 'نامەیەک بنووسە…') + '" autocomplete="off"><button class="send" type="submit" aria-label="send">' + i('play') + '</button></form></div>',
      mount(root) {
        window.scrollTo(0, document.body.scrollHeight);
        root.querySelector('[data-cf]').addEventListener('submit', (e) => { e.preventDefault(); const inp = root.querySelector('[data-ci]'); const v = inp.value.trim(); if (v) sendChat(v); });
      }
    };
  };
  function nowStamp() { const d = new Date(); return ymd(d) + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function sendChat(text) {
    S.chat.push({ me: true, t: text, at: nowStamp() }); save(); render();
    const box = app().querySelector('[data-msgs]');
    if (box) { const t = document.createElement('div'); t.className = 'msg them typing'; t.textContent = '•••'; box.appendChild(t); window.scrollTo(0, document.body.scrollHeight); }
    const k = text.toLowerCase();
    let r = T('Thank you! A member of our team will reply shortly.', 'سوپاس! یەکێک لە ستافەکەمان بەم زووانە وەڵامت دەداتەوە.');
    if (/price|cost|نرخ|پارە/.test(k)) r = T('Check-up 25,000 IQD · Cleaning 50,000 · Whitening 250,000 (20% off this month) · Root canal from 450,000. Full list in Treatments.', 'پشکنین ٢٥,٠٠٠ د.ع · پاککردنەوە ٥٠,٠٠٠ · سپیکردنەوە ٢٥٠,٠٠٠ (٢٠٪ داشکاندن ئەم مانگە) · چارەسەری ڕەگ لە ٤٥٠,٠٠٠. لیستی تەواو لە بەشی چارەسەرەکان.');
    else if (/hour|open|time|کات|دەوام/.test(k)) r = T('We are open Saturday to Thursday, 12:00 – 21:00. Closed on Fridays.', 'شەممە تا پێنجشەممە، ١٢:٠٠ – ٢١:٠٠ کراوەین. هەینی داخراوە.');
    else if (/where|address|location|کوێ|ناونیشان/.test(k)) r = P(CLINIC.address) + T('. Parking is available behind the building.', '. شوێنی ئۆتۆمبێل لە پشتی بیناکە هەیە.');
    else if (/pain|hurt|ئازار|دەیەشێ/.test(k)) r = T('Sorry to hear that. If it is urgent, call us on 0750 543 0000 and we will fit you in today.', 'ببورە بۆ ئەوە. ئەگەر پەلەیە، پەیوەندی بکە بە ٠٧٥٠ ٥٤٣ ٠٠٠٠ و ئەمڕۆ کاتێکت بۆ دەدۆزینەوە.');
    else if (/book|appoint|نۆرە/.test(k)) r = T('You can book directly from the green + button, or tell us the day and time you prefer.', 'دەتوانیت ڕاستەوخۆ لە دوگمەی سەوزی + نۆرە بگریت، یان ڕۆژ و کاتی دڵخوازت پێمان بڵێ.');
    setTimeout(() => { S.chat.push({ me: false, t: r, at: nowStamp() }); save(); if (route().path === 'chat') render(); }, 1300);
  }

  /* ----- profile ----- */
  SCREENS.profile = () => {
    const p = S.profile;
    const item = (href, ic, c, l, extra, act) => (act ? '<button data-a="' + act + '">' : '<a href="' + href + '"' + (href.startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>') + '<span class="c ' + c + '" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i(ic, 's') + '</span><span class="grow">' + l + '</span>' + (extra || '') + '<span class="chev">' + i(FWD, 's') + '</span>' + (act ? '</button>' : '</a>');
    return {
      html: '<div class="page">' + top(T('Profile', 'پرۆفایل'), '', false) +
        '<div class="pcard"><span class="me">' + ART.person(ME) + '</span><span class="grow"><div class="row-t" style="font-size:16px">' + esc(p.name) + '</div><div class="row-s ltr" style="text-align:start">' + esc(p.phone) + '</div><div class="row-s">' + T('File #', 'پەڕگەی #') + N(p.file) + '</div></span><button class="btn sm soft" data-a="editp">' + i('edit', 's') + T('Edit', 'دەستکاری') + '</button></div>' +
        '<div class="menu mt">' + item('#/file', 'file', 'mint', T('My file', 'پەڕگەکەم')) + item('#/visits', 'calendar', 'blue', T('My visits', 'نۆرەکانم')) + item('#/doctors?fav=1', 'star', 'red', T('Favourite doctors', 'دکتۆرە دڵخوازەکان'), '<span class="small muted">' + N(S.favs.length) + '</span>') + item('#/notifications', 'bell', 'amber', T('Notifications', 'ئاگادارکردنەوەکان'), unread() ? '<span class="badge b-red">' + N(unread()) + '</span>' : '') + item('#/chat', 'message', 'purple', T('Chat with the clinic', 'چات لەگەڵ کلینیک')) + '</div>' +
        '<div class="lbl">' + T('Language', 'زمان') + '</div><div class="seg"><button class="' + (KU ? '' : 'on') + '" data-a="setlang" data-x="en">English</button><button class="' + (KU ? 'on' : '') + '" data-a="setlang" data-x="ku">کوردی</button></div>' +
        '<div class="card" style="padding:4px 14px">' + [['remind', T('Appointment reminders', 'بیرخستنەوەی نۆرە'), T('A day before, on WhatsApp', 'ڕۆژێک پێشتر، لە واتسئاپ')], ['offers', T('Offers & news', 'داشکاندن و هەواڵ'), T('Not more than twice a month', 'زیاتر نییە لە دووجار لە مانگێکدا')]].map(([k, l, s]) => '<div class="toggle"><span class="grow"><div class="row-t">' + l + '</div><div class="row-s">' + s + '</div></span><button class="sw ' + (S.settings[k] ? 'on' : '') + '" data-a="setting" data-x="' + k + '" aria-label="' + l + '"></button></div>').join('') + '</div>' +
        '<div class="lbl">' + T('Clinic', 'کلینیک') + '</div><div class="menu">' + item('tel:' + CLINIC.phone, 'phone', 'navy', T('Call the clinic', 'پەیوەندی بە کلینیکەوە'), '<span class="small muted ltr">0750 543 0000</span>') + item(waLink(''), 'whatsapp', 'wa', 'WhatsApp') + item(CLINIC.map, 'globe', 'blue', T('Directions', 'ڕێگای گەیشتن')) + '</div>' +
        '<div class="menu mt">' + item('', 'refresh', 'amber', T('Reset demo data', 'گەڕانەوەی داتای نموونەیی'), '', 'reset') + item('', 'logout', 'red', T('Sign out', 'چوونەدەرەوە'), '', 'signout') + '</div>' +
        '<p class="demo">' + T('Bite for Dentistry · patient app demo', 'Bite for Dentistry · نموونەی ئەپی نەخۆش') + '</p></div>' + tabbar('profile')
    };
  };

  /* =================================================================== actions */
  const ACT = {
    back() { if (history.length > 1) history.back(); else go('#/home'); },
    lang() { setLang(KU ? 'en' : 'ku'); },
    setlang(l) { setLang(l); },
    enter() { const v = app().querySelector('[data-phone]').value.trim(); if (v) S.profile.phone = v; S.seen = true; save(); go('#/home', true); },
    fav(id, el, e) { e.preventDefault(); e.stopPropagation(); const k = S.favs.indexOf(id); if (k >= 0) S.favs.splice(k, 1); else S.favs.push(id); save(); render(); toast(k >= 0 ? T('Removed from favourites', 'لە دڵخوازەکان لابرا') : T('Saved to favourites', 'زیادکرا بۆ دڵخوازەکان'), 'star'); },
    bookdoc(id, el, e) { e.preventDefault(); e.stopPropagation(); go('#/book?doc=' + id); },
    share(id) { const url = location.href; const d = doc(id); if (navigator.share) navigator.share({ title: d.name, text: d.name + ' — Bite for Dentistry', url }).catch(() => {}); else { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast(T('Link copied', 'لینکەکە کۆپی کرا'), 'link')).catch(() => toast(url, 'link')); } },
    svcat(k) { SV.cat = k; render(); },
    dfilter(k) { DV.f = k; render(); },
    dsday(d) { DS.date = d; render(); },
    dsslot(t) { const d = doc(DS.doc); B = { svc: d.services.includes('consult') ? 'consult' : d.services[0], doc: DS.doc, date: DS.date, time: t, note: '', remind: S.settings.remind, editId: null, lock: 'doc' }; go('#/book/review'); },
    bsvc(id) { B.svc = id; if (B.doc && B.doc !== 'any' && !doc(B.doc).services.includes(id)) B.doc = null; B.time = null; render(); },
    bdoc(id) { B.doc = id; B.time = null; render(); },
    bday(d) { B.date = d; B.time = null; render(); },
    btime(t) {
      B.time = t;
      if (B.doc === 'any') { const s = svc(B.svc); const id = allDocs().filter((d) => d.services.includes(B.svc)).map((d) => d.id).find((id2) => slots(id2, B.date, s.min).some((y) => y.free && y.t === t)); B.pick = id; }
      render();
    },
    bnext() {
      const r = route().parts[1];
      if (r === 'svc') go(B.doc ? '#/book/time' : '#/book/doc');
      else if (r === 'doc') go('#/book/time');
      else if (r === 'time') { if (B.doc === 'any') B.doc = B.pick; go('#/book/review'); }
    },
    bremind() { B.remind = !B.remind; render(); },
    bconfirm() {
      let a;
      if (B.editId) { a = S.appts.find((x) => x.id === B.editId); Object.assign(a, { doc: B.doc, date: B.date, time: B.time, status: 'pending', note: B.note || a.note }); }
      else { a = { id: 'a' + Date.now(), svc: B.svc, doc: B.doc, date: B.date, time: B.time, status: 'pending', note: B.note }; S.appts.push(a); }
      note('calendar', 'amber', T('Request sent', 'داواکاری نێردرا'), svc(a.svc).name + ' · ' + fDate(a.date) + ' · ' + fTime(a.time), '#/visits');
      B.lastId = a.id; B.editId = null;
      save();
      go('#/book/done', true);
      const id = a.id;
      setTimeout(() => { // the clinic confirms (simulated)
        const x = S.appts.find((y) => y.id === id);
        if (!x || x.status !== 'pending') return;
        x.status = 'confirmed';
        note('check', 'mint', T('Appointment confirmed', 'نۆرەکەت پشتڕاستکرایەوە'), svc(x.svc).name + ' · ' + fDate(x.date) + ' · ' + fTime(x.time), '#/visits');
        save(); render(); toast(T('The clinic confirmed your appointment', 'کلینیک نۆرەکەتی پشتڕاست کردەوە'), 'check');
      }, 7000);
    },
    ics(id) { icsFor(S.appts.find((a) => a.id === id)); },
    vtab(k) { VV.tab = k; render(); },
    async cancel(id) {
      const a = S.appts.find((x) => x.id === id);
      if (!(await confirmSheet(T('Cancel this appointment?', 'ئەم نۆرەیە هەڵدەوەشێنیتەوە؟'), svc(a.svc).name + ' · ' + fDate(a.date, true) + ' · ' + fTime(a.time), T('Yes, cancel', 'بەڵێ، هەڵیبوەشێنەوە'), true))) return;
      a.status = 'cancelled'; note('x', 'red', T('Appointment cancelled', 'نۆرەکە هەڵوەشێنرایەوە'), svc(a.svc).name + ' · ' + fDate(a.date), '#/visits'); save(); render(); toast(T('Appointment cancelled', 'نۆرەکە هەڵوەشێنرایەوە'), 'x');
    },
    resched(id) { const a = S.appts.find((x) => x.id === id); B = { svc: a.svc, doc: a.doc, date: a.date, time: null, note: a.note || '', remind: S.settings.remind, editId: id, lock: 'doc' }; go('#/book/time'); },
    again(id) { const a = S.appts.find((x) => x.id === id); B = { svc: a.svc, doc: a.doc, date: null, time: null, note: '', remind: S.settings.remind, editId: null }; go('#/book/time'); },
    rate(id) {
      let val = 5;
      sheet('<h3>' + T('How was your visit?', 'سەردانەکەت چۆن بوو؟') + '</h3><div class="center" data-stars style="font-size:0;margin:8px 0 14px">' + [1, 2, 3, 4, 5].map((k) => '<button data-v="' + k + '" style="color:#E0A33B;padding:4px">' + I('star', 'xl') + '</button>').join('') + '</div><textarea class="in" placeholder="' + T('Tell us more (optional)', 'زیاتر پێمان بڵێ (ئارەزوومەندانە)') + '"></textarea><button class="btn pri lg block mt" data-ok>' + T('Send', 'ناردن') + '</button>', (sh) => {
        const paint = () => sh.querySelectorAll('[data-v]').forEach((b) => { b.style.color = Number(b.dataset.v) <= val ? '#E0A33B' : '#D5DCE1'; });
        sh.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => { val = Number(b.dataset.v); paint(); }));
        paint();
        sh.querySelector('[data-ok]').onclick = () => { S.rated = S.rated || {}; S.rated[id] = val; save(); closeSheet(); render(); toast(T('Thank you for your feedback', 'سوپاس بۆ ڕاکەت'), 'star'); };
      });
    },
    ftab(k) { go('#/file?tab=' + k, true); },
    rx(id) {
      const r = S.rx.find((x) => x.id === id), d = doc(r.doc);
      const text = T('Prescription', 'ڕەچەتە') + ' — ' + d.name + ' — ' + fDate(r.date) + '\n' + r.meds.map((m) => '• ' + m.n + ': ' + m.d).join('\n') + (r.advice ? '\n' + r.advice : '');
      sheet('<h3>' + T('Prescription', 'ڕەچەتە') + '</h3><div class="li"><span class="dav" style="width:40px;height:40px;border-radius:12px">' + portrait(r.doc) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + fDate(r.date, true) + '</div></span></div>' +
        '<div class="card mt" style="padding:4px 14px">' + r.meds.map((m) => '<div class="toggle" style="align-items:flex-start"><span class="c blue" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none">' + i('pill', 's') + '</span><span class="grow"><div class="row-t ltr" style="text-align:start">' + esc(m.n) + '</div><div class="row-s">' + esc(m.d) + '</div></span></div>').join('') + '</div>' +
        (r.advice ? '<div class="recall" style="margin-top:10px"><span class="c" style="width:36px;height:36px">' + i('info') + '</span><small style="font-size:13px;color:var(--text)">' + esc(r.advice) + '</small></div>' : '') +
        '<div class="row mt"><a class="btn wa lg grow" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(text) + '">' + i('whatsapp', 's') + T('Share', 'ناردن') + '</a><button class="btn out lg grow" data-close>' + T('Close', 'داخستن') + '</button></div>', (sh) => { sh.querySelector('[data-close]').onclick = () => closeSheet(); });
    },
    xray(id) {
      const x = S.xrays.find((y) => y.id === id);
      const v = document.createElement('div'); v.className = 'viewer';
      v.innerHTML = '<div class="vt"><button class="gb" data-close>' + i('x') + '</button><span class="grow"><div class="row-t">' + esc(x.title) + '</div><div class="row-s" style="color:rgba(255,255,255,.6)">' + fDate(x.date) + ' · ' + esc(doc(x.doc).name) + '</div></span></div><div class="im">' + ART.xray(x.kind) + '</div><p class="center small" style="color:rgba(255,255,255,.5);padding:0 20px calc(20px + var(--safe-b))">' + T('Sample image for the demo', 'وێنەی نموونە بۆ نمایشکردن') + '</p>';
      document.body.appendChild(v);
      v.querySelector('[data-close]').onclick = () => v.remove();
    },
    inv(id) {
      const v = S.invoices.find((x) => x.id === id), pd = paidOf(v), left = v.total - pd;
      const pays = v.payments.map((p) => [p[0], p[1], p[2]]).concat(S.extraPay.filter((p) => p.inv === id).map((p) => [p.date, p.amount, METHODS[p.method]]));
      sheet('<h3 class="ltr" style="text-align:start">' + v.id + '</h3><div class="small muted">' + fDate(v.date, true) + ' · ' + esc(doc(v.doc).name) + '</div>' +
        '<div class="card mt">' + v.items.map((it) => '<div class="sum"><span style="color:var(--text)">' + esc(it[0]) + '</span><b>' + money(it[1]) + '</b></div>').join('') + '<div class="sum"><span>' + T('Total', 'کۆ') + '</span><b>' + money(v.total) + '</b></div></div>' +
        '<div class="lbl">' + T('Payments', 'پارەدانەکان') + (v.plan ? '<span>' + N(v.plan) + T(' instalments', ' قیست') + '</span>' : '') + '</div><div class="card">' + pays.map((p) => '<div class="sum"><span>' + fDate(p[0]) + ' · ' + esc(p[2]) + '</span><b style="color:var(--mint-2)">' + money(p[1]) + '</b></div>').join('') + '<div class="sum"><span>' + T('Left to pay', 'ماوە') + '</span><b>' + money(left) + '</b></div></div>' +
        (left > 0 ? '<button class="btn pri lg block mt" data-pay>' + i('wallet') + T('Pay ', 'پارەدانی ') + money(v.plan ? Math.min(left, Math.round(v.total / v.plan)) : left) + '</button>' : '<div class="center mt"><span class="badge b-mint">' + i('check', 's') + T('Fully paid', 'بە تەواوی دراوە') + '</span></div>'), (sh) => { const b = sh.querySelector('[data-pay]'); if (b) b.onclick = () => ACT.pay(id); });
    },
    pay(id) {
      const v = S.invoices.find((x) => x.id === id); if (!v) return;
      const left = v.total - paidOf(v), amt = v.plan ? Math.min(left, Math.round(v.total / v.plan)) : left;
      let m = 'fib';
      const logos = { fib: ['FIB', '#0F7A5C'], fastpay: ['FP', '#E94E3C'], zain: ['ZC', '#7B2D8E'], card: ['VISA', '#1A3B8F'], clinic: ['B', '#1B2B4F'] };
      sheet('<h3>' + T('Pay instalment', 'پارەدانی قیست') + '</h3><div class="card center"><div class="small muted">' + v.id + '</div><div class="h2" style="font-size:28px;margin:4px 0">' + money(amt) + '</div><div class="small muted">' + T('Remaining after this: ', 'ماوە دوای ئەمە: ') + money(left - amt) + '</div></div><div class="lbl">' + T('Pay with', 'پارەدان بە') + '</div><div class="paym">' + Object.keys(METHODS).map((k) => '<button class="pm ' + (k === m ? 'on' : '') + '" data-m="' + k + '"><span class="lg" style="background:' + logos[k][1] + '">' + logos[k][0] + '</span>' + METHODS[k] + '</button>').join('') + '</div><button class="btn pri lg block mt2" data-go>' + i('lock', 's') + T('Pay ', 'پارەدانی ') + money(amt) + '</button><p class="demo">' + T('Demo — no money is taken', 'نموونەیە — هیچ پارەیەک نابرێت') + '</p>', (sh) => {
        sh.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { m = b.dataset.m; sh.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('on', x === b)); }));
        sh.querySelector('[data-go]').onclick = (e) => {
          const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = T('Processing…', 'چاوەڕێ بکە…');
          setTimeout(() => {
            if (m !== 'clinic') { S.extraPay.push({ inv: id, date: today(), amount: amt, method: m }); note('wallet', 'mint', T('Payment received', 'پارەکە وەرگیرا'), money(amt) + ' · ' + v.id, '#/file?tab=bills'); }
            S.notes.forEach((n) => { if (n.id === 'n2') n.read = true; });
            save(); closeSheet(); render();
            toast(m === 'clinic' ? T('You can pay at reception on your next visit', 'لە سەردانی داهاتوودا لە پێشوازی بیدە') : T('Payment successful', 'پارەدان سەرکەوتوو بوو'), 'check');
          }, 1200);
        };
      });
    },
    sharefile() {
      const p = S.profile;
      const text = p.name + ' — ' + T('File #', 'پەڕگەی #') + p.file + '\n' + S.plan.map((pl) => '• ' + pl.title + ' (' + pl.done + '/' + pl.total + ')').join('\n');
      if (navigator.share) navigator.share({ title: 'Bite', text }).catch(() => {}); else toast(T('Sharing is available on phones', 'ناردن لەسەر مۆبایل بەردەستە'), 'info');
    },
    readall() { S.notes.forEach((n) => { n.read = true; }); save(); render(); },
    note(id) { const n = S.notes.find((x) => x.id === id); n.read = true; save(); go(n.go || '#/home'); },
    qr(x, el) { sendChat(el.textContent); },
    setting(k) { S.settings[k] = !S.settings[k]; save(); render(); },
    editp() {
      const p = S.profile;
      sheet('<h3>' + T('Edit profile', 'دەستکاریی پرۆفایل') + '</h3>' + [['name', T('Full name', 'ناوی تەواو'), p.name, 'text'], ['phone', T('Mobile', 'مۆبایل'), p.phone, 'tel'], ['email', T('Email', 'ئیمەیڵ'), p.email, 'email'], ['dob', T('Date of birth', 'بەرواری لەدایکبوون'), p.dob, 'date']].map(([k, l, v, t]) => '<div class="field"><label>' + l + '</label><input class="in' + (k !== 'name' ? ' ltr' : '') + '" name="' + k + '" type="' + t + '" value="' + esc(v) + '"></div>').join('') + '<button class="btn pri lg block" data-ok>' + T('Save', 'پاشەکەوتکردن') + '</button>', (sh) => {
        sh.querySelector('[data-ok]').onclick = () => { sh.querySelectorAll('input').forEach((inp) => { if (inp.value.trim()) p[inp.name] = inp.value.trim(); }); save(); closeSheet(); render(); toast(T('Profile saved', 'پرۆفایل پاشەکەوت کرا')); };
      });
    },
    async reset() { if (!(await confirmSheet(T('Reset demo data?', 'داتای نموونەیی بگەڕێنرێتەوە؟'), T('All bookings, payments and messages you made in this demo will be removed.', 'هەموو ئەو نۆرە و پارەدان و نامانەی لەم نموونەیەدا کردووتە دەسڕێنەوە.'), T('Reset', 'گەڕاندنەوە'), true))) return; localStorage.removeItem(KEY); S = load(); S.seen = true; save(); go('#/home', true); toast(T('Demo data restored', 'داتای نموونەیی گەڕێندرایەوە'), 'refresh'); },
    async signout() { if (!(await confirmSheet(T('Sign out?', 'دەچیتە دەرەوە؟'), T('You can sign in again with your mobile number.', 'دەتوانیت دووبارە بە ژمارەی مۆبایلەکەت بچیتە ژوورەوە.'), T('Sign out', 'چوونەدەرەوە'), true))) return; S.seen = false; save(); go('#/welcome', true); }
  };

  /* =================================================================== router */
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = (path || '').split('/').filter(Boolean);
    const q = {};
    (qs || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { path: parts[0] || 'home', parts, q, full: h };
  }
  function go(hash, replace) {
    if (replace) { history.replaceState(null, '', hash); render(); }
    else if (location.hash === hash) render();
    else location.hash = hash;
  }
  let lastFull = null;
  function render() {
    const r = route();
    if (!S.seen && r.path !== 'welcome') { go('#/welcome', true); return; }
    const fn = SCREENS[r.path] || SCREENS.home;
    const out = fn(r.parts[1], r.q);
    if (!out) return; // the screen redirected
    const keep = lastFull === r.full ? window.scrollY : 0;
    app().innerHTML = out.html;
    document.title = 'Bite';
    if (out.mount) out.mount(app());
    if (lastFull !== r.full && r.path !== 'chat') window.scrollTo(0, 0); else if (r.path !== 'chat') window.scrollTo(0, keep);
    lastFull = r.full;
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el || !ACT[el.dataset.a]) return;
    if (el.tagName === 'A' || el.closest('a')) e.preventDefault();
    ACT[el.dataset.a](el.dataset.x, el, e);
  });
  window.addEventListener('hashchange', () => { closeSheet(true); document.querySelectorAll('.viewer').forEach((v) => v.remove()); render(); });
  window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });
  /* re-render the home greeting / time-dependent bits when the app comes back to the front */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  if (DATA.draft) { const b = document.createElement('a'); b.className = 'draftbar'; b.href = 'admin.html'; b.textContent = T('Draft preview · not published yet', 'پێشبینینی ڕەشنووس · هێشتا بڵاو نەکراوە'); document.body.appendChild(b); }
  render();
})();
