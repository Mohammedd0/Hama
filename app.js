/* Bite patient app — demo (no server). Data lives in this browser's localStorage. */
(function () {
  const KU = window.Lang === 'ku', AR = window.Lang === 'ar', RTL = KU || AR;
  const arT = window.arT || ((x) => x);
  /* text in the current language: English, Kurdish (Sorani) or Arabic. Arabic comes from the third
     argument when given, otherwise from the Arabic dictionary (ar.js), otherwise English. */
  const T = (en, ku, ar) => (KU ? ku : AR ? (ar !== undefined ? ar : arT(en)) : en);
  const P = (pair) => (!pair ? '' : KU ? pair[1] : AR ? (pair[2] || arT(pair[0])) : pair[0]);
  const N = (s) => (RTL ? String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) : String(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const i = (n, c) => I(n, c || '');
  const BACK = 'chevR', FWD = 'chevL'; /* icons are drawn for RTL and mirrored in English */
  const { SERVICES, DOCTORS, CATS, REVIEWS, PROMOS, CLINIC } = window.DATA;
  const addDays = DATA.addDays, ymd = DATA.ymd;
  const KEY = 'bite_app_v1';

  /* ---------- state ---------- */
  /* ---------- family: one account, several patients ----------
     The active person's records sit at the top of S (S.profile, S.appts …) so every screen
     works unchanged; the others wait in S.members[].profile/data until switched to. */
  const DK = ['appts', 'plan', 'teeth', 'rx', 'xrays', 'invoices', 'extraPay', 'rated'];
  function stash(s) { const m = s.members.find((x) => x.id === (s.active || 'me')); m.profile = s.profile; m.data = {}; DK.forEach((k) => { m.data[k] = s[k]; }); }
  function unstash(s, id) { const m = s.members.find((x) => x.id === id); s.profile = m.profile; DK.forEach((k) => { s[k] = (m.data && m.data[k]) || (k === 'teeth' || k === 'rated' ? {} : []); }); delete m.profile; delete m.data; s.active = id; }

  let S = load();
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (s && s.v === 2 && s.lang === window.Lang) return s;
    const fresh = DATA.build(window.Lang);
    if (s && s.v === 2) { // language changed: keep what the user did, rebuild the texts
      if (s.active && s.active !== 'me') { stash(s); unstash(s, 'me'); }
      ['appts', 'favs', 'settings', 'extraPay', 'seen', 'rated', 'brush', 'kids', 'waitlist', 'aligner', 'urgent', 'refer', 'meds'].forEach((k) => { if (s[k] !== undefined) fresh[k] = s[k]; });
      fresh.profile.phone = s.profile.phone; fresh.profile.email = s.profile.email; fresh.profile.dob = s.profile.dob;
      (s.plan || []).forEach((p) => { const f = fresh.plan.find((x) => x.id === p.id); if (f) { f.status = p.status; f.accepted = p.accepted; f.payOpt = p.payOpt; } });
      (s.members || []).forEach((m) => { if (m.id === 'me') return; const f = fresh.members.find((x) => x.id === m.id); if (f && m.demo) f.data.appts = m.data.appts; else if (!f) fresh.members.push(m); });
    } else if (s) { // older demo data: start fresh but keep the person's own settings
      ['favs', 'settings', 'seen'].forEach((k) => { if (s[k] !== undefined) fresh[k] = s[k]; });
      if (s.profile && s.profile.phone) fresh.profile.phone = s.profile.phone;
    }
    save(fresh);
    return fresh;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s || S)); } catch (e) { /* storage full or blocked */ } }
  S.extraPay = S.extraPay || [];

  /* ---------- formatting ---------- */
  const MON = AR ? ['ك٢', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'ت١', 'ت٢', 'ك١'] : KU ? ['ک.دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'ت.یەکەم', 'ت.دووەم', 'ک.یەکەم'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONF = AR ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'] : KU ? ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYF = AR ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : KU ? ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS = AR ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : KU ? ['ی', 'د', 'س', 'چ', 'پ', 'ه', 'ش'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = () => ymd(new Date());
  const dt = (s) => new Date(s + 'T12:00:00');
  const dow = (s) => dt(s).getDay();
  const dd = (s) => N(dt(s).getDate());
  const fDate = (s, withDay) => { const d = dt(s); return (withDay ? DAYF[d.getDay()] + (RTL ? ' ' : ', ') : '') + N(d.getDate()) + (KU ? 'ی ' : ' ') + (AR ? MONF : MON)[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + N(d.getFullYear()) : ''); };
  const fTime = (t) => { const [h, m] = t.split(':').map(Number); const h12 = ((h + 11) % 12) + 1; return N(h12 + ':' + String(m).padStart(2, '0')) + ' ' + (KU ? (h < 12 ? 'بەیانی' : h < 17 ? 'دوانیوەڕۆ' : 'ئێوارە') : AR ? (h < 12 ? 'صباحاً' : h < 17 ? 'ظهراً' : 'مساءً') : (h < 12 ? 'AM' : 'PM')); };
  const diff = (a, b) => Math.round((dt(a) - dt(b)) / 864e5);
  const rel = (s) => { const n = diff(s, today()); if (n === 0) return T('Today', 'ئەمڕۆ'); if (n === 1) return T('Tomorrow', 'سبەینێ'); if (n === -1) return T('Yesterday', 'دوێنێ'); if (n > 1 && n < 7) return T('In ' + n + ' days', 'دوای ' + N(n) + ' ڕۆژ', 'بعد ' + N(n) + ' أيام'); return fDate(s); };
  const ago = (s) => { const n = diff(today(), s); if (n < 1) return T('Today', 'ئەمڕۆ'); if (n === 1) return T('Yesterday', 'دوێنێ'); if (n < 30) return T(n + ' days ago', N(n) + ' ڕۆژ لەمەوبەر', 'قبل ' + N(n) + ' أيام'); const m = Math.round(n / 30.4); return T(m + (m === 1 ? ' month ago' : ' months ago'), N(m) + ' مانگ لەمەوبەر', (m === 1 ? 'قبل شهر' : 'قبل ' + N(m) + ' أشهر')); };
  const money = (n) => N(Math.round(n).toLocaleString('en-US')) + (RTL ? ' د.ع' : ' IQD');
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  /* ---------- lookups ---------- */
  const svc = (id) => { const s = SERVICES.find((x) => x[0] === id); return s && { id: s[0], name: T(s[1], s[2], s[11] || undefined), cat: s[3], min: s[4], price: s[5], art: s[6], desc: T(s[7], s[8], s[12] || undefined), hidden: !!s[9], photo: s[10] || '' }; };
  const sArt = (s) => (s.photo ? '<img src="' + esc(s.photo) + '" alt="">' : ART.tooth(s.art));
  const doc = (id) => { const d = DOCTORS.find((x) => x.id === id); return d && Object.assign({}, d, { name: T(d.en, d.ku, d.ar || undefined), sn: P(d.short), sp: P(d.spec), about: P(d.bio) }); };
  const allDocs = () => DOCTORS.filter((d) => !d.hidden).map((d) => doc(d.id));
  const catName = (id) => { const c = CATS.find((x) => x[0] === id); return c ? T(c[1], c[2], c[3] || undefined) : ''; };
  const ME = { bg: ['#DDEFF3', '#BFE3EA'], skin: '#F0C7A8', skin2: '#E2B08E', hair: '#3A2A20', shirt: '#E7D3C8', f: true, coat: false };
  const upcoming = () => S.appts.filter((a) => ['pending', 'confirmed'].includes(a.status) && a.date >= today()).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  const past = () => S.appts.filter((a) => a.status === 'done' || a.status === 'cancelled' || (a.date < today() && a.status !== 'pending' && a.status !== 'confirmed')).sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const paidOf = (inv) => inv.payments.reduce((s, p) => s + p[1], 0) + S.extraPay.filter((p) => p.inv === inv.id).reduce((s, p) => s + p.amount, 0);
  const balance = () => S.invoices.reduce((s, inv) => s + Math.max(0, inv.total - paidOf(inv)), 0);
  const unread = () => S.notes.filter((n) => !n.read).length;
  const isOff = (d, date) => doc(d).off.includes(dow(date));
  const REL = { self: T('Me', 'خۆم'), child: T('Child', 'منداڵ'), spouse: T('Spouse', 'هاوسەر'), parent: T('Parent', 'دایک یان باوک'), other: T('Other', 'کەسی تر') };
  const people = () => S.members.map((m) => { const p = m.id === S.active ? S.profile : m.profile; return { id: m.id, rel: m.rel, demo: m.demo, name: p.name, dob: p.dob, file: p.file, gender: p.gender }; });
  const firstName = (n) => String(n || '').trim().split(/\s+/)[0];
  const ageOf = (dob) => (dob ? Math.floor((Date.now() - new Date(dob + 'T12:00:00')) / 31557600000) : null);
  const avatarOf = (p) => (p.id === 'me' ? ART.person(ME) : '<span class="ini c' + (h32(p.id) % 4) + '">' + esc(firstName(p.name).charAt(0) || '?') + '</span>');
  const isMe = () => (S.active || 'me') === 'me';
  function switchTo(id) { if (id === (S.active || 'me')) return; stash(S); unstash(S, id); save(); }
  const METHODS = { fib: 'FIB', fastpay: 'FastPay', zain: 'ZainCash', card: T('Card', 'کارت'), clinic: T('At the clinic', 'لە کلینیک') };

  /* deterministic "busy" slots so every doctor's diary looks real */
  function h32(s) { let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); } return h >>> 0; }
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
  function dl(text, name, type) { const url = URL.createObjectURL(new Blob([text], { type })); const el = document.createElement('a'); el.href = url; el.download = name; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
  const waLink = (text) => 'https://wa.me/' + CLINIC.wa + '?text=' + encodeURIComponent(text || '');

  /* ---------- tab bar ---------- */
  function tabbar(on) {
    const t = [['home', 'home', T('Home', 'سەرەکی')], ['visits', 'calendar', T('Visits', 'نۆرەکان')], ['book', '', ''], ['file', 'file', T('My file', 'پەڕگەکەم')], ['profile', 'user', T('Profile', 'پرۆفایل')]];
    return '<nav class="tabbar">' + t.map(([k, ic, l]) => k === 'book'
      ? '<a class="tab" href="#/book"><span class="fab">' + i('plus') + '</span><span style="margin-top:3px;color:var(--mint-2);font-weight:600">' + T('Book', 'نۆرە') + '</span></a>'
      : '<a class="tab ' + (k === on ? 'on' : '') + '" href="#/' + k + '">' + i(ic, 'l') + l + (k === 'visits' && upcoming().some((a) => a.status === 'pending') ? '<span class="bd">' + N(upcoming().filter((a) => a.status === 'pending').length) + '</span>' : '') + '</a>').join('') + '</nav>';
  }

  /* ---------- people bar (whose file am I looking at?) ---------- */
  const pbar = () => S.members.length < 2 ? '' : '<div class="pbar">' + people().map((p) => '<button class="pp ' + (p.id === (S.active || 'me') ? 'on' : '') + '" data-a="who" data-x="' + p.id + '"><span class="pa">' + avatarOf(p) + '</span>' + esc(firstName(p.name)) + '</button>').join('') + '<a class="pp add" href="#/family" aria-label="' + T('Family', 'خێزان') + '">' + i('plus', 's') + '</a></div>';

  /* ---------- check-in and the waiting room (simulated queue) ---------- */
  const QSTEP = 25000; /* demo: one patient goes in every 25 seconds */
  const todayVisit = () => upcoming().find((a) => a.date === today() && !a.seenDr);
  function queue(a) {
    const c = a.checkin; if (!c) return null;
    const ahead = Math.max(0, c.ahead - Math.floor((Date.now() - c.at) / QSTEP));
    return { ahead, wait: ahead ? ahead * 12 + c.late : 0, ready: ahead === 0, late: c.late, of: c.ahead };
  }
  function checkinCard(a) {
    const d = doc(a.doc), q = queue(a);
    if (!q) return '<div class="ci"><div class="row between"><span class="badge b-mint"><i></i>' + T('Today', 'ئەمڕۆ') + ' · ' + fTime(a.time) + '</span><span class="small" style="color:rgba(255,255,255,.7)">' + esc(d.sn) + '</span></div>' +
      '<b class="ci-t">' + T('Your visit is today', 'سەردانەکەت ئەمڕۆیە') + '</b><p class="ci-s">' + T('When you reach the clinic, tap the button so reception knows you are here. No need to queue at the desk.', 'کاتێک گەیشتیتە کلینیک، ئەم دوگمەیە دابگرە تا پێشوازی بزانێت گەیشتوویت. پێویست ناکات لە ڕیسێپشن ڕاوەستیت.') + '</p>' +
      '<button class="btn pri lg block" data-a="checkin" data-x="' + a.id + '">' + i('pin') + T('I have arrived', 'گەیشتم') + '</button><a class="ci-card" href="#/card">' + i('qr', 's') + T('Show my patient card', 'کارتی نەخۆشەکەم پیشان بدە') + '</a></div>';
    if (q.ready) return '<div class="ci ready"><span class="ci-ic">' + i('check', 'xl') + '</span><b class="ci-t">' + T(d.sn + ' is ready for you', d.sn + ' ئامادەیە بۆت', d.sn + ' جاهز لاستقبالك') + '</b><p class="ci-s">' + T('Please go to Room 2. Have a good visit!', 'تکایە بچۆ ژووری ٢. سەردانێکی خۆش!') + '</p></div>';
    const dots = Array.from({ length: q.of }, (x, k) => '<i class="' + (k < q.of - q.ahead ? 'gone' : '') + '"></i>').join('');
    return '<div class="ci"><div class="row between"><span class="badge b-mint"><i></i>' + T('Checked in', 'تۆمارکرایت') + '</span><span class="small" style="color:rgba(255,255,255,.7)">' + fTime(a.time) + ' · ' + esc(d.sn) + '</span></div>' +
      '<div class="ci-q"><div><b>' + N(q.ahead) + '</b><small>' + T(q.ahead === 1 ? 'patient before you' : 'patients before you', 'نەخۆش لە پێشتەوەیە', (q.ahead === 1 ? 'مريض قبلك' : 'مرضى قبلك')) + '</small></div><div><b>~' + N(q.wait) + '</b><small>' + T('minutes', 'خولەک') + '</small></div></div>' +
      '<div class="ci-dots">' + dots + '<span>' + i('user', 's') + '</span></div>' +
      (q.late ? '<p class="ci-s">' + i('clock', 's') + ' ' + T(d.sn + ' is running about ' + q.late + ' minutes late. We will tell you here when it is your turn.', d.sn + ' نزیکەی ' + N(q.late) + ' خولەک دواکەوتووە. کاتێک نۆرەت هات لێرە پێت دەڵێین.', d.sn + ' متأخر نحو ' + N(q.late) + ' دقائق. سنخبرك هنا عندما يحين دورك.') + '</p>' : '') + '</div>';
  }
  let qSig = '';
  setInterval(() => {
    const a = todayVisit(); if (!a || !a.checkin) return;
    const q = queue(a);
    if (q.ready && !a.called) { a.called = true; note('check', 'mint', T('It is your turn', 'نۆرەی تۆیە'), T(doc(a.doc).sn + ' is ready for you · Room 2', doc(a.doc).sn + ' ئامادەیە بۆت · ژووری ٢', doc(a.doc).sn + ' جاهز لاستقبالك · الغرفة ٢'), '#/home'); save(); toast(T('It is your turn — Room 2', 'نۆرەی تۆیە — ژووری ٢'), 'bell'); if (navigator.vibrate) navigator.vibrate(200); }
    const sig = a.id + q.ahead;
    if (sig !== qSig) { qSig = sig; const p = route().path; if ((p === 'home' || p === 'visits') && !sheetEl) render(); }
  }, 3000);

  /* ---------- aftercare ---------- */
  const careKey = (svcId) => { const k = DATA.CARE_OF[svcId]; return k && DATA.AFTERCARE[k] ? k : null; };
  function recentCare() {
    const done = S.appts.filter((a) => a.status === 'done' && careKey(a.svc)).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!done) return null;
    const g = DATA.AFTERCARE[careKey(done.svc)], n = diff(today(), done.date) + 1;
    return n <= g.days ? { a: done, k: careKey(done.svc), g, n } : null;
  }

  /* ---------- treatment plans ---------- */
  const planCost = (pl) => pl.cost || (pl.items || []).reduce((x, it) => x + it[1], 0);
  function planCard(pl) {
    const badge = { active: '<span class="badge b-blue">' + T('In progress', 'بەردەوامە') + '</span>', proposed: '<span class="badge b-amber"><i></i>' + T('Waiting for your approval', 'چاوەڕێی ڕەزامەندیتە') + '</span>', accepted: '<span class="badge b-mint">' + T('Accepted', 'قبووڵکرا') + '</span>' }[pl.status] || '<span class="badge b-gray">' + T('Next step', 'هەنگاوی داهاتوو') + '</span>';
    const cost = planCost(pl);
    return '<div class="plan' + (pl.status === 'proposed' ? ' prop' : '') + '"><div class="row between"><span class="small muted">' + T('Treatment plan', 'پلانی چارەسەر') + ' · ' + esc(doc(pl.doc).sn) + '</span>' + badge + '</div><div class="row-t" style="font-size:15.5px;color:var(--navy);margin-top:4px">' + esc(pl.title) + '</div>' +
      (pl.status === 'proposed' ? '<div class="row between mt"><span class="small muted">' + T('Sent ', 'نێردرا ') + ago(pl.sent) + '</span><b>' + money(cost) + '</b></div><button class="btn pri block mt" data-a="plan" data-x="' + pl.id + '">' + i('clipboard', 's') + T('Review the plan', 'سەیرکردنی پلانەکە') + '</button>'
        : '<div class="bar"><i style="width:' + Math.round(pl.done / pl.total * 100) + '%"></i></div><div class="row between small muted"><span>' + N(pl.done) + T(' of ', ' لە ') + N(pl.total) + T(' visits done', ' سەردان تەواوبوو') + '</span>' + (cost ? '<button class="lnk" data-a="plan" data-x="' + pl.id + '">' + money(cost) + ' · ' + T('details', 'وردەکاری') + '</button>' : '') + '</div>') + '</div>';
  }

  /* ---------- app lock (PIN) ---------- */
  const PINK = 'bite_pin';
  const pinHash = (p) => 'h' + h32('bite:' + p + ':pin').toString(36);
  const hasPin = () => { try { return !!localStorage.getItem(PINK); } catch (e) { return false; } };
  let lockOpen = false;
  function lockScreen(mode, done) {
    if (lockOpen) return; lockOpen = true;
    let val = '', first = '';
    const el = document.createElement('div'); el.className = 'lock';
    const title = () => ({ unlock: T('Enter your PIN', 'پینەکەت بنووسە'), set: first ? T('Enter it again', 'دووبارە بینووسەوە') : T('Choose a 4-digit PIN', 'پینێکی ٤ ژمارەیی هەڵبژێرە'), off: T('Enter your PIN to turn the lock off', 'بۆ لابردنی قفڵ پینەکەت بنووسە') }[mode]);
    const paint = () => {
      el.innerHTML = '<div class="lk-top">' + ART.logo(56) + '<h2>' + title() + '</h2><p>' + (mode === 'unlock' ? T('Your medical file is protected', 'پەڕگە پزیشکییەکەت پارێزراوە') : T('You will need it each time you open the app', 'هەر جارێک ئەپەکە دەکەیتەوە پێویستت پێی دەبێت')) + '</p><div class="lk-dots">' + [0, 1, 2, 3].map((k) => '<i class="' + (k < val.length ? 'on' : '') + '"></i>').join('') + '</div></div>' +
        '<div class="lk-pad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', mode === 'unlock' ? 'forgot' : 'cancel', '0', 'del'].map((k) => k === 'forgot' ? '<button class="lk-k sm" data-k="forgot">' + T('Forgot?', 'لەبیرتە؟') + '</button>' : k === 'cancel' ? '<button class="lk-k sm" data-k="cancel">' + T('Cancel', 'پاشگەزبوونەوە') + '</button>' : k === 'del' ? '<button class="lk-k sm" data-k="del" aria-label="delete">⌫</button>' : '<button class="lk-k" data-k="' + k + '">' + N(k) + '</button>').join('') + '</div>' +
        '<p class="lk-note">' + T('In the store version you can also use Face ID or your fingerprint.', 'لە وەشانی ستۆردا دەتوانیت Face ID یان پەنجەمۆریش بەکاربهێنیت.') + '</p>';
    };
    const close = (ok) => { el.classList.add('out'); setTimeout(() => el.remove(), 200); lockOpen = false; if (done) done(ok); };
    const shake = () => { const d = el.querySelector('.lk-dots'); d.classList.remove('bad'); void d.offsetWidth; d.classList.add('bad'); if (navigator.vibrate) navigator.vibrate(80); };
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-k]'); if (!b) return;
      const k = b.dataset.k;
      if (k === 'cancel') return close(false);
      if (k === 'forgot') {
        el.style.zIndex = 50;
        const ok = await confirmSheet(T('Forgot your PIN?', 'پینەکەت لەبیرچووە؟'), T('For your safety you will be signed out. Sign in again with your mobile number and choose a new PIN.', 'بۆ پاراستنت دەچیتە دەرەوە. دووبارە بە ژمارەی مۆبایلەکەت بچۆ ژوورەوە و پینێکی نوێ هەڵبژێرە.'), T('Sign out', 'چوونەدەرەوە'), true);
        el.style.zIndex = '';
        if (ok) { try { localStorage.removeItem(PINK); } catch (er) { /* ignore */ } S.seen = false; save(); close(false); go('#/welcome', true); }
        return;
      }
      if (k === 'del') { val = val.slice(0, -1); paint(); return; }
      if (val.length >= 4) return;
      val += k; paint();
      if (val.length < 4) return;
      setTimeout(() => {
        if (mode === 'set') {
          if (!first) { first = val; val = ''; paint(); return; }
          if (val === first) { try { localStorage.setItem(PINK, pinHash(val)); } catch (er) { /* ignore */ } toast(T('App lock is on', 'قفڵی ئەپ چالاک کرا'), 'lock'); return close(true); }
          first = ''; val = ''; paint(); shake(); toast(T('The PINs did not match', 'پینەکان وەک یەک نەبوون'), 'info'); return;
        }
        let saved = ''; try { saved = localStorage.getItem(PINK) || ''; } catch (er) { /* ignore */ }
        if (pinHash(val) === saved) { try { sessionStorage.setItem('bite_unl', '1'); } catch (er) { /* ignore */ } if (mode === 'off') { try { localStorage.removeItem(PINK); } catch (er) { /* ignore */ } toast(T('App lock is off', 'قفڵی ئەپ لابرا'), 'lock'); } return close(true); }
        val = ''; paint(); shake();
      }, 120);
    });
    paint(); document.body.appendChild(el);
  }
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hasPin() && S.seen && hiddenAt && Date.now() - hiddenAt > 60000) lockScreen('unlock');
  });

  /* =================================================================== screens */
  const SCREENS = {};

  /* ----- welcome (shown first time and after sign-out) ----- */
  SCREENS.welcome = () => ({
    html: '<div class="page nobar" style="display:flex;flex-direction:column;min-height:100vh">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' + ART.logo(44) + '<button class="ib lang" data-a="lang">' + i('translate', 's') + ({ en: 'English', ku: 'کوردی', ar: 'العربية' }[window.Lang] || 'English') + '</button></div>' +
      ((DATA.TILES || {}).welcome ? '<div class="wimg" style="background-image:url(' + DATA.TILES.welcome + ')"></div>' : '<div style="position:relative;height:260px;margin:24px -18px 0"><div style="position:absolute;inset:0;background:radial-gradient(closest-side,rgba(var(--mint-rgb),.28),transparent)"></div><div style="position:absolute;inset:20px 80px">' + ART.tooth('white') + '</div></div>') +
      '<h1 class="h2" style="font-size:28px;line-height:1.2">' + T('Your smile, looked after.', 'بزەکەت، لە دەستی دڵسۆزدا.') + '</h1>' +
      '<p class="p mt">' + T('Book visits, see your treatment, prescriptions, x-rays and bills — all in one place.', 'نۆرە بگرە، چارەسەر، ڕەچەتە، تیشک و پسوولەکانت ببینە، هەموو لە یەک شوێندا.') + '</p>' +
      '<div style="flex:1"></div>' +
      '<div class="field mt2"><label>' + T('Mobile number', 'ژمارەی مۆبایل') + '</label><input class="in ltr" inputmode="tel" value="' + esc(S.profile.phone) + '" data-phone></div>' +
      '<button class="btn pri lg block" data-a="enter">' + T('Continue', 'بەردەوامبە') + i(FWD, 's') + '</button>' +
      '<p class="terms">' + T('By continuing you agree to our ', 'بە بەردەوامبوون ڕەزامەندی دەدەیت لەسەر ') + '<a href="#/legal?t=terms" data-a="legalw" data-x="terms">' + T('Terms', 'مەرجەکان') + '</a>' + T(' and ', ' و ') + '<a href="#/legal" data-a="legalw" data-x="privacy">' + T('Privacy notice', 'ڕوونکردنەوەی تایبەتمەندی') + '</a>.</p>' +
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
      '<div class="hd"><a class="me" href="#/family" aria-label="' + T('Family', 'خێزان') + '">' + avatarOf({ id: S.active || 'me', name: S.profile.name }) + (S.members.length > 1 ? '<span class="sw-ic">' + i('users', 's') + '</span>' : '') + '</a><span class="hello grow"><small>' + (isMe() ? greet + ' 👋' : T('Showing the file of', 'پەڕگەی')) + '</small><b>' + esc(S.profile.name) + '</b></span>' +
      '<a class="ib" href="#/search" aria-label="search">' + i('search') + '</a><a class="ib" href="#/chat" aria-label="chat">' + i('message') + '</a><a class="ib" href="#/notifications" aria-label="notifications">' + i('bell') + (unread() ? '<span class="dot"></span>' : '') + '</a></div>' +
      '<div class="hero-wrap"><div class="heros" data-heros>' + PROMOS.filter((p) => !p.off).map((p) => '<a class="hero' + (p.photo ? ' has-img' : '') + '" href="' + (p.svc && p.svc !== 'book' ? '#/service/' + p.svc : '#/book') + '" style="background:' + (p.photo ? 'url(' + p.photo + ') center/cover' : p.bg) + '"><div class="txt"><div class="k">' + esc(P(p.k)) + '</div><h3>' + esc(P(p.t)) + '</h3><p>' + esc(P(p.s)) + '</p><span class="cta">' + T('Book now', 'ئێستا نۆرە بگرە') + '</span></div><div class="art"><svg class="ring" viewBox="0 0 160 180"><circle cx="86" cy="92" r="74" style="fill:var(--mint)" opacity=".15"/><circle cx="86" cy="92" r="50" style="fill:var(--mint)" opacity=".17"/></svg><div class="t">' + ART.tooth(p.art || 'white') + '</div></div></a>').join('') + '</div></div>' +
      '<div class="dots" data-dots>' + PROMOS.filter((p) => !p.off).map((p, k) => '<i class="' + (k === 0 ? 'on' : '') + '"></i>').join('') + '</div>';
    const tv = todayVisit();
    if (!isMe()) html += '<button class="whobar" data-a="who" data-x="me">' + i('users', 's') + T('You are viewing ' + firstName(S.profile.name) + '’s file', 'تۆ پەڕگەی ' + firstName(S.profile.name) + ' دەبینیت', 'أنت تشاهد ملف ' + firstName(S.profile.name)) + '<b>' + T('Back to mine', 'گەڕانەوە بۆ هی خۆم') + '</b></button>';
    if (tv) html += checkinCard(tv);
    else if (up) {
      const s = svc(up.svc), d = doc(up.doc);
      html += '<a class="next" href="#/visits"><span class="cal"><small>' + MON[dt(up.date).getMonth()] + '</small><b>' + dd(up.date) + '</b></span><span class="grow"><div class="t">' + esc(s.name) + (up.step ? ' (' + N(up.step[0] + '/' + up.step[1]) + ')' : '') + '</div><div class="s">' + rel(up.date) + ' · ' + fTime(up.time) + ' · ' + esc(d.sn) + '</div><div style="margin-top:4px">' + statusBadge(up.status) + '</div></span><span class="go">' + i(FWD, 's') + '</span></a>';
    } else {
      html += '<div class="next"><span class="cal">' + i('calendar') + '</span><span class="grow"><div class="t">' + T('No upcoming visits', 'هیچ نۆرەیەکی داهاتووت نییە') + '</div><div class="s">' + T('Book a check-up in under a minute', 'لە کەمتر لە خولەکێکدا نۆرە بگرە') + '</div></span><a class="btn sm mint" href="#/book">' + T('Book', 'نۆرە بگرە') + '</a></div>';
    }
    (S.waitlist || []).filter((w) => w.offer && (w.who || 'me') === aid()).forEach((w) => { html += wlCard(w); });
    html += '<a class="urg" href="#/urgent"><span class="c">' + i('alert', 's') + '</span><span class="grow"><b>' + T('In pain or an emergency?', 'ئازارت هەیە یان فریاکەوتنە؟') + '</b><small>' + T('Tell us in a minute — we reply fast', 'لە خولەکێکدا پێمان بڵێ — خێرا وەڵام دەدەینەوە') + '</small></span><span class="chev">' + i(FWD, 's') + '</span></a>';
    if (isKid()) html += brushCard();
    if (alOf()) html += alCard();
    html += medCard();
    const prop = S.plan.find((p) => p.status === 'proposed');
    if (prop) html += '<button class="planin" data-a="plan" data-x="' + prop.id + '"><span class="c">' + i('clipboard') + '</span><span class="grow"><b>' + T('New treatment plan to review', 'پلانێکی چارەسەری نوێ بۆ سەیرکردن') + '</b><small>' + esc(prop.title) + ' · ' + money(planCost(prop)) + '</small></span><span class="go">' + i(FWD, 's') + '</span></button>';
    const rc = recentCare();
    if (rc) html += '<a class="carein" href="#/care/' + rc.k + '?a=' + rc.a.id + '"><span class="c">' + i('heart') + '</span><span class="grow"><b>' + esc(P(rc.g.title)) + '</b><small>' + T('Day ' + rc.n + ' of ' + rc.g.days + ' · what is normal and what to avoid', 'ڕۆژی ' + N(rc.n) + ' لە ' + N(rc.g.days) + ' · چی ئاساییە و چی نەکەیت', 'اليوم ' + N(rc.n) + ' من ' + N(rc.g.days) + ' · ما هو طبيعي وما يجب تجنّبه') + '</small></span><span class="go">' + i(FWD, 's') + '</span></a>';
    if (showRecall) html += '<div class="recall"><span class="c' + (svc('clean').photo ? ' ph' : '') + '">' + sArt(svc('clean')) + '</span><span class="grow"><b>' + T('Time for your check-up', 'کاتی پشکنینەکەتە') + '</b><small>' + T('Last cleaning ', 'دوایین پاککردنەوە ') + ago(lastClean.date) + '</small></span><a class="btn sm mint" href="#/book?svc=clean">' + T('Book', 'نۆرە بگرە') + '</a></div>';
    const TL = DATA.TILES || {};
    html += '<div class="sec"><b>' + T('My care', 'خزمەتگوزارییەکانم') + '</b></div><div class="tiles">' + [
      ['book', '#/book', 'plus', T('Book a visit', 'نۆرە بگرە'), T('Pick a time in a minute', 'لە خولەکێکدا کات هەڵبژێرە')],
      ['rx', '#/file?tab=rx', 'pill', T('Prescriptions', 'ڕەچەتەکان'), N(S.rx.length) + T(' prescriptions', ' ڕەچەتە')],
      ['xray', '#/file?tab=xray', 'image', T('X-rays', 'تیشک'), N(S.xrays.length) + T(' images', ' وێنە')],
      ['pay', '#/file?tab=bills', 'wallet', bal ? T('Pay', 'پارەدان') : T('Bills', 'پسوولەکان'), bal ? money(bal) + T(' due', ' ماوە') : T('All paid', 'هەمووی دراوە')]
    ].map(([k, h2, ic, l, sub]) => '<a class="tile t-' + k + (TL[k] ? ' has-img' : '') + '" href="' + h2 + '"' + (TL[k] ? ' style="background-image:url(' + TL[k] + ')"' : '') + '>' + (TL[k] ? '' : '<span class="bg">' + ART.scene(k) + '</span>') + '<span class="ic">' + i(ic) + '</span><b>' + l + '</b><small>' + sub + '</small></a>').join('') + '</div>';
    html += '<div class="sec"><b>' + T('Treatments', 'چارەسەرەکان') + '</b><a href="#/services">' + T('See all', 'هەمووی') + '</a></div>' +
      '<div class="svcs">' + ['white', 'braces', 'implant', 'kids'].filter((id) => !svc(id).hidden).map((id, k) => { const s = svc(id); return '<a class="sv' + (s.photo ? ' has-img' : k === 0 ? ' hl' : '') + '" href="#/service/' + id + '"' + (s.photo ? ' style="background-image:url(' + s.photo + ')"' : '') + '><div class="art">' + (s.photo ? '' : ART.tooth(s.art)) + '</div><b>' + esc(P({ white: ['Whitening', 'سپیکردنەوە'], braces: ['Braces', 'تەل'], implant: ['Implants', 'ئیمپلانت'], kids: ['Kids', 'منداڵان'] }[id])) + '</b></a>'; }).join('') + '</div>';
    const libs = DATA.LIBRARY.filter((a) => !a.off).slice(0, 4);
    if (libs.length) html += '<div class="sec"><b>' + T('Healthy smile', 'بزەی تەندروست') + '</b><a href="#/learn">' + T('See all', 'هەمووی') + '</a></div><div class="hscroll libs">' + libs.map((a) => libCard(a)).join('') + '</div>';
    html += '<div class="sec"><b>' + T('Our doctors', 'دکتۆرەکانمان') + '</b><a href="#/doctors">' + T('See all', 'هەمووی') + '</a></div><div class="hscroll">' + allDocs().map(docCard).join('') + '</div>';
    if (DATA.REFERRAL.on) html += '<a class="refb" href="#/refer"><span class="c">' + i('gift', 'l') + '</span><span class="grow"><b>' + T('Invite a friend, both get ' + DATA.REFERRAL.pct + '% off', 'هاوڕێیەک بانگهێشت بکە، هەردووکتان ' + N(DATA.REFERRAL.pct) + '٪ داشکاندن', 'ادعُ صديقاً واحصلا معاً على خصم ' + N(DATA.REFERRAL.pct) + '٪') + '</b><small>' + T('Share your code on WhatsApp', 'کۆدەکەت لە واتسئاپ بنێرە') + '</small></span><span class="chev">' + i(FWD, 's') + '</span></a>';
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
        window.__heroT = setInterval(() => { if (!document.body.contains(sc)) return clearInterval(window.__heroT); const k = (idx() + 1) % Math.max(1, PROMOS.filter((p) => !p.off).length); sc.scrollTo({ left: (RTL ? -1 : 1) * k * (sc.clientWidth + 12), behavior: 'smooth' }); }, 4500);
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
        '<div class="chips">' + [['all', T('All', 'هەموو')]].concat(CATS.map((c) => [c[0], T(c[1], c[2], c[3] || undefined)])).map(([k, l]) => '<button class="chip ' + (SV.cat === k ? 'on' : '') + '" data-a="svcat" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        list.map((s) => '<a class="svrow" href="#/service/' + s.id + '"><span class="art' + (s.photo ? ' ph' : '') + '">' + sArt(s) + '</span><span class="grow"><div class="row-t">' + esc(s.name) + '</div><div class="row-s">' + esc(s.desc) + '</div><div class="row-s" style="margin-top:2px">' + N(s.min) + T(' min', ' خولەک') + ' · ' + T('from ', 'لە ') + money(s.price) + '</div></span><span class="muted">' + i(FWD, 's') + '</span></a>').join('') +
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
        (s.photo ? '<div class="svhero" style="background-image:url(' + s.photo + ')"></div>' : '<div style="height:190px;border-radius:24px;background:radial-gradient(120% 140% at 50% 20%,#2C5C8F 0%,#1B2B4F 60%,#14213D 100%);position:relative;overflow:hidden"><svg viewBox="0 0 300 190" style="position:absolute;inset:0;width:100%;height:100%"><circle cx="150" cy="96" r="80" style="fill:var(--mint)" opacity=".14"/><circle cx="150" cy="96" r="54" style="fill:var(--mint)" opacity=".16"/></svg><div style="position:absolute;left:50%;top:18px;width:150px;height:160px;margin-left:-75px">' + ART.tooth(s.art) + '</div></div>') +
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
        '<div class="chips">' + [['all', T('All', 'هەموو')], ['fav', T('Favourites', 'دڵخوازەکان')]].concat(CATS.filter((c) => c[0] !== 'general').map((c) => [c[0], T(c[1], c[2], c[3] || undefined)])).map(([k, l]) => '<button class="chip ' + (DV.f === k ? 'on' : '') + '" data-a="dfilter" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
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
    const reviews = REVIEWS.map((r, k) => ({ n: T(r[0], r[1], r[5] || undefined), s: r[2], t: T(r[3], r[4], r[6] || undefined), d: addDays(today(), -(k * 9 + 3)) }));
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
          list.map((s) => '<button class="svrow ' + (B.svc === s.id ? 'on' : '') + '" data-a="bsvc" data-x="' + s.id + '"><span class="art' + (s.photo ? ' ph' : '') + '">' + sArt(s) + '</span><span class="grow"><div class="row-t">' + esc(s.name) + '</div><div class="row-s">' + N(s.min) + T(' min', ' خولەک') + ' · ' + T('from ', 'لە ') + money(s.price) + '</div></span><span class="radio"></span></button>').join('') +
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
          '<p class="small muted mt">' + T('Times shown are the start of a ', 'کاتەکان دەستپێکی ') + N(s.min) + T('-minute visit.', ' خولەک سەردانن.') + '</p>' +
          (B.editId ? '' : '<button class="wl" data-a="wljoin"><span class="c">' + i('bell', 's') + '</span><span class="grow"><b>' + T('No time that suits you?', 'هیچ کاتێکی گونجاوت نەدۆزییەوە؟') + '</b><small>' + T('Join the waiting list — we will offer you the first time that opens', 'بچۆ ناو لیستی چاوەڕوانی — یەکەم کاتی بەتاڵ بە تۆ دەدەین') + '</small></span><span class="chev">' + i(FWD, 's') + '</span></button>') + '</div>' +
          '<div class="foot"><button class="btn pri lg block" data-a="bnext" ' + (B.time ? '' : 'disabled') + '>' + (B.time ? fDate(B.date, true) + ' · ' + fTime(B.time) : T('Pick a time', 'کاتێک هەڵبژێرە')) + '</button></div>'
      };
    }
    if (step === 'review') {
      if (!B.time) { go('#/book/time', true); return null; }
      const s = svc(B.svc), d = doc(B.doc);
      return {
        html: '<div class="page nobar">' + top(title, '') + stepBar(3) +
          '<div class="card"><div class="li"><span class="dav">' + portrait(B.doc) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + esc(d.sp) + '</div></span></div>' +
          '<div class="mt">' + [[T('Patient', 'نەخۆش'), esc(S.profile.name) + (isMe() ? '' : ' <span class="badge b-blue">' + esc(REL[(S.members.find((m) => m.id === S.active) || {}).rel] || '') + '</span>')], [T('Treatment', 'چارەسەر'), esc(s.name)], [T('Date', 'ڕۆژ'), fDate(B.date, true)], [T('Time', 'کات'), fTime(B.time) + ' · ' + N(s.min) + T(' min', ' خولەک')], [T('Price from', 'نرخ لە'), money(s.price)], [T('Where', 'شوێن'), esc(P(CLINIC.address))]].map(([a, b]) => '<div class="sum"><span>' + a + '</span><b>' + b + '</b></div>').join('') + '</div></div>' +
          '<div class="lbl">' + T('Reason for visit', 'هۆکاری سەردان') + '<span>' + T('optional', 'ئارەزوومەندانە') + '</span></div><textarea class="in" data-bnote placeholder="' + T('e.g. pain on the lower left, nervous about needles', 'بۆ نموونە: ئازار لە لای چەپی خوارەوە، ترس لە دەرزی') + '">' + esc(B.note) + '</textarea>' +
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
      const wl = (S.waitlist || []).filter((w) => !w.appt && (w.who || 'me') === aid());
      body = wl.map((w) => w.offer ? wlCard(w) : '<div class="wlrow"><span class="c">' + i('bell', 's') + '</span><span class="grow"><b>' + T('Waiting list', 'لیستی چاوەڕوانی') + ' · ' + esc(svc(w.svc).name) + '</b><small>' + (w.doc ? esc(doc(w.doc).name) + ' · ' : '') + T('we will notify you when a time opens', 'کە کاتێک بەتاڵ بوو ئاگادارت دەکەینەوە') + '</small></span><button class="btn out sm" data-a="wlleave" data-x="' + w.id + '">' + T('Leave', 'دەرچوون') + '</button></div>').join('');
      body += ups.length ? ups.map((a, k) => visitCard(a, k === 0)).join('') : '<div class="empty"><div class="c">' + i('calendar', 'xl') + '</div>' + T('No upcoming visits', 'هیچ نۆرەیەکی داهاتووت نییە') + '<div class="mt"><a class="btn mint" href="#/book">' + T('Book a visit', 'نۆرە بگرە') + '</a></div></div>';
    } else {
      body = ps.length ? ps.map((a) => visitCard(a, false)).join('') : '<div class="empty">' + T('No past visits yet', 'هێشتا هیچ سەردانێکی پێشووت نییە') + '</div>';
    }
    return {
      html: '<div class="page">' + top(T('My visits', 'نۆرەکانم'), '', false, '<a class="ib" href="#/book">' + i('plus') + '</a>') + pbar() + (VV.tab === 'up' && todayVisit() ? checkinCard(todayVisit()) : '') +
        '<div class="seg"><button class="' + (VV.tab === 'up' ? 'on' : '') + '" data-a="vtab" data-x="up">' + T('Upcoming', 'داهاتوو') + ' (' + N(ups.length) + ')</button><button class="' + (VV.tab === 'past' ? 'on' : '') + '" data-a="vtab" data-x="past">' + T('Past', 'ڕابردوو') + ' (' + N(ps.length) + ')</button></div>' + body + '</div>' + tabbar('visits')
    };
  };
  /* texts for the sample visits always follow the current language */
  const DEMO = {}; (function () { const b = DATA.build(window.Lang); b.appts.concat(...b.members.filter((m) => m.data).map((m) => m.data.appts)).forEach((x) => { DEMO[x.id] = x; }); })();
  const reasonOf = (a) => (DEMO[a.id] ? DEMO[a.id].reason : a.reason) || a.note || '';
  const noteOf = (a) => (DEMO[a.id] ? DEMO[a.id].note : a.note) || '';
  function visitCard(a, big) {
    const s = svc(a.svc), d = doc(a.doc);
    const name = esc(s.name) + (a.step ? ' (' + N(a.step[0] + '/' + a.step[1]) + ')' : '');
    const why = reasonOf(a), note = noteOf(a);
    const active = ['pending', 'confirmed'].includes(a.status) && a.date >= today();
    let acts = '';
    const onWl = (S.waitlist || []).some((w) => w.appt === a.id);
    if (active) acts = (onWl ? '<div class="wlon">' + i('bell', 's') + T('On the waiting list for an earlier time', 'لە لیستی چاوەڕوانیدایت بۆ کاتێکی زووتر') + '</div>' : '') + '<div class="acts"><button class="btn out sm" data-a="ics" data-x="' + a.id + '">' + i('calendar', 's') + T('Calendar', 'ڕۆژژمێر') + '</button><button class="btn out sm" data-a="resched" data-x="' + a.id + '">' + i('clock', 's') + T('Change', 'گۆڕین') + '</button><button class="btn ' + (big ? 'out' : 'red') + ' sm" data-a="cancel" data-x="' + a.id + '">' + i('x', 's') + T('Cancel', 'هەڵوەشاندنەوە') + '</button></div>' + (onWl ? '' : '<button class="lnk earlier" data-a="wljoin" data-x="' + a.id + '">' + i('clock', 's') + T('Want an earlier time?', 'کاتێکی زووترت دەوێت؟') + '</button>');
    else if (a.status === 'done') acts = (careKey(a.svc) ? '<a class="btn care sm block" href="#/care/' + careKey(a.svc) + '?a=' + a.id + '">' + i('heart', 's') + T('Aftercare guide', 'ڕێنمایی دوای چارەسەر') + '</a>' : '') + '<div class="acts"><button class="btn soft sm" data-a="again" data-x="' + a.id + '">' + i('refresh', 's') + T('Book again', 'دووبارە نۆرە بگرە') + '</button>' + ((S.rated || {})[a.id] || a.rated ? '<span class="btn sm rated" style="flex:0">' + stars((S.rated || {})[a.id] || a.rated) + '</span>' : '<button class="btn out sm" data-a="rate" data-x="' + a.id + '">' + i('star', 's') + T('Rate visit', 'هەڵسەنگاندن') + '</button>') + '</div>';
    const docRow = (cls) => '<a class="vdoc ' + (cls || '') + '" href="#/doctor/' + a.doc + '"><span class="vav">' + portrait(a.doc) + '</span><span class="grow"><b>' + esc(d.name) + '</b><small>' + esc(d.sp) + '</small></span>' + (big ? '' : statusBadge(a.status)) + '</a>';
    const info = (ic, label, val) => '<div class="vi"><span class="c">' + i(ic, 's') + '</span><span class="grow"><small>' + label + '</small><b>' + val + '</b></span></div>';
    if (big) {
      const n = diff(a.date, today());
      return '<div class="vc big"><div class="row between" style="position:relative;z-index:1"><span class="row-s">' + T('Next visit', 'نۆرەی داهاتوو') + ' · ' + (n === 0 ? T('today', 'ئەمڕۆ') : n === 1 ? T('tomorrow', 'سبەینێ') : T('in ' + n + ' days', 'دوای ' + N(n) + ' ڕۆژ', 'بعد ' + N(n) + ' أيام')) + '</span>' + statusBadge(a.status) + '</div>' +
        '<div class="when">' + fDate(a.date, true) + ' · ' + fTime(a.time) + '</div><div class="row-s" style="position:relative;z-index:1">' + name + ' · ' + N(s.min) + T(' min', ' خولەک') + '</div>' +
        docRow('dark') +
        (why ? '<div class="vwhy dark"><small>' + T('Reason for visit', 'هۆکاری سەردان') + '</small>' + esc(why) + '</div>' : '') +
        '<div class="li mt" style="position:relative;z-index:1"><span class="c" style="background:rgba(255,255,255,.1);color:#fff;width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('home', 's') + '</span><span class="grow"><div class="row-s">' + esc(P(CLINIC.address)) + '</div></span><a class="ib" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);color:#fff" target="_blank" rel="noopener" href="' + CLINIC.map + '">' + i('globe') + '</a></div>' + acts + '</div>';
    }
    return '<div class="vc v2">' + docRow() +
      '<div class="vgrid">' + info('calendar', DAYF[dow(a.date)], fDate(a.date)) + info('clock', T('Time', 'کات'), fTime(a.time)) + '</div>' +
      '<div class="vgrid one">' + info('tooth', T('Treatment', 'چارەسەر'), name) + '</div>' +
      (why ? '<div class="vwhy"><small>' + T('Reason for visit', 'هۆکاری سەردان') + '</small>' + esc(why) + '</div>' : '') +
      (note && note !== why ? '<p class="vnote">' + i('message', 's') + '<span>' + T('Your note: ', 'تێبینیت: ') + esc(note) + '</span></p>' : '') +
      acts + '</div>';
  }

  /* ----- my file ----- */
  SCREENS.file = (x, q) => {
    const tab = ['visits', 'rx', 'xray', 'bills'].includes(q.tab) ? q.tab : 'visits';
    const p = S.profile;
    let html = '<div class="page">' + top(T('My file', 'پەڕگەکەم'), '', false, '<a class="ib" href="#/account" aria-label="' + T('Download', 'داگرتن') + '">' + i('download') + '</a>') + pbar() +
      '<div class="pcard"><span class="me">' + avatarOf({ id: S.active || 'me', name: p.name }) + '</span><span class="grow"><div class="row-t" style="font-size:16px">' + esc(p.name) + '</div><div class="row-s">' + T('File #', 'پەڕگەی #') + N(p.file) + ' · ' + T('Blood ', 'خوێن ') + '<span class="ltr">' + p.blood + '</span></div><div class="row" style="margin-top:5px;flex-wrap:wrap">' + p.allergies.map((a) => '<span class="badge b-red">' + T('Allergy: ', 'هەستیاری: ') + esc(a) + '</span>').join('') + '</div></span></div>' +
      '<div class="seg mt">' + [['visits', T('Treatment', 'چارەسەر')], ['rx', T('Prescriptions', 'ڕەچەتە')], ['xray', T('X-rays', 'تیشک')], ['bills', T('Bills', 'پسوولە')]].map(([k, l]) => '<button class="' + (k === tab ? 'on' : '') + '" data-a="ftab" data-x="' + k + '">' + l + '</button>').join('') + '</div>';
    if (tab === 'visits') {
      html += S.plan.map(planCard).join('');
      const up = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], lo = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
      html += '<div class="lbl">' + T('My teeth', 'ددانەکانم') + '<span>' + T('your right ← → your left', 'ڕاستت ← → چەپت') + '</span></div><div class="card"><div class="teeth">' + up.map((n) => '<span class="th ' + (S.teeth[n] || '') + '">' + n + '</span>').join('') + '</div><div class="teeth" style="margin-top:4px">' + lo.map((n) => '<span class="th ' + (S.teeth[n] || '') + '">' + n + '</span>').join('') + '</div><div class="legend"><span><i style="background:#DCE8F7"></i>' + T('Filling', 'پڕکراوەتەوە') + '</span><span><i style="background:#FBE3E3"></i>' + T('Root canal', 'چارەسەری ڕەگ') + '</span><span><i style="background:#E3E9EC"></i>' + T('Missing', 'نییە') + '</span></div></div>';
      const done = S.appts.filter((a) => a.status === 'done').sort((a, b) => (a.date < b.date ? 1 : -1));
      html += '<div class="lbl">' + T('Visit history', 'مێژووی سەردان') + '<span>' + N(done.length) + T(' visits', ' سەردان') + '</span></div><div class="tl">' + done.map((a) => {
        const rx = S.rx.find((r) => r.date === a.date), xr = S.xrays.find((y) => y.date === a.date), inv = S.invoices.find((v) => v.date === a.date);
        return '<div class="it"><span class="dt">' + i('check', 's') + '</span><div class="bx"><div class="r1"><span class="row-t">' + esc(svc(a.svc).name) + (a.step ? ' (' + N(a.step[0] + '/' + a.step[1]) + ')' : '') + '</span>' + (inv ? (paidOf(inv) >= inv.total ? '<span class="badge b-mint">' + T('Paid', 'دراوە') + '</span>' : '<span class="badge b-amber">' + T('Instalments', 'قیست') + '</span>') : '') + '</div><div class="row-s">' + fDate(a.date) + ' · ' + esc(doc(a.doc).name) + '</div>' + (rx || xr ? '<div class="att">' + (rx ? '<button data-a="rx" data-x="' + rx.id + '">' + i('pill', 's') + T('Prescription', 'ڕەچەتە') + '</button>' : '') + (xr ? '<button data-a="xray" data-x="' + xr.id + '">' + i('image', 's') + T('X-ray', 'تیشک') + '</button>' : '') + '</div>' : '') + '</div></div>';
      }).join('') + '</div>';
    }
    if (tab === 'rx') {
      html += medsOf().some(medActive) ? '<a class="cardlink" style="margin:0 0 10px" href="#/meds"><span class="c">' + i('bell', 'l') + '</span><span class="grow"><b>' + T('Medicine reminders', 'بیرخستنەوەی دەرمان') + '</b><small>' + N(dosesToday().filter((d) => d.taken).length) + T(' of ', ' لە ') + N(dosesToday().length) + T(' doses taken today', ' ژەمی ئەمڕۆ خوراوە') + '</small></span><span class="chev">' + i(FWD, 's') + '</span></a>' : '';
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
      html: '<div class="page nobar" style="padding-bottom:150px"><div class="chathd"><button class="ib" data-a="back">' + i(BACK) + '</button>' + ART.logo(42) + '<span class="grow"><div class="row-t">' + T('Bite reception', 'پێشوازیی Bite') + '</div><div class="row-s"><span style="color:var(--ok)">●</span> ' + T('Usually replies within minutes', 'بە زۆری لە چەند خولەکێکدا وەڵام دەداتەوە') + '</div></span><a class="ib" href="tel:' + CLINIC.phone + '">' + i('phone') + '</a></div><div class="msgs" data-msgs>' + msgs + '</div></div>' +
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
    if (/price|cost|نرخ|پارە|سعر|أسعار|اسعار|تكلفة|كلفة/.test(k)) r = T('Check-up 25,000 IQD · Cleaning 50,000 · Whitening 250,000 (20% off this month) · Root canal from 450,000. Full list in Treatments.', 'پشکنین ٢٥,٠٠٠ د.ع · پاککردنەوە ٥٠,٠٠٠ · سپیکردنەوە ٢٥٠,٠٠٠ (٢٠٪ داشکاندن ئەم مانگە) · چارەسەری ڕەگ لە ٤٥٠,٠٠٠. لیستی تەواو لە بەشی چارەسەرەکان.');
    else if (/hour|open|time|کات|دەوام|دوام|ساعات|مفتوح|وقت/.test(k)) r = T('We are open Saturday to Thursday, 12:00 – 21:00. Closed on Fridays.', 'شەممە تا پێنجشەممە، ١٢:٠٠ – ٢١:٠٠ کراوەین. هەینی داخراوە.');
    else if (/where|address|location|کوێ|ناونیشان|أين|وين|عنوان|موقع/.test(k)) r = P(CLINIC.address) + T('. Parking is available behind the building.', '. شوێنی ئۆتۆمبێل لە پشتی بیناکە هەیە.');
    else if (/pain|hurt|ئازار|دەیەشێ|ألم|الم|وجع/.test(k)) r = T('Sorry to hear that. If it is urgent, call us on 0750 543 0000 and we will fit you in today.', 'ببورە بۆ ئەوە. ئەگەر پەلەیە، پەیوەندی بکە بە ٠٧٥٠ ٥٤٣ ٠٠٠٠ و ئەمڕۆ کاتێکت بۆ دەدۆزینەوە.');
    else if (/book|appoint|نۆرە|حجز|موعد/.test(k)) r = T('You can book directly from the green + button, or tell us the day and time you prefer.', 'دەتوانیت ڕاستەوخۆ لە دوگمەی سەوزی + نۆرە بگریت، یان ڕۆژ و کاتی دڵخوازت پێمان بڵێ.');
    setTimeout(() => { S.chat.push({ me: false, t: r, at: nowStamp() }); save(); if (route().path === 'chat') render(); }, 1300);
  }

  /* ----- profile ----- */
  SCREENS.profile = () => {
    const p = S.profile;
    const item = (href, ic, c, l, extra, act) => (act ? '<button data-a="' + act + '">' : '<a href="' + href + '"' + (href.startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>') + '<span class="c ' + c + '" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i(ic, 's') + '</span><span class="grow">' + l + '</span>' + (extra || '') + '<span class="chev">' + i(FWD, 's') + '</span>' + (act ? '</button>' : '</a>');
    return {
      html: '<div class="page">' + top(T('Profile', 'پرۆفایل'), '', false) +
        '<div class="pcard"><span class="me">' + avatarOf({ id: S.active || 'me', name: p.name }) + '</span><span class="grow"><div class="row-t" style="font-size:16px">' + esc(p.name) + '</div><div class="row-s ltr" style="text-align:start">' + esc(p.phone) + '</div><div class="row-s">' + T('File #', 'پەڕگەی #') + N(p.file) + '</div></span><button class="btn sm soft" data-a="editp">' + i('edit', 's') + T('Edit', 'دەستکاری') + '</button></div>' +
        '<a class="cardlink" href="#/card"><span class="c">' + i('qr', 'l') + '</span><span class="grow"><b>' + T('My patient card', 'کارتی نەخۆشەکەم') + '</b><small>' + T('QR code for reception', 'کۆدی QR بۆ پێشوازی') + '</small></span><span class="chev">' + i(FWD, 's') + '</span></a>' +
        '<div class="menu mt">' + item('#/family', 'users', 'mint', T('Family members', 'ئەندامانی خێزان'), '<span class="small muted">' + N(S.members.length) + '</span>') + item('#/file', 'file', 'mint', T('My file', 'پەڕگەکەم')) + item('#/visits', 'calendar', 'blue', T('My visits', 'نۆرەکانم')) + item('#/doctors?fav=1', 'star', 'red', T('Favourite doctors', 'دکتۆرە دڵخوازەکان'), '<span class="small muted">' + N(S.favs.length) + '</span>') + item('#/notifications', 'bell', 'amber', T('Notifications', 'ئاگادارکردنەوەکان'), unread() ? '<span class="badge b-red">' + N(unread()) + '</span>' : '') + item('#/chat', 'message', 'purple', T('Chat with the clinic', 'چات لەگەڵ کلینیک')) + '</div>' +
        '<div class="lbl">' + T('Tools', 'ئامرازەکان') + '</div><div class="menu">' + item('#/meds', 'pill', 'blue', T('Medicine reminders', 'بیرخستنەوەی دەرمان')) + item('#/urgent', 'alert', 'red', T('Pain or emergency', 'ئازار یان فریاکەوتن')) + item('#/learn', 'book', 'blue', T('Healthy smile guides', 'ڕێنمایی بزەی تەندروست')) + (isKid() ? item('#/brush', 'brush', 'amber', T('Brushing game', 'یاریی ددانشۆردن'), '<span class="small muted">⭐ ' + N(totalStars()) + '</span>') : '') + (alOf() ? item('#/aligner', 'smile', 'mint', T('My aligners', 'ئەلاینەرەکانم')) : '') + (DATA.REFERRAL.on ? item('#/refer', 'gift', 'purple', T('Invite a friend', 'هاوڕێیەک بانگهێشت بکە')) : '') + '</div>' +
        '<div class="lbl">' + T('Language', 'زمان') + '</div><div class="seg">' + [['en', 'English'], ['ku', 'کوردی'], ['ar', 'العربية']].map(([k, l]) => '<button class="' + (window.Lang === k ? 'on' : '') + '" data-a="setlang" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        '<div class="card" style="padding:4px 14px">' + [['remind', T('Appointment reminders', 'بیرخستنەوەی نۆرە'), T('A day before, on WhatsApp', 'ڕۆژێک پێشتر، لە واتسئاپ')], ['offers', T('Offers & news', 'داشکاندن و هەواڵ'), T('Not more than twice a month', 'زیاتر نییە لە دووجار لە مانگێکدا')]].map(([k, l, s]) => '<div class="toggle"><span class="grow"><div class="row-t">' + l + '</div><div class="row-s">' + s + '</div></span><button class="sw ' + (S.settings[k] ? 'on' : '') + '" data-a="setting" data-x="' + k + '" aria-label="' + l + '"></button></div>').join('') + '</div>' +
        '<div class="lbl">' + T('Appearance', 'ڕووکار') + '</div><div class="seg">' + [['auto', T('Automatic', 'خۆکار')], ['light', T('Light', 'ڕووناک')], ['dark', T('Dark', 'تاریک')]].map(([k, l]) => '<button class="' + (lsGet('bite_theme', 'auto') === k ? 'on' : '') + '" data-a="look" data-x="theme:' + k + '">' + i(k === 'dark' ? 'moon' : k === 'light' ? 'sun' : 'device', 's') + ' ' + l + '</button>').join('') + '</div>' +
        '<div class="lbl">' + T('Text size', 'قەبارەی نووسین') + '</div><div class="seg tsz">' + [['m', 'A', T('Normal', 'ئاسایی')], ['l', 'A', T('Large', 'گەورە')], ['xl', 'A', T('Larger', 'گەورەتر')]].map(([k, a, l]) => '<button class="' + (lsGet('bite_size', 'm') === k ? 'on' : '') + ' z' + k + '" data-a="look" data-x="size:' + k + '" aria-label="' + l + '"><b>' + a + '</b> ' + l + '</button>').join('') + '</div>' +
        '<div class="lbl">' + T('Security & privacy', 'ئاسایش و تایبەتمەندی') + '</div><div class="card" style="padding:4px 14px"><div class="toggle"><span class="c navy" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('lock', 's') + '</span><span class="grow"><div class="row-t">' + T('App lock', 'قفڵی ئەپ') + '</div><div class="row-s">' + T('Ask for a PIN when the app opens', 'لە کاتی کردنەوەدا پین داوا بکات') + '</div></span><button class="sw ' + (hasPin() ? 'on' : '') + '" data-a="pinlock" aria-label="lock"></button></div></div>' +
        '<div class="menu mt">' + item('#/account', 'shield', 'blue', T('My data & account', 'زانیارییەکانم و ئەکاونت')) + item('#/legal', 'file', 'navy', T('Privacy & terms', 'تایبەتمەندی و مەرجەکان')) + item('#/help', 'help', 'amber', T('Help & questions', 'یارمەتی و پرسیارەکان')) + '</div>' +
        '<div class="lbl">' + T('Clinic', 'کلینیک') + '</div><div class="menu">' + item('tel:' + CLINIC.phone, 'phone', 'navy', T('Call the clinic', 'پەیوەندی بە کلینیکەوە'), '<span class="small muted ltr">0750 543 0000</span>') + item(waLink(''), 'whatsapp', 'wa', 'WhatsApp') + item(CLINIC.map, 'globe', 'blue', T('Directions', 'ڕێگای گەیشتن')) + '</div>' +
        '<div class="menu mt">' + item('', 'refresh', 'amber', T('Reset demo data', 'گەڕانەوەی داتای نموونەیی'), '', 'reset') + item('', 'logout', 'red', T('Sign out', 'چوونەدەرەوە'), '', 'signout') + '</div>' +
        '<p class="demo">' + T('Bite for Dentistry · patient app demo', 'Bite for Dentistry · نموونەی ئەپی نەخۆش') + '</p></div>' + tabbar('profile')
    };
  };

  /* ----- aftercare guide ----- */
  SCREENS.care = (key, q) => {
    const g = DATA.AFTERCARE[key];
    if (!g) { go('#/home', true); return null; }
    const a = q.a && S.appts.find((x) => x.id === q.a);
    const n = a ? diff(today(), a.date) + 1 : 0;
    const sec = (list, ic, c, label) => list && list.length ? '<div class="lbl">' + label + '</div><div class="card cg">' + list.map((x) => '<div class="li"><span class="c ' + c + '">' + i(ic, 's') + '</span><span class="grow">' + esc(P(x)) + '</span></div>').join('') + '</div>' : '';
    return {
      html: '<div class="page nobar">' + top(esc(P(g.title)), a ? esc(svc(a.svc).name) + ' · ' + esc(doc(a.doc).sn) : '') +
        (a ? '<div class="cday"><div class="row between"><b>' + (n > g.days ? T('Recovery period finished', 'ماوەی چاکبوونەوە تەواو بوو') : T('Day ' + n + ' of ' + g.days, 'ڕۆژی ' + N(n) + ' لە ' + N(g.days), 'اليوم ' + N(n) + ' من ' + N(g.days))) + '</b><span class="small">' + fDate(a.date) + '</span></div><div class="bar"><i style="width:' + Math.min(100, Math.round(n / g.days * 100)) + '%"></i></div></div>' : '') +
        sec(g.normal, 'info', 'blue', T('What is normal', 'چی ئاساییە')) + sec(g.do, 'check', 'mint', T('Do', 'بیکە')) + sec(g.avoid, 'x', 'red', T('Avoid', 'مەیکە')) + sec(g.call, 'phone', 'amber', T('Contact us if', 'پەیوەندیمان پێوە بکە ئەگەر')) +
        '<p class="small muted mt">' + T('This guide is general advice. Always follow what your doctor told you.', 'ئەم ڕێنماییە ئامۆژگاری گشتییە. هەمیشە ئەوە بکە کە دکتۆرەکەت پێی وتوویت.') + '</p></div>' +
        '<div class="foot"><a class="btn out lg grow" href="tel:' + CLINIC.phone + '">' + i('phone', 's') + T('Call', 'پەیوەندی') + '</a><a class="btn wa lg grow" target="_blank" rel="noopener" href="' + waLink(T('Hello, I have a question after my ', 'سڵاو، پرسیارێکم هەیە دوای ') + (a ? svc(a.svc).name : P(g.title))) + '">' + i('whatsapp', 's') + 'WhatsApp</a></div>'
    };
  };

  /* ----- family ----- */
  SCREENS.family = () => {
    const list = people();
    return {
      html: '<div class="page nobar">' + top(T('Family members', 'ئەندامانی خێزان'), T('One account for the whole family', 'یەک ئەکاونت بۆ هەموو خێزان')) +
        '<p class="p">' + T('Each person has their own file at the clinic. Choose whose file you want to see, book for, or pay for.', 'هەر کەسێک پەڕگەی خۆی لە کلینیک هەیە. هەڵبژێرە پەڕگەی کێ دەبینیت، بۆ کێ نۆرە دەگریت یان پارە دەدەیت.') + '</p>' +
        list.map((p) => { const ag = ageOf(p.dob), on = p.id === (S.active || 'me'); return '<div class="fm' + (on ? ' on' : '') + '"><button class="fm-main" data-a="who" data-x="' + p.id + '"><span class="pa">' + avatarOf(p) + '</span><span class="grow"><div class="row-t">' + esc(p.name) + '</div><div class="row-s">' + REL[p.rel] + (ag !== null ? ' · ' + N(ag) + T(' years', ' ساڵ') : '') + ' · ' + T('File #', 'پەڕگەی #') + N(p.file) + '</div></span>' + (on ? '<span class="badge b-mint">' + T('Showing', 'ئێستا') + '</span>' : '<span class="muted">' + i(FWD, 's') + '</span>') + '</button>' + (p.id !== 'me' && !p.demo ? '<button class="fm-x" data-a="rmember" data-x="' + p.id + '" aria-label="' + T('Remove', 'لابردن') + '">' + i('trash', 's') + '</button>' : '') + '</div>'; }).join('') +
        '<button class="add-fm" data-a="addmember">' + i('plus') + T('Add a family member', 'زیادکردنی ئەندامێکی خێزان') + '</button>' +
        '<div class="note-box mt">' + i('shield', 's') + '<span>' + T('Only the account holder can see these files. A child’s file moves to their own account when they turn 18.', 'تەنها خاوەنی ئەکاونتەکە ئەم پەڕگانە دەبینێت. پەڕگەی منداڵ کاتێک تەمەنی دەبێتە ١٨ ساڵ دەگوازرێتەوە بۆ ئەکاونتی خۆی.') + '</span></div></div>'
    };
  };

  /* ----- my data & account ----- */
  SCREENS.account = () => ({
    html: '<div class="page nobar">' + top(T('My data & account', 'زانیارییەکانم و ئەکاونت'), '') +
      '<div class="card"><div class="li"><span class="c blue">' + i('shield') + '</span><span class="grow"><div class="row-t">' + T('Your file belongs to you', 'پەڕگەکەت هی خۆتە') + '</div><div class="row-s">' + T('You can take a copy of everything we hold about you at any time.', 'هەر کاتێک دەتوانیت کۆپییەکی هەموو ئەو زانیاریانە وەربگریت کە لای ئێمەیە.') + '</div></span></div></div>' +
      '<div class="lbl">' + T('Download', 'داگرتن') + '</div><div class="menu">' +
      '<button data-a="dlfile"><span class="c mint" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('file', 's') + '</span><span class="grow">' + T('My file as a document', 'پەڕگەکەم وەک بەڵگەنامە') + '<div class="row-s">' + T('Visits, prescriptions, x-rays and bills — ready to print', 'سەردان، ڕەچەتە، تیشک و پسوولە — ئامادە بۆ چاپکردن') + '</div></span><span class="chev">' + i('download', 's') + '</span></button>' +
      '<button data-a="dldata"><span class="c navy" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('download', 's') + '</span><span class="grow">' + T('All my data (file for other systems)', 'هەموو زانیارییەکانم (فایل بۆ سیستەمی تر)') + '<div class="row-s">' + T('Every family member, in JSON format', 'هەموو ئەندامانی خێزان، بە شێوەی JSON') + '</div></span><span class="chev">' + i('download', 's') + '</span></button></div>' +
      '<div class="lbl">' + T('Delete account', 'سڕینەوەی ئەکاونت') + '</div><div class="card"><p class="p" style="margin:0">' + T('Deleting your account removes it from this app and signs you out on every device. The clinic keeps your medical records for the time the law requires, but you will no longer be able to see them here.', 'سڕینەوەی ئەکاونت لەم ئەپە لایدەبات و لە هەموو ئامێرەکان دەچیتە دەرەوە. کلینیک زانیارییە پزیشکییەکانت بۆ ئەو ماوەیەی یاسا داوای دەکات هەڵدەگرێت، بەڵام ئیتر لێرە نایانبینیت.') + '</p><button class="btn red lg block mt" data-a="delacct">' + i('trash', 's') + T('Delete my account', 'سڕینەوەی ئەکاونتەکەم') + '</button></div>' +
      '<p class="demo">' + T('Demo — data only lives on this phone', 'نموونەیە — زانیارییەکان تەنها لەسەر ئەم مۆبایلەن') + '</p></div>'
  });

  /* =================================================================== phase 2 */
  const aid = () => S.active || 'me';
  const isKid = () => { const a = ageOf(S.profile.dob); return a !== null && a < 13; };

  /* ----- urgent / pain ----- */
  const AREAS = [['ur', T('Upper right', 'سەرەوەی ڕاست')], ['uf', T('Upper front', 'سەرەوەی پێشەوە')], ['ul', T('Upper left', 'سەرەوەی چەپ')], ['lr', T('Lower right', 'خوارەوەی ڕاست')], ['lf', T('Lower front', 'خوارەوەی پێشەوە')], ['ll', T('Lower left', 'خوارەوەی چەپ')]];
  const SYMS = [['swellface', T('Swollen face', 'ئاوسانی ڕوخسار'), 1], ['fever', T('Fever', 'تا'), 1], ['swallow', T('Hard to open mouth or swallow', 'قورسە دەم بکەیتەوە یان قووت بدەیت'), 1], ['knocked', T('Tooth knocked out', 'ددان کەوتووە'), 1], ['bleed', T('Bleeding that will not stop', 'خوێنبەربوون کە ناوەستێت'), 1],
    ['swellgum', T('Swollen gum', 'ئاوسانی پووک'), 0], ['broken', T('Broken or chipped tooth', 'ددانی شکاو'), 0], ['lost', T('Lost filling or crown', 'پڕکردنەوە یان کراون کەوتووە'), 0], ['hotcold', T('Hurts with hot or cold', 'بە گەرم و سارد ئازاری هەیە'), 0], ['after', T('After a recent treatment', 'دوای چارەسەرێکی نوێ'), 0], ['night', T('Wakes me up at night', 'شەو بەئاگام دەهێنێتەوە'), 0]];
  let U = { area: [], level: 5, sym: [], since: 'today', note: '', photo: '' };
  function triage(u) {
    const red = u.sym.some((k) => (SYMS.find((x) => x[0] === k) || [])[2]);
    if (red || u.level >= 8) return 'red';
    if (u.level >= 5 || u.sym.length) return 'amber';
    return 'green';
  }
  function soonSlots(n) {
    const out = [], ds = allDocs().filter((d) => d.services.includes('consult'));
    for (let k = 0; k < 4 && out.length < n; k++) {
      const date = addDays(today(), k);
      ds.forEach((d) => slots(d.id, date, 30).filter((y) => y.free).slice(0, 1).forEach((y) => { if (out.length < n && !out.some((o) => o.date === date && o.time === y.t)) out.push({ date, time: y.t, doc: d.id }); }));
    }
    return out.sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)).slice(0, n);
  }
  SCREENS.urgent = (step) => {
    if (step === 'sent') {
      const u = (S.urgent || [])[0]; if (!u) { go('#/urgent', true); return null; }
      const lvl = u.tri, opts = soonSlots(3);
      const head = { red: [T('Please call us now', 'تکایە ئێستا پەیوەندیمان پێوە بکە'), T('What you described may need care today. Call the clinic so we can see you as soon as possible. If you have trouble breathing or swallowing, go to the nearest emergency department.', 'ئەوەی باست کرد لەوانەیە پێویستی بە چارەسەری ئەمڕۆ بێت. پەیوەندی بە کلینیکەوە بکە تا بە زووترین کات ببینین. ئەگەر هەناسەدان یان قووتدان قورسە، بچۆ نزیکترین فریاکەوتن.')],
        amber: [T('We will see you soon', 'بەم زووانە دەتبینین'), T('Your message is with the clinic. A member of the team will reply within 30 minutes. You can also take one of the earliest times below.', 'نامەکەت گەیشتە کلینیک. لە ماوەی ٣٠ خولەکدا وەڵامت دەدەینەوە. دەتوانیت یەکێک لەم کاتە زووانەش بگریت.')],
        green: [T('Thank you, we have your message', 'سوپاس، نامەکەت گەیشت'), T('It does not sound urgent. Pick a time that suits you, and use the guide below until then.', 'وا دیارە پەلە نییە. کاتێک هەڵبژێرە کە بۆت گونجاوە، و تا ئەوکات ئەم ڕێنماییە بەکاربهێنە.')] }[lvl];
      return {
        html: '<div class="page nobar">' + top(T('Pain or emergency', 'ئازار یان فریاکەوتن'), '', false, '<a class="ib" href="#/home">' + i('x') + '</a>') +
          '<div class="tri ' + lvl + '"><span class="tri-ic">' + i(lvl === 'red' ? 'alert' : lvl === 'amber' ? 'clock' : 'check', 'xl') + '</span><b>' + head[0] + '</b><p>' + head[1] + '</p>' + (lvl === 'red' ? '<a class="btn lg block" href="tel:' + CLINIC.phone + '">' + i('phone', 's') + T('Call ', 'پەیوەندی ') + '<span class="ltr">' + esc(CLINIC.phone) + '</span></a>' : '') + '</div>' +
          (opts.length ? '<div class="lbl">' + T('Earliest times', 'زووترین کاتەکان') + '</div>' + opts.map((o) => '<button class="svrow" data-a="ugbook" data-x="' + o.doc + '|' + o.date + '|' + o.time + '"><span class="dav">' + portrait(o.doc) + '</span><span class="grow"><div class="row-t">' + rel(o.date) + ' · ' + fTime(o.time) + '</div><div class="row-s">' + esc(doc(o.doc).name) + ' · ' + T('urgent check-up', 'پشکنینی پەلە') + '</div></span><span class="btn sm mint">' + T('Book', 'بیگرە') + '</span></button>').join('') : '') +
          '<div class="lbl">' + T('Until then', 'تا ئەوکات') + '</div><div class="card cg">' + [T('Take paracetamol or ibuprofen as written on the box (not aspirin on a bleeding area).', 'پاراسیتامۆل یان ئیبوپرۆفین وەک لەسەر قوتووەکە نووسراوە بخۆ (ئەسپرین لەسەر شوێنی خوێنبەربوو نا).'), T('Use a cold pack on the cheek for 15 minutes at a time.', 'بۆ ١٥ خولەک جارێک شتی سارد لەسەر ڕوومەت دابنێ.'), T('Avoid very hot, cold or sweet food on that side.', 'خواردنی زۆر گەرم، سارد یان شیرین لەو لایە مەخۆ.')].map((x) => '<div class="li"><span class="c blue">' + i('info', 's') + '</span><span class="grow">' + x + '</span></div>').join('') + '</div>' +
          '<a class="btn out lg block mt" href="#/learn/knocked">' + i('book', 's') + T('What to do if a tooth is knocked out', 'ئەگەر ددانێک کەوت چی بکەیت') + '</a></div>'
      };
    }
    const chip = (k, l, on, act) => '<button class="chip ' + (on ? 'on' : '') + '" data-a="' + act + '" data-x="' + k + '">' + l + '</button>';
    const face = ['😊', '🙂', '😐', '😕', '😣', '😖', '😫', '😭'][Math.min(7, Math.floor(U.level * 0.75))];
    return {
      html: '<div class="page nobar">' + top(T('Pain or emergency', 'ئازار یان فریاکەوتن'), T('Tell us what is wrong — it takes a minute', 'پێمان بڵێ چی ڕوویداوە — یەک خولەک دەخایەنێت')) +
        '<div class="note-box warn">' + i('alert', 's') + '<span>' + T('Trouble breathing, heavy bleeding or swelling that spreads to the eye or neck? Call 122 or go to the emergency department now.', 'هەناسەدانی قورس، خوێنبەربوونی زۆر یان ئاوسان کە بڵاو دەبێتەوە بۆ چاو یان مل؟ ئێستا پەیوەندی بە ١٢٢ بکە یان بچۆ فریاکەوتن.') + '</span></div>' +
        '<div class="lbl">' + T('Where does it hurt?', 'لە کوێ ئازاری هەیە؟') + '<span>' + T('your right ← → your left', 'ڕاستت ← → چەپت') + '</span></div>' +
        '<div class="mouth">' + AREAS.map(([k, l]) => '<button class="mz ' + (U.area.includes(k) ? 'on' : '') + '" data-a="ugarea" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        '<div class="lbl">' + T('How bad is the pain?', 'ئازارەکە چەندە؟') + '<span class="lvl">' + face + ' ' + N(U.level) + '/' + N(10) + '</span></div>' +
        '<input type="range" min="0" max="10" step="1" value="' + U.level + '" class="pain" data-pain style="--p:' + (U.level * 10) + '%">' +
        '<div class="row between small muted"><span>' + T('No pain', 'ئازار نییە') + '</span><span>' + T('Worst ever', 'زۆر زۆر') + '</span></div>' +
        '<div class="lbl">' + T('Anything else?', 'شتی تر؟') + '</div><div class="chips wrap">' + SYMS.map(([k, l]) => chip(k, l, U.sym.includes(k), 'ugsym')).join('') + '</div>' +
        '<div class="lbl">' + T('Since when?', 'لە کەیەوە؟') + '</div><div class="seg">' + [['today', T('Today', 'ئەمڕۆ')], ['days', T('2–3 days', '٢–٣ ڕۆژ')], ['week', T('A week or more', 'هەفتەیەک یان زیاتر')]].map(([k, l]) => '<button class="' + (U.since === k ? 'on' : '') + '" data-a="ugsince" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        '<div class="lbl">' + T('A photo helps the doctor', 'وێنەیەک یارمەتی دکتۆر دەدات') + '<span>' + T('optional', 'ئارەزوومەندانە') + '</span></div>' +
        '<label class="photo-in">' + (U.photo ? '<img src="' + U.photo + '" alt="">' : '<span class="c mint">' + i('camera') + '</span><span>' + T('Take or choose a photo', 'وێنە بگرە یان هەڵبژێرە') + '</span>') + '<input type="file" accept="image/*" capture="environment" data-ugphoto></label>' +
        '<div class="lbl">' + T('Anything we should know?', 'شتێک هەیە بیزانین؟') + '</div><textarea class="in" data-ugnote placeholder="' + T('e.g. it started after eating, I took 2 painkillers', 'بۆ نموونە: دوای نانخواردن دەستی پێکرد، ٢ حەبی ئازارم خواردووە') + '">' + esc(U.note) + '</textarea></div>' +
        '<div class="foot"><button class="btn pri lg block" data-a="ugsend">' + i('play', 's') + T('Send to the clinic', 'ناردن بۆ کلینیک') + '</button></div>',
      mount(root) {
        const r = root.querySelector('[data-pain]');
        r.addEventListener('input', () => { U.level = +r.value; r.style.setProperty('--p', (U.level * 10) + '%'); const l = root.querySelector('.lvl'); l.textContent = ['😊', '🙂', '😐', '😕', '😣', '😖', '😫', '😭'][Math.min(7, Math.floor(U.level * 0.75))] + ' ' + N(U.level) + '/' + N(10); });
        root.querySelector('[data-ugnote]').addEventListener('input', (e) => { U.note = e.target.value; });
        root.querySelector('[data-ugphoto]').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; shrinkImg(f, 520).then((d) => { U.photo = d; render(); }).catch(() => toast(T('Could not open the photo', 'وێنەکە نەکرایەوە'), 'info')); });
      }
    };
  };
  function shrinkImg(file, max) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const r = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.75)); };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('img')); };
      im.src = u;
    });
  }

  /* ----- waitlist ----- */
  const WAIT_DEMO = 20000; /* demo: an earlier time "opens" 20 s after joining */
  function wlCheck() {
    let changed = false;
    (S.waitlist || []).forEach((w) => {
      if (w.offer || Date.now() - w.at < WAIT_DEMO) return;
      const a = w.appt && S.appts.find((x) => x.id === w.appt);
      const s = svc(w.svc), ds = w.doc ? [w.doc] : allDocs().filter((d) => d.services.includes(w.svc)).map((d) => d.id);
      let best = null;
      for (let k = 1; k < 14 && !best; k++) { const date = addDays(today(), k); if (a && date >= a.date) break; ds.forEach((id) => { if (best) return; const f = slots(id, date, s.min).filter((y) => y.free && (w.pref === 'any' || (w.pref === 'eve' ? toMin(y.t) >= 17 * 60 : toMin(y.t) < 17 * 60))).pop(); if (f) best = { date, time: f.t, doc: id }; }); }
      if (!best) return;
      w.offer = Object.assign(best, { until: Date.now() + 30 * 60000 }); changed = true;
      note('clock', 'mint', T('An earlier time opened', 'کاتێکی زووتر بەتاڵ بوو'), s.name + ' · ' + rel(best.date) + ' · ' + fTime(best.time), '#/home');
      toast(T('An earlier time opened — take it on the home screen', 'کاتێکی زووتر بەتاڵ بوو — لە سەرەکی بیگرە'), 'clock');
    });
    if (changed) { save(); const p = route().path; if (['home', 'visits'].includes(p) && !sheetEl) render(); }
  }
  function wlCard(w) {
    const s = svc(w.svc), left = Math.max(0, Math.round((w.offer.until - Date.now()) / 60000));
    return '<div class="wlo"><div class="row between"><span class="badge b-mint"><i></i>' + T('Earlier time', 'کاتی زووتر') + '</span><span class="small">' + T('held for ', 'بۆت دەهێڵرێتەوە ') + N(left) + T(' min', ' خولەک') + '</span></div><b>' + rel(w.offer.date) + ' · ' + fTime(w.offer.time) + '</b><small>' + esc(s.name) + ' · ' + esc(doc(w.offer.doc).name) + '</small><div class="row mt"><button class="btn out sm grow" data-a="wlno" data-x="' + w.id + '">' + T('No thanks', 'نەخێر سوپاس') + '</button><button class="btn pri sm grow" data-a="wlyes" data-x="' + w.id + '">' + i('check', 's') + T('Take this time', 'ئەم کاتە دەگرم') + '</button></div></div>';
  }

  /* ----- patient card with QR ----- */
  let qrReady = null;
  function loadQR() { if (!qrReady) qrReady = new Promise((res, rej) => { if (window.qrcode) return res(); const s = document.createElement('script'); s.src = 'qr.js'; s.onload = () => res(); s.onerror = () => { qrReady = null; rej(new Error('qr')); }; document.head.appendChild(s); }); return qrReady; }
  function qrSvg(text) { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let p = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) p += 'M' + c + ' ' + r + 'h1v1h-1z'; return '<svg viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" aria-label="QR"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + p + '" fill="#111"/></svg>'; }
  const qrText = (p) => 'BITE:P' + p.file + ':' + (p.dob || '').replace(/-/g, '');
  SCREENS.card = () => {
    const p = S.profile;
    return {
      html: '<div class="page nobar">' + top(T('My patient card', 'کارتی نەخۆش'), T('Show it at reception', 'لە پێشوازی پیشانی بدە')) + pbar() +
        '<div class="pc"><div class="pc-top">' + ART.logo(36) + '<span class="grow"><b>' + esc(CLINIC.name) + '</b><small>' + T('Patient card', 'کارتی نەخۆش') + '</small></span><span class="pc-no">#' + N(p.file) + '</span></div>' +
        '<div class="pc-mid"><span class="pc-av">' + avatarOf({ id: aid(), name: p.name }) + '</span><span class="grow"><b>' + esc(p.name) + '</b><small>' + (p.dob ? T('Born ', 'لەدایکبوون ') + fDate(p.dob) : '') + '</small></span></div>' +
        '<div class="pc-row"><div><small>' + T('Blood', 'خوێن') + '</small><b class="ltr">' + esc(p.blood || '—') + '</b></div><div class="grow"><small>' + T('Allergies', 'هەستیاری') + '</small><b>' + (p.allergies && p.allergies.length ? esc(p.allergies.join('، ')) : T('None known', 'نییە')) + '</b></div></div></div>' +
        '<div class="qrbox" data-qr><div class="sk" style="width:200px;height:200px;border-radius:12px"></div></div>' +
        '<p class="center small muted">' + T('Reception scans this to open your file. It only holds your file number — no medical details.', 'پێشوازی ئەمە سکان دەکات تا پەڕگەکەت بکاتەوە. تەنها ژمارەی پەڕگەکەتی تێدایە — هیچ زانیارییەکی پزیشکی نا.') + '</p>' +
        '<div class="row mt"><button class="btn out lg grow" data-a="cardsave">' + i('download', 's') + T('Save image', 'پاشەکەوتکردن') + '</button><button class="btn pri lg grow" data-a="wallet">' + i('wallet', 's') + T('Add to Wallet', 'زیادکردن بۆ Wallet') + '</button></div></div>',
      mount(root) {
        loadQR().then(() => { const b = root.querySelector('[data-qr]'); if (b) b.innerHTML = qrSvg(qrText(p)); }).catch(() => { const b = root.querySelector('[data-qr]'); if (b) b.innerHTML = '<p class="small muted center">' + T('Connect to the internet once to show the code.', 'جارێک بە ئینتەرنێتەوە بیکەرەوە تا کۆدەکە دەربکەوێت.') + '</p>'; });
      }
    };
  };

  /* ----- health library ----- */
  const LV = { cat: 'all' };
  const libCard = (a, wide) => '<a class="lc' + (wide ? ' wide' : '') + '" href="#/learn/' + a.id + '"><span class="lc-art' + (a.photo ? ' ph' : '') + '"' + (a.photo ? ' style="background-image:url(' + a.photo + ')"' : '') + '>' + (a.photo ? '' : ART.tooth(a.art || 'clean')) + '</span><span class="lc-tx"><small>' + esc(libCat(a.cat)) + ' · ' + N(a.mins || 2) + T(' min read', ' خولەک خوێندنەوە') + '</small><b>' + esc(P(a.title)) + '</b></span></a>';
  const libCat = (k) => { const c = DATA.LIB_CATS.find((x) => x[0] === k); return c ? T(c[1], c[2], c[3] || undefined) : ''; };
  SCREENS.learn = (id) => {
    const L = DATA.LIBRARY.filter((a) => !a.off);
    if (id) {
      const a = L.find((x) => x.id === id); if (!a) { go('#/learn', true); return null; }
      const more = L.filter((x) => x.id !== id && x.cat === a.cat).concat(L.filter((x) => x.id !== id && x.cat !== a.cat)).slice(0, 2);
      return {
        html: '<div class="page nobar">' + top('', '') + '<div class="art-hero' + (a.photo ? ' ph' : '') + '"' + (a.photo ? ' style="background-image:url(' + a.photo + ')"' : '') + '>' + (a.photo ? '' : ART.tooth(a.art || 'clean')) + '</div>' +
          '<small class="muted">' + esc(libCat(a.cat)) + ' · ' + N(a.mins || 2) + T(' min read', ' خولەک خوێندنەوە') + '</small><h1 class="h2" style="margin:4px 0 10px">' + esc(P(a.title)) + '</h1>' +
          '<div class="article">' + (a.body || []).map((x) => { const t = P(x) || ''; return t.startsWith('• ') ? '<p class="bl">' + esc(t.slice(2)) + '</p>' : '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
          (a.cat === 'emergency' ? '<a class="btn pri lg block mt" href="tel:' + CLINIC.phone + '">' + i('phone', 's') + T('Call the clinic', 'پەیوەندی بە کلینیکەوە') + '</a>' : '<a class="btn soft lg block mt" href="#/book">' + i('calendar', 's') + T('Book a visit', 'نۆرە بگرە') + '</a>') +
          (more.length ? '<div class="lbl">' + T('Read next', 'دواتر بخوێنەوە') + '</div>' + more.map((x) => libCard(x, true)).join('') : '') + '</div>'
      };
    }
    const list = L.filter((a) => LV.cat === 'all' || a.cat === LV.cat);
    return {
      html: '<div class="page">' + top(T('Healthy smile', 'بزەی تەندروست'), T('Short guides from our doctors', 'ڕێنمایی کورت لە دکتۆرەکانمانەوە')) +
        '<div class="chips">' + [['all', T('All', 'هەموو')]].concat(DATA.LIB_CATS.filter((c) => L.some((a) => a.cat === c[0])).map((c) => [c[0], T(c[1], c[2], c[3] || undefined)])).map(([k, l]) => '<button class="chip ' + (LV.cat === k ? 'on' : '') + '" data-a="lcat" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        list.map((a) => libCard(a, true)).join('') + '</div>' + tabbar('')
    };
  };

  /* ----- refer a friend ----- */
  const refCode = () => { const me = S.active && S.active !== 'me' ? (S.members.find((m) => m.id === 'me') || {}).profile : S.profile; return 'BITE-' + ((me || S.profile).file); };
  SCREENS.refer = () => {
    const R = DATA.REFERRAL, code = refCode(), rf = S.refer || { sent: 0, friends: [] };
    if (!S.refer) { S.refer = rf; }
    const msg = T('I use Bite for Dentistry and I recommend it. Use my code ' + code + ' and get ' + R.pct + '% off your first visit: ', 'من Bite for Dentistry بەکاردەهێنم و پێشنیاری دەکەم. کۆدەکەم ' + code + ' بەکاربهێنە و ' + R.pct + '٪ داشکاندن لە یەکەم سەردانت وەربگرە: ', 'أستخدم Bite for Dentistry وأنصحك به. استخدم رمزي ' + code + ' واحصل على خصم ' + N(R.pct) + '٪ على زيارتك الأولى: ') + location.href.split('#')[0];
    const earned = rf.friends.filter((f) => f.came).length;
    return {
      html: '<div class="page nobar">' + top(T('Invite a friend', 'هاوڕێیەک بانگهێشت بکە'), '') +
        '<div class="rf"><span class="rf-ic">' + i('gift', 'xl') + '</span><b>' + T('Give ' + R.pct + '%, get ' + R.pct + '%', N(R.pct) + '٪ بدە، ' + N(R.pct) + '٪ وەربگرە', 'امنح ' + N(R.pct) + '٪ واحصل على ' + N(R.pct) + '٪') + '</b><p>' + esc(P(R.note)) + '</p>' +
        '<div class="rf-code"><span class="ltr">' + code + '</span><button data-a="refcopy" data-x="' + code + '">' + i('copy', 's') + T('Copy', 'کۆپی') + '</button></div></div>' +
        '<div class="row mt"><a class="btn wa lg grow" target="_blank" rel="noopener" data-a="refsent" href="https://wa.me/?text=' + encodeURIComponent(msg) + '">' + i('whatsapp', 's') + 'WhatsApp</a><button class="btn out lg grow" data-a="refshare">' + i('share', 's') + T('Share', 'ناردن') + '</button></div>' +
        '<div class="stats" style="margin-top:16px">' + [['users', 'mint', N(rf.sent), T('invited', 'بانگهێشتکراو')], ['check', 'blue', N(rf.friends.length), T('joined', 'هاتن')], ['gift', 'amber', N(earned * R.pct) + '٪', T('your reward', 'خەڵاتەکەت')]].map(([ic, c, v, l]) => '<div class="stat"><span class="c ' + c + '">' + i(ic, 's') + '</span><b>' + v + '</b><small>' + l + '</small></div>').join('') + '</div>' +
        (rf.friends.length ? '<div class="lbl">' + T('Your friends', 'هاوڕێکانت') + '</div><div class="card" style="padding:4px 14px">' + rf.friends.map((f) => '<div class="toggle"><span class="grow"><div class="row-t">' + esc(P(f.name)) + '</div><div class="row-s">' + (f.came ? T('Came for a visit · your discount is ready', 'سەردانی کرد · داشکاندنەکەت ئامادەیە') : T('Signed up · waiting for the first visit', 'خۆی تۆمار کرد · چاوەڕێی یەکەم سەردانە')) + '</div></span>' + (f.came ? '<span class="badge b-mint">' + N(R.pct) + '٪</span>' : '<span class="badge b-gray">' + T('Waiting', 'چاوەڕێ') + '</span>') + '</div>').join('') + '</div>' : '') +
        '<p class="small muted mt">' + T('Discounts are applied at reception and cannot be exchanged for cash. One reward per new patient.', 'داشکاندن لە پێشوازی جێبەجێ دەکرێت و ناگۆڕدرێتەوە بە پارە. بۆ هەر نەخۆشێکی نوێ یەک خەڵات.') + '</p></div>'
    };
  };

  /* ----- kids: brushing game ----- */
  const ZONES = [['ur', T('Top teeth, right side', 'ددانەکانی سەرەوە، لای ڕاست')], ['ul', T('Top teeth, left side', 'ددانەکانی سەرەوە، لای چەپ')], ['ll', T('Bottom teeth, left side', 'ددانەکانی خوارەوە، لای چەپ')], ['lr', T('Bottom teeth, right side', 'ددانەکانی خوارەوە، لای ڕاست')]];
  const brushOf = (id) => ((S.brush || {})[id || aid()]) || {};
  function streak(id) { const b = brushOf(id); let n = 0; for (let k = 0; k < 400; k++) { const d = addDays(today(), -k); if (b[d]) n++; else if (k > 0) break; } return n; }
  const totalStars = (id) => Object.values(brushOf(id)).reduce((s, v) => s + v, 0);
  const BADGES = [[3, T('3 days in a row', '٣ ڕۆژ لە دوای یەک'), 'smile'], [7, T('One whole week', 'هەفتەیەکی تەواو'), 'star'], [30, T('Brushing champion', 'پاڵەوانی ددانشۆردن'), 'trophy']];
  function brushCard() {
    const b = brushOf(), t = b[today()] || 0, st = streak();
    return '<div class="kb"><div class="kb-art">' + ART.tooth('kid') + '</div><div class="grow"><b>' + T(firstName(S.profile.name) + '’s brushing', 'ددانشۆردنی ' + firstName(S.profile.name), 'تفريش أسنان ' + firstName(S.profile.name)) + '</b><div class="kb-stars">' + [0, 1].map((k) => '<span class="' + (k < t ? 'on' : '') + '">' + (k ? '🌙' : '☀️') + '</span>').join('') + '<small>' + (t >= 2 ? T('Done for today!', 'ئەمڕۆ تەواو!') : T(t ? 'One more tonight' : 'Morning and night', t ? 'یەکێکی تر ئەمشەو' : 'بەیانی و شەو', (t ? 'مرة أخرى الليلة' : 'صباحاً ومساءً'))) + '</small></div><small>🔥 ' + N(st) + T(' days in a row', ' ڕۆژ لە دوای یەک') + ' · ⭐ ' + N(totalStars()) + '</small></div><a class="btn pri sm" href="#/brush">' + i('play', 's') + T('Start', 'دەستپێکردن') + '</a></div>';
  }
  let BR = null;
  SCREENS.brush = () => {
    const tot = totalStars(), st = streak();
    if (BR && BR.done) {
      return { html: '<div class="page nobar brushpg"><div class="br-done"><div class="burst">' + Array.from({ length: 12 }, (x, k) => '<i style="--a:' + (k * 30) + 'deg"></i>').join('') + '<span>⭐</span></div><h1>' + T('Amazing, ' + firstName(S.profile.name) + '!', 'ئافەرین ' + firstName(S.profile.name) + '!', 'رائع يا ' + firstName(S.profile.name) + '!') + '</h1><p>' + T('Two minutes of brushing. Your teeth are sparkling.', 'دوو خولەک ددانشۆردن. ددانەکانت دەدرەوشێنەوە.') + '</p><div class="br-sum"><span>⭐ ' + N(tot) + '</span><span>🔥 ' + N(st) + T(' days', ' ڕۆژ') + '</span></div>' + (BR.badge ? '<div class="br-badge">' + i('trophy', 'l') + '<span>' + T('New badge: ', 'باجی نوێ: ') + esc(BR.badge) + '</span></div>' : '') + '<a class="btn pri lg block" href="#/home" data-a="brushend">' + T('Done', 'تەواو') + '</a></div></div>' };
    }
    if (BR && BR.on !== undefined) {
      const sec = BR.left, z = Math.min(3, Math.floor((120 - sec) / 30)), pct = (120 - sec) / 120;
      return {
        html: '<div class="page nobar brushpg"><div class="br-top"><button class="ib" data-a="brushstop">' + i('x') + '</button><span class="grow center"><b>' + T('Brush with ', 'ددان بشۆ لەگەڵ ') + firstName(S.profile.name) + '</b></span><span style="width:42px"></span></div>' +
          '<div class="br-ring" style="--p:' + (pct * 100) + '%"><div class="br-tooth' + (BR.on ? ' go' : '') + '">' + ART.tooth('kid') + '</div></div>' +
          '<div class="br-time" data-brt>' + N(Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0')) + '</div>' +
          '<div class="br-mouth">' + ZONES.map(([k], j) => '<i class="' + k + (j === z ? ' on' : j < z ? ' done' : '') + '"></i>').join('') + '</div>' +
          '<div class="br-zone" data-brz>' + ZONES[z][1] + '</div><p class="center small muted">' + T('Small circles, gently, on every tooth', 'بازنەی بچووک، بە نەرمی، لەسەر هەموو ددانێک') + '</p>' +
          '<button class="btn ' + (BR.on ? 'out' : 'pri') + ' lg block mt" data-a="brushpause">' + i(BR.on ? 'pause' : 'play', 's') + (BR.on ? T('Pause', 'وەستان') : T('Go!', 'دەست پێ بکە!')) + '</button></div>'
      };
    }
    return {
      html: '<div class="page nobar brushpg">' + top(T('Brushing time', 'کاتی ددانشۆردن'), firstName(S.profile.name)) +
        '<div class="br-intro"><div class="br-tooth go">' + ART.tooth('kid') + '</div><h1>' + T('2 minutes, 4 corners', '٢ خولەک، ٤ گۆشە') + '</h1><p>' + T('The tooth will show you where to brush. Every time you finish you get a star.', 'ددانەکە پیشانت دەدات لە کوێ بشۆیت. هەر جارێک تەواوی بکەیت ئەستێرەیەک وەردەگریت.') + '</p></div>' +
        '<div class="stats">' + [['⭐', N(tot), T('stars', 'ئەستێرە')], ['🔥', N(st), T('days in a row', 'ڕۆژ لە دوای یەک')], ['🏆', N(BADGES.filter((x) => tot >= x[0] || st >= x[0]).length), T('badges', 'باج')]].map(([e, v, l]) => '<div class="stat"><span style="font-size:20px">' + e + '</span><b>' + v + '</b><small>' + l + '</small></div>').join('') + '</div>' +
        '<div class="lbl">' + T('Badges', 'باجەکان') + '</div><div class="badges">' + BADGES.map(([n, l, ic]) => { const got = tot >= n || st >= n; return '<div class="bdg' + (got ? ' got' : '') + '"><span>' + i(ic, 'l') + '</span><small>' + l + '</small></div>'; }).join('') + '</div>' +
        '<div class="lbl">' + T('Last 7 days', '٧ ڕۆژی ڕابردوو') + '</div><div class="week">' + Array.from({ length: 7 }, (x, k) => { const d = addDays(today(), k - 6), v = brushOf()[d] || 0; return '<div><small>' + DAYS[dow(d)] + '</small><span>' + (v >= 2 ? '⭐⭐' : v ? '⭐' : '·') + '</span></div>'; }).join('') + '</div></div>' +
        '<div class="foot"><button class="btn pri lg block" data-a="brushgo">' + i('play', 's') + T('Start brushing', 'دەستپێکردنی ددانشۆردن') + '</button></div>'
    };
  };
  let brushT = null;
  function brushTick() {
    clearInterval(brushT);
    brushT = setInterval(() => {
      if (!BR || !BR.on) return;
      if (route().path !== 'brush') { BR.on = false; return; }
      BR.left -= 1;
      const z0 = Math.floor((120 - BR.left - 1) / 30), z1 = Math.floor((120 - BR.left) / 30);
      if (BR.left <= 0) {
        clearInterval(brushT); S.brush = S.brush || {}; const id = aid(); S.brush[id] = S.brush[id] || {};
        const before = totalStars(id), bst = streak(id);
        S.brush[id][today()] = Math.min(2, (S.brush[id][today()] || 0) + 1);
        const after = totalStars(id), ast = streak(id);
        const nb = BADGES.find((x) => (before < x[0] && after >= x[0]) || (bst < x[0] && ast >= x[0]));
        BR = { done: true, badge: nb ? nb[1] : '' }; save(); chime(3); render(); return;
      }
      if (z1 !== z0 && z1 < 4) chime(1);
      const el = app().querySelector('[data-brt]');
      if (el && z1 === z0) { el.textContent = N(Math.floor(BR.left / 60) + ':' + String(BR.left % 60).padStart(2, '0')); const r = app().querySelector('.br-ring'); if (r) r.style.setProperty('--p', ((120 - BR.left) / 120 * 100) + '%'); }
      else render();
    }, window.__brushTick || 1000);
  }
  function chime(n) { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = chime.c || (chime.c = new C()); for (let k = 0; k < n; k++) { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 660 + k * 220; g.gain.setValueAtTime(0.15, c.currentTime + k * 0.18); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + k * 0.18 + 0.3); o.connect(g); g.connect(c.destination); o.start(c.currentTime + k * 0.18); o.stop(c.currentTime + k * 0.18 + 0.32); } } catch (e) { /* no sound */ } }

  /* ----- braces & aligners ----- */
  const alOf = () => (S.aligner || {})[aid()];
  const outToday = (al) => { const m = (al.outLog || {})[today()] || 0; return m + (al.out ? Math.max(0, Math.round((Date.now() - al.out) / 60000)) : 0); };
  const hm = (m) => (m >= 60 ? N(Math.floor(m / 60)) + T(' h ', ' کاتژمێر ') : '') + N(m % 60) + T(' min', ' خولەک');
  function alCard() {
    const al = alOf(); if (!al) return '';
    const left = al.every - diff(today(), al.since), om = outToday(al), goal = 120, pct = Math.min(100, Math.round(om / goal * 100));
    return '<div class="al"><div class="row between"><span class="small muted">' + T('Clear aligners', 'ئەلاینەری ڕوون') + '</span><a class="lnk" href="#/aligner">' + T('Details', 'وردەکاری') + '</a></div>' +
      '<div class="al-row"><div class="al-tray"><b>' + N(al.tray) + '</b><small>' + T('of ', 'لە ') + N(al.total) + '</small></div><div class="grow"><b>' + (left <= 0 ? T('Time to change your tray', 'کاتی گۆڕینی قاڵبەکەتە') : T('Change tray in ' + left + (left === 1 ? ' day' : ' days'), 'گۆڕینی قاڵب دوای ' + N(left) + ' ڕۆژ', 'تغيير القالب بعد ' + N(left) + (left === 1 ? ' يوم' : ' أيام'))) + '</b><div class="bar"><i style="width:' + Math.round(al.tray / al.total * 100) + '%"></i></div><small>' + T('Out today: ', 'ئەمڕۆ لاتبردووە: ') + hm(om) + T(' · aim for under 2 h', ' · ئامانج: کەمتر لە ٢ کاتژمێر') + '</small><div class="bar thin' + (pct >= 100 ? ' over' : '') + '"><i style="width:' + pct + '%"></i></div></div></div>' +
      '<div class="row mt">' + (left <= 0 ? '<button class="btn soft sm grow" data-a="altray">' + i('refresh', 's') + T('I changed it', 'گۆڕیم') + '</button>' : '') + (al.out ? '<button class="btn pri sm grow" data-a="alin">' + i('check', 's') + T('Aligners back in', 'لەبەرم کردەوە') + '<span class="small" data-alt> · ' + hm(Math.round((Date.now() - al.out) / 60000)) + '</span></button>' : '<button class="btn out sm grow" data-a="alout">' + i('pause', 's') + T('Taking them out to eat', 'لامبرد بۆ نانخواردن') + '</button>') + '</div></div>';
  }
  SCREENS.aligner = () => {
    const al = alOf(); if (!al) { go('#/home', true); return null; }
    const days = Array.from({ length: 7 }, (x, k) => addDays(today(), k - 6));
    const max = Math.max(150, ...days.map((d) => (d === today() ? outToday(al) : (al.outLog || {})[d] || 0)));
    return {
      html: '<div class="page nobar">' + top(T('My aligners', 'ئەلاینەرەکانم'), esc(doc('d3').name)) + alCard() +
        '<div class="lbl">' + T('Time out of the mouth', 'ئەو کاتەی لە دەمدا نەبووە') + '<span>' + T('last 7 days', '٧ ڕۆژی ڕابردوو') + '</span></div><div class="card"><div class="chart7" style="--l:' + (120 / max * 100).toFixed(1) + '%">' + days.map((d) => { const v = d === today() ? outToday(al) : (al.outLog || {})[d] || 0; return '<div><span style="height:' + Math.max(3, Math.round(v / max * 100)) + '%" class="' + (v > 120 ? 'over' : '') + '"></span><small>' + DAYS[dow(d)] + '</small></div>'; }).join('') + '</div><div class="small muted">' + T('The dashed line is 2 hours. Wearing them 22 hours a day keeps your treatment on time.', 'هێڵە پچڕپچڕەکە ٢ کاتژمێرە. ڕۆژانە ٢٢ کاتژمێر لەبەرکردنیان چارەسەرەکەت لە کاتی خۆیدا تەواو دەکات.') + '</div></div>' +
        '<div class="lbl">' + T('Tips', 'ئامۆژگاری') + '</div><div class="card cg">' + [T('Brush your teeth before putting the aligners back in.', 'پێش لەبەرکردنەوەی ئەلاینەر ددانەکانت بشۆ.'), T('Only drink water while wearing them.', 'لە کاتی لەبەرکردنیاندا تەنها ئاو بخۆرەوە.'), T('Keep the old tray in its case in case the new one breaks.', 'قاڵبە کۆنەکە لە قوتووەکەیدا هەڵبگرە بۆ ئەوەی ئەگەر نوێیەکە شکا.')].map((x) => '<div class="li"><span class="c mint">' + i('check', 's') + '</span><span class="grow">' + x + '</span></div>').join('') + '</div></div>'
    };
  };
  setInterval(() => {
    const al = alOf();
    if (al && al.out) {
      const m = Math.round((Date.now() - al.out) / 60000), lim = window.__alLimit != null ? window.__alLimit : 30;
      if (m >= lim && !al.nagged) { al.nagged = true; save(); note('alert', 'amber', T('Aligners out for ' + m + ' min', 'ئەلاینەر ' + m + ' خولەکە لاتبردووە', 'التقويم خارج الفم منذ ' + N(m) + ' دقيقة'), T('Remember to put them back in', 'بیرت نەچێت لەبەریان بکەیتەوە'), '#/aligner'); toast(T('Time to put your aligners back in', 'کاتی لەبەرکردنەوەی ئەلاینەرەکەتە'), 'alert'); if (navigator.vibrate) navigator.vibrate(200); }
      const el = app().querySelector('[data-alt]'); if (el) el.textContent = ' · ' + hm(m);
    }
    wlCheck();
  }, 5000);

  /* =================================================================== phase 3 */
  const lsGet = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  /* ----- search everything ----- */
  const norm = (s) => String(s || '').toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ة/g, 'ە').replace(/ھ/g, 'ه').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, ' ').trim();
  const QV = { q: '' };
  function searchAll(q) {
    const n = norm(q); if (n.length < 2) return [];
    const words = n.split(' ');
    const ALIAS = { 'كليندامايسين': 'clindamycin', 'ايبوبروفين': 'ibuprofen', 'باراسيتامول': 'paracetamol', 'كلورهيكسيدين': 'chlorhexidine', 'فلورايد': 'fluoride', 'اسبرين': 'aspirin', 'کلیندامایسین': 'clindamycin', 'کلیندا': 'clindamycin', 'ئەمۆکسیسیلین': 'amoxicillin', 'ئیبوپرۆفین': 'ibuprofen', 'بروفین': 'ibuprofen', 'پاراسیتامۆل': 'paracetamol', 'کلۆرهێکسیدین': 'chlorhexidine', 'فلۆراید': 'fluoride', 'ئەسپرین': 'aspirin' };
    const alt = (w) => { if (w.length < 3) return null; const k = Object.keys(ALIAS).find((x) => norm(x).startsWith(w) || w.startsWith(norm(x))); return k ? ALIAS[k].slice(0, Math.max(4, Math.min(ALIAS[k].length, w.length))) : null; };
    const hit = (...xs) => { const h = norm(xs.concat(AR ? xs.map((x) => arT(String(x))) : []).join(' ')); return words.every((w) => h.includes(w) || (alt(w) && h.includes(alt(w)))); };
    const out = [];
    const add = (group, ic, c, t, s, href, act) => out.push({ group, ic, c, t, s, href, act });
    DOCTORS.filter((d) => !d.hidden).forEach((d) => { if (hit(d.en, d.ku, P(d.spec), d.spec.join(' '))) add('doc', 'user', 'mint', T(d.en, d.ku, d.ar || undefined), P(d.spec), '#/doctor/' + d.id); });
    SERVICES.filter((s) => !s[9]).forEach((s) => { const v = svc(s[0]); if (hit(s[1], s[2], s[7], s[8])) add('svc', 'tooth', 'blue', v.name, T('from ', 'لە ') + money(v.price) + ' · ' + N(v.min) + T(' min', ' خولەک'), '#/service/' + v.id); });
    S.appts.forEach((a) => { const v = svc(a.svc), d = doc(a.doc); if (hit(v.name, d.name, fDate(a.date), MONF[dt(a.date).getMonth()], reasonOf(a), a.date)) add('visit', 'calendar', 'navy', v.name, fDate(a.date) + ' · ' + d.sn, '#/visits'); });
    S.rx.forEach((r) => { if (hit(r.meds.map((m) => m.n + ' ' + m.d).join(' '), doc(r.doc).name, T('prescription', 'ڕەچەتە'))) add('rx', 'pill', 'blue', r.meds.map((m) => m.n.split(' ')[0]).join(' · '), fDate(r.date) + ' · ' + doc(r.doc).sn, null, ['rx', r.id]); });
    S.invoices.forEach((v) => { if (hit(v.id, v.items.map((x) => x[0]).join(' '), T('bill invoice', 'پسوولە پارە'), AR ? 'فاتورة دفع قسط أقساط' : '')) add('bill', 'receipt', 'amber', v.id, fDate(v.date) + ' · ' + money(v.total), null, ['inv', v.id]); });
    S.xrays.forEach((x) => { if (hit(x.title, T('x-ray', 'تیشک'))) add('xray', 'image', 'purple', x.title, fDate(x.date), null, ['xray', x.id]); });
    DATA.LIBRARY.filter((a) => !a.off).forEach((a) => { if (hit(a.title.join(' '), P(a.title), (a.body || []).map((x) => x.join(' ') + ' ' + P(x)).join(' '))) add('guide', 'book', 'mint', P(a.title), libCat(a.cat), '#/learn/' + a.id); });
    Object.keys(DATA.AFTERCARE).forEach((k) => { const g = DATA.AFTERCARE[k]; if (hit(g.title.join(' '), P(g.title), ['normal', 'do', 'avoid', 'call'].map((s) => (g[s] || []).map((x) => x.join(' ') + ' ' + P(x)).join(' ')).join(' '))) add('guide', 'heart', 'red', P(g.title), T('Aftercare guide', 'ڕێنمایی دوای چارەسەر'), '#/care/' + k); });
    DATA.FAQ.forEach((f, j) => { if (hit(f.q.join(' '), f.a.join(' '), P(f.q), P(f.a))) add('help', 'help', 'amber', P(f.q), T('Help', 'یارمەتی'), '#/help?open=' + j); });
    [[['pay', 'payment', 'wallet', 'پارە', 'قیست'], 'wallet', T('Pay a bill', 'پارەدان'), '#/file?tab=bills'], [['card', 'qr', 'کارت'], 'qr', T('My patient card', 'کارتی نەخۆش'), '#/card'], [['family', 'child', 'خێزان', 'منداڵ'], 'users', T('Family members', 'ئەندامانی خێزان'), '#/family'], [['pain', 'emergency', 'urgent', 'ئازار', 'فریا'], 'alert', T('Pain or emergency', 'ئازار یان فریاکەوتن'), '#/urgent'], [['privacy', 'terms', 'تایبەت', 'یاسا', 'مەرج'], 'shield', T('Privacy & terms', 'تایبەتمەندی و مەرجەکان'), '#/legal'], [['dark', 'theme', 'size', 'font', 'تاریک', 'نووسین'], 'settings', T('Appearance & text size', 'ڕووکار و قەبارەی نووسین'), '#/profile'], [['friend', 'invite', 'refer', 'هاوڕێ', 'بانگهێشت'], 'gift', T('Invite a friend', 'هاوڕێیەک بانگهێشت بکە'), '#/refer']].forEach(([keys, ic, t, href]) => { if (keys.some((k) => norm(k).startsWith(words[0]) || words[0].startsWith(norm(k)))) add('go', ic, 'navy', t, T('Open', 'کردنەوە'), href); });
    return out.slice(0, 40);
  }
  const GROUPS = { go: T('Go to', 'بڕۆ بۆ'), doc: T('Doctors', 'دکتۆرەکان'), svc: T('Treatments', 'چارەسەرەکان'), visit: T('My visits', 'نۆرەکانم'), rx: T('Prescriptions', 'ڕەچەتەکان'), xray: T('X-rays', 'تیشکەکان'), bill: T('Bills', 'پسوولەکان'), guide: T('Guides', 'ڕێنماییەکان'), help: T('Help', 'یارمەتی') };
  function markHit(text, q) {
    const t = esc(text), words = norm(q).split(' ').filter((w) => w.length > 1);
    let res = t; words.forEach((w) => { const i0 = norm(text).indexOf(w); if (i0 >= 0 && norm(text).length === String(text).toLowerCase().length) { const raw = String(text).substr(i0, w.length); res = res.replace(esc(raw), '<mark>' + esc(raw) + '</mark>'); } });
    return res;
  }
  function searchResults() {
    const q = QV.q, list = searchAll(q);
    if (norm(q).length < 2) return '<div class="lbl">' + T('Try', 'تاقی بکەرەوە') + '</div><div class="chips wrap">' + [T('Whitening price', 'نرخی سپیکردنەوە'), T('Clindamycin', 'کلیندا'), firstName(T(DOCTORS[0].en.replace('Dr. ', ''), DOCTORS[0].ku.replace('د. ', ''), arT(DOCTORS[0].en).replace('د. ', ''))), T('Pain', 'ئازار'), T('Instalments', 'قیست'), T('Kids', 'منداڵان')].map((x) => '<button class="chip" data-a="sq" data-x="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div>';
    if (!list.length) return '<div class="empty">' + i('search', 'xl') + '<div class="mt">' + T('Nothing found for “' + q + '”', 'هیچ شتێک نەدۆزرایەوە بۆ «' + q + '»', 'لا توجد نتائج لـ «' + q + '»') + '</div><a class="btn soft sm mt" href="#/chat">' + i('message', 's') + T('Ask the clinic', 'لە کلینیک بپرسە') + '</a></div>';
    let html = '', last = '';
    list.forEach((r) => {
      if (r.group !== last) { html += '<div class="lbl">' + GROUPS[r.group] + '</div>'; last = r.group; }
      const inner = '<span class="c ' + r.c + '">' + i(r.ic, 's') + '</span><span class="grow"><div class="row-t">' + markHit(r.t, q) + '</div><div class="row-s">' + esc(r.s) + '</div></span><span class="chev">' + i(FWD, 's') + '</span>';
      html += r.href ? '<a class="sr" href="' + r.href + '">' + inner + '</a>' : '<button class="sr" data-a="' + r.act[0] + '" data-x="' + r.act[1] + '">' + inner + '</button>';
    });
    return '<div class="small muted" style="margin-top:6px">' + N(list.length) + T(' results', ' ئەنجام') + '</div>' + html;
  }
  SCREENS.search = () => ({
    html: '<div class="page nobar">' + '<div class="top"><button class="ib" data-a="back" aria-label="back">' + i(BACK) + '</button><label class="search sbig grow">' + i('search', 's') + '<input data-sq placeholder="' + T('Search doctors, treatments, medicines…', 'گەڕان بۆ دکتۆر، چارەسەر، دەرمان…') + '" value="' + esc(QV.q) + '" autocomplete="off" enterkeyhint="search"></label></div>' +
      '<div data-sres>' + searchResults() + '</div></div>',
    mount(root) {
      const inp = root.querySelector('[data-sq]'), box = root.querySelector('[data-sres]');
      inp.addEventListener('input', () => { QV.q = inp.value; box.innerHTML = searchResults(); });
      setTimeout(() => { inp.focus(); const v = inp.value; inp.value = ''; inp.value = v; }, 60);
    }
  });

  /* ----- help & FAQ ----- */
  SCREENS.help = (x, q) => {
    const open = q.open !== undefined ? +q.open : -1;
    return {
      html: '<div class="page nobar">' + top(T('Help', 'یارمەتی'), T('Answers to common questions', 'وەڵامی پرسیارە باوەکان')) +
        '<a class="search" href="#/search">' + i('search', 's') + '<span class="muted">' + T('Search help and the app', 'گەڕان لە یارمەتی و ئەپەکەدا') + '</span></a>' +
        DATA.FAQ_CATS.map((c) => { const items = DATA.FAQ.map((f, j) => [f, j]).filter(([f]) => f.cat === c[0]); return items.length ? '<div class="lbl">' + T(c[1], c[2], c[3] || undefined) + '</div><div class="faq">' + items.map(([f, j]) => '<details' + (j === open ? ' open' : '') + ' id="f' + j + '"><summary>' + esc(P(f.q)) + '<span class="chev">' + i('chevD', 's') + '</span></summary><p>' + esc(P(f.a)) + '</p></details>').join('') + '</div>' : ''; }).join('') +
        '<div class="lbl">' + T('Still need help?', 'هێشتا یارمەتیت پێویستە؟') + '</div><div class="menu">' +
        '<a href="#/chat"><span class="c purple" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('message', 's') + '</span><span class="grow">' + T('Chat with reception', 'چات لەگەڵ پێشوازی') + '<div class="row-s">' + T('Usually replies within minutes', 'بە زۆری لە چەند خولەکێکدا وەڵام دەداتەوە') + '</div></span><span class="chev">' + i(FWD, 's') + '</span></a>' +
        '<a href="tel:' + CLINIC.phone + '"><span class="c navy" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('phone', 's') + '</span><span class="grow">' + T('Call the clinic', 'پەیوەندی بە کلینیکەوە') + '<div class="row-s">' + esc(P(CLINIC.hours)) + '</div></span><span class="chev">' + i(FWD, 's') + '</span></a>' +
        '<a href="#/legal"><span class="c blue" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center">' + i('shield', 's') + '</span><span class="grow">' + T('Privacy & terms', 'تایبەتمەندی و مەرجەکان') + '</span><span class="chev">' + i(FWD, 's') + '</span></a></div></div>',
      mount(root) { if (open >= 0) { const el = root.querySelector('#f' + open); if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 50); } }
    };
  };

  /* ----- privacy & terms ----- */
  SCREENS.legal = (x, q) => {
    const t = q.t === 'terms' ? 'terms' : 'privacy', L = DATA.LEGAL;
    return {
      html: '<div class="page nobar">' + top(T('Privacy & terms', 'تایبەتمەندی و مەرجەکان'), T('Last updated ', 'دوایین نوێکردنەوە ') + fDate(L.updated)) +
        '<div class="seg">' + [['privacy', T('Privacy', 'تایبەتمەندی')], ['terms', T('Terms of use', 'مەرجەکانی بەکارهێنان')]].map(([k, l]) => '<button class="' + (k === t ? 'on' : '') + '" data-a="legal" data-x="' + k + '">' + l + '</button>').join('') + '</div>' +
        '<div class="card article" style="padding:16px">' + (L[t] || []).map((p) => { const s = P(p) || ''; return s.startsWith('• ') ? '<p class="bl">' + esc(s.slice(2)) + '</p>' : '<p>' + esc(s) + '</p>'; }).join('') + '</div>' +
        '<p class="demo">' + T('Draft for the demo — to be reviewed by a lawyer before launch', 'ڕەشنووسە بۆ نموونە — پێش بڵاوکردنەوە پارێزەر سەیری بکات') + '</p></div>'
    };
  };

  /* ----- skeleton while the app "loads" its data on a cold start ----- */
  function skeleton() {
    const b = (w, h, r) => '<div class="sk" style="width:' + w + ';height:' + h + 'px;border-radius:' + (r || 12) + 'px"></div>';
    return '<div class="page skel"><div class="row" style="gap:12px">' + b('46px', 46, 15) + '<div class="grow">' + b('40%', 10, 6) + '<div style="height:6px"></div>' + b('60%', 16, 6) + '</div>' + b('42px', 42, 13) + b('42px', 42, 13) + '</div>' +
      '<div style="height:16px"></div>' + b('100%', 170, 24) + '<div style="height:14px"></div>' + b('100%', 92, 18) + '<div style="height:14px"></div><div class="row" style="gap:12px">' + b('50%', 150, 22) + b('50%', 150, 22) + '</div><div style="height:12px"></div><div class="row" style="gap:12px">' + b('50%', 150, 22) + b('50%', 150, 22) + '</div></div>';
  }

  /* ----- offline ----- */
  function netBar() {
    let bar = document.querySelector('.netbar');
    if (navigator.onLine) { if (bar) { bar.classList.add('back'); bar.textContent = T('Back online', 'ئینتەرنێت گەڕایەوە'); setTimeout(() => bar.remove(), 1600); } return; }
    if (!bar) { bar = document.createElement('div'); bar.className = 'netbar'; document.body.appendChild(bar); }
    bar.classList.remove('back'); bar.innerHTML = i('offline', 's') + T('You are offline — showing what is saved on this phone', 'ئینتەرنێتت نییە — ئەوەی لەسەر ئەم مۆبایلە پاشەکەوت کراوە پیشان دەدرێت');
  }
  window.addEventListener('online', netBar); window.addEventListener('offline', netBar);
  const needNet = () => { if (navigator.onLine) return false; toast(T('This needs internet — please try again when you are online', 'ئەمە پێویستی بە ئینتەرنێتە — کە ئینتەرنێتت هەبوو دووبارە هەوڵ بدەرەوە'), 'offline'); return true; };

  /* =================================================================== medicine reminders */
  const DEF_TIMES = { 1: ['09:00'], 2: ['09:00', '21:00'], 3: ['08:00', '14:00', '20:00'], 4: ['08:00', '12:00', '16:00', '20:00'] };
  const medsOf = () => (S.meds || []).filter((m) => (m.who || 'me') === aid());
  const medDay = (m) => diff(today(), m.start) + 1;
  const medActive = (m) => !m.off && medDay(m) >= 1 && (!m.days || medDay(m) <= m.days);
  const nowMin = () => new Date().getHours() * 60 + new Date().getMinutes();
  const takenToday = (m) => ((m.log || {})[today()] || []);
  function adherence(m) { let due = 0, got = 0; for (let k = 0; k < medDay(m) - 1 && (!m.days || k < m.days); k++) { const l = (m.log || {})[addDays(m.start, k)] || []; due += m.times.length; got += l.filter(Boolean).length; } return due ? Math.round(got / due * 100) : 100; }
  function dosesToday() {
    const out = [];
    medsOf().filter(medActive).forEach((m) => m.times.forEach((t, k) => out.push({ m, k, t, taken: !!takenToday(m)[k], late: !takenToday(m)[k] && toMin(t) + 30 < nowMin() })));
    return out.sort((a, b) => (a.t < b.t ? -1 : 1));
  }
  function medCard() {
    const ds = dosesToday(); if (!ds.length) return '';
    const done = ds.filter((d) => d.taken).length, next = ds.find((d) => !d.taken);
    return '<div class="mc"><div class="row between"><b>' + i('pill', 's') + ' ' + T('Medicines today', 'دەرمانەکانی ئەمڕۆ') + '</b><a class="lnk" href="#/meds">' + N(done) + T(' of ', ' لە ') + N(ds.length) + T(' taken', ' خوراوە') + '</a></div>' +
      '<div class="doses">' + ds.map((d) => '<button class="dose' + (d.taken ? ' ok' : d.late ? ' late' : d === next ? ' next' : '') + '" data-a="dose" data-x="' + d.m.id + '|' + d.k + '"><span class="tick">' + (d.taken ? i('check', 's') : '') + '</span><span class="grow"><b class="ltr">' + esc(d.m.name.split(' ')[0]) + '</b><small>' + esc(d.m.how || '') + '</small></span><span class="tm">' + fTime(d.t) + (d.late ? '<em>' + T('late', 'دواکەوتوو') + '</em>' : '') + '</span></button>').join('') + '</div></div>';
  }
  SCREENS.meds = () => {
    const all = medsOf(), act = all.filter(medActive), old = all.filter((m) => !medActive(m));
    const course = (m) => { const day = Math.min(medDay(m), m.days || medDay(m)), ad = adherence(m); return '<div class="mcard' + (medActive(m) ? '' : ' past') + '"><div class="row between"><span class="grow"><b class="ltr" style="display:block;text-align:start">' + esc(m.name) + '</b><small>' + esc(m.how || '') + '</small></span>' + (medActive(m) ? '<span class="badge b-mint">' + (m.days ? T('Day ' + day + ' of ' + m.days, 'ڕۆژی ' + N(day) + ' لە ' + N(m.days), 'اليوم ' + N(day) + ' من ' + N(m.days)) : T('Ongoing', 'بەردەوام')) + '</span>' : '<span class="badge b-gray">' + (m.off ? T('Stopped', 'وەستێنرا') : T('Finished', 'تەواو بوو')) + '</span>') + '</div>' +
      (m.days ? '<div class="bar"><i style="width:' + Math.min(100, Math.round(day / m.days * 100)) + '%"></i></div>' : '') +
      '<div class="row between small muted"><span>' + m.times.map((t) => '<span class="tchip">' + fTime(t) + '</span>').join(' ') + '</span><span>' + T('Taken on time: ', 'لە کاتی خۆیدا خوراوە: ') + N(ad) + '٪</span></div>' +
      (medActive(m) ? '<div class="row mt"><button class="btn out sm grow" data-a="medtimes" data-x="' + m.id + '">' + i('clock', 's') + T('Change times', 'گۆڕینی کات') + '</button><button class="btn out sm grow" data-a="medstop" data-x="' + m.id + '">' + i('x', 's') + T('Stop reminders', 'وەستاندنی بیرخستنەوە') + '</button></div>' : '') + '</div>'; };
    return {
      html: '<div class="page nobar">' + top(T('Medicine reminders', 'بیرخستنەوەی دەرمان'), T('From your prescriptions', 'لە ڕەچەتەکانتەوە')) + pbar() + medCard() +
        (act.length ? '<div class="lbl">' + T('Current', 'ئێستا') + '</div>' + act.map(course).join('') : '<div class="empty">' + i('pill', 'xl') + '<div class="mt">' + T('No reminders right now. Open a prescription and tap “Remind me”.', 'ئێستا هیچ بیرخستنەوەیەک نییە. ڕەچەتەیەک بکەرەوە و «بیرم بخەرەوە» دابگرە.') + '</div><a class="btn soft sm mt" href="#/file?tab=rx">' + T('My prescriptions', 'ڕەچەتەکانم') + '</a></div>') +
        (old.length ? '<div class="lbl">' + T('Earlier', 'پێشوو') + '</div>' + old.map(course).join('') : '') +
        '<p class="small muted mt">' + T('In the store version reminders arrive as phone notifications even when the app is closed. In this demo they appear while the app is open.', 'لە وەشانی ستۆردا بیرخستنەوەکان وەک ئاگادارکردنەوەی مۆبایل دێن تەنانەت ئەگەر ئەپەکە داخرابێت. لەم نموونەیەدا کاتێک ئەپەکە کراوەیە دەردەکەون.') + '</p></div>'
    };
  };
  function medTimesSheet(list, done) {
    /* list: [{name, how, times, days}] — let the patient adjust the times before saving */
    sheet('<h3>' + T('Remind me to take', 'بیرم بخەرەوە بۆ خواردنی') + '</h3>' + list.map((m, j) => '<div class="card mt" style="padding:12px"><b class="ltr" style="display:block;text-align:start">' + esc(m.name) + '</b><small class="muted">' + esc(m.how || '') + (m.days ? ' · ' + N(m.days) + T(' days', ' ڕۆژ') : '') + '</small><div class="times">' + m.times.map((t, k) => '<input type="time" class="in ltr" data-t="' + j + '|' + k + '" value="' + t + '">').join('') + '</div></div>').join('') +
      '<button class="btn pri lg block mt" data-ok>' + i('bell', 's') + T('Save reminders', 'پاشەکەوتکردنی بیرخستنەوە') + '</button>', (sh) => {
      sh.querySelector('[data-ok]').onclick = () => { sh.querySelectorAll('[data-t]').forEach((inp) => { const [j, k] = inp.dataset.t.split('|').map(Number); if (inp.value) list[j].times[k] = inp.value; }); list.forEach((m) => m.times.sort()); closeSheet(); done(list); };
    });
  }
  setInterval(() => {
    const ds = dosesToday(), nm = nowMin();
    let ch = false;
    ds.forEach((d) => {
      const due = toMin(d.t); if (d.taken || nm < due || nm > due + 15) return;
      const key = today() + ':' + d.k; d.m.nt = d.m.nt || {}; if (d.m.nt[key]) return;
      d.m.nt[key] = 1; ch = true;
      note('pill', 'blue', T('Time for your medicine', 'کاتی دەرمانەکەتە'), d.m.name + ' · ' + (d.m.how || ''), '#/meds');
      toast(T('Time to take ', 'کاتی خواردنی ') + d.m.name.split(' ')[0], 'pill'); if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
    });
    if (ch) save();
  }, 15000);

  /* =================================================================== actions */
  const ACT = {
    back() { if (history.length > 1) history.back(); else go('#/home'); },
    lang() { sheet('<h3>' + T('Language', 'زمان') + '</h3><div class="menu">' + [['en', 'English'], ['ku', 'کوردی'], ['ar', 'العربية']].map(([k, l]) => '<button data-l="' + k + '"><span class="grow" style="font-size:16px">' + l + '</span>' + (window.Lang === k ? '<span class="badge b-mint">' + i('check', 's') + '</span>' : '') + '</button>').join('') + '</div>', (sh) => sh.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.l)))); },
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
      if (needNet()) return;
      let a;
      if (B.editId) { a = S.appts.find((x) => x.id === B.editId); Object.assign(a, { doc: B.doc, date: B.date, time: B.time, status: 'pending', note: B.note || a.note }); }
      else { a = { id: 'a' + Date.now(), svc: B.svc, doc: B.doc, date: B.date, time: B.time, status: 'pending', note: B.note }; S.appts.push(a); }
      note('calendar', 'amber', T('Request sent', 'داواکاری نێردرا'), (isMe() ? '' : firstName(S.profile.name) + ' · ') + svc(a.svc).name + ' · ' + fDate(a.date) + ' · ' + fTime(a.time), '#/visits');
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
        (r.meds.some((m) => m.f) ? ((S.meds || []).some((m) => m.rx === r.id && medActive(m) && (m.who || 'me') === aid()) ? '<a class="btn soft lg block mt" href="#/meds" data-close2>' + i('bell', 's') + T('Reminders are on', 'بیرخستنەوە چالاکە') + '</a>' : '<button class="btn pri lg block mt" data-remind>' + i('bell', 's') + T('Remind me to take these', 'بیرم بخەرەوە بۆ خواردنیان') + '</button>') : '') +
        '<div class="row mt"><a class="btn wa lg grow" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(text) + '">' + i('whatsapp', 's') + T('Share', 'ناردن') + '</a><button class="btn out lg grow" data-close>' + T('Close', 'داخستن') + '</button></div>', (sh) => { sh.querySelector('[data-close]').onclick = () => closeSheet(); const rb = sh.querySelector('[data-remind]'); if (rb) rb.onclick = () => ACT.medset(id); const c2 = sh.querySelector('[data-close2]'); if (c2) c2.onclick = () => closeSheet(true); });
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
        '<div class="lbl">' + T('Payments', 'پارەدانەکان') + (v.plan ? '<span>' + N(v.plan) + T(' instalments', ' قیست') + '</span>' : '') + '</div><div class="card">' + pays.map((p) => '<div class="sum"><span>' + fDate(p[0]) + ' · ' + esc(p[2]) + '</span><b style="color:var(--ok)">' + money(p[1]) + '</b></div>').join('') + '<div class="sum"><span>' + T('Left to pay', 'ماوە') + '</span><b>' + money(left) + '</b></div></div>' +
        (left > 0 ? '<button class="btn pri lg block mt" data-pay>' + i('wallet') + T('Pay ', 'پارەدانی ') + money(v.plan ? Math.min(left, Math.round(v.total / v.plan)) : left) + '</button>' : '<div class="center mt"><span class="badge b-mint">' + i('check', 's') + T('Fully paid', 'بە تەواوی دراوە') + '</span></div>'), (sh) => { const b = sh.querySelector('[data-pay]'); if (b) b.onclick = () => ACT.pay(id); });
    },
    pay(id) {
      if (needNet()) return;
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
    qr(x, el) { if (el.textContent === T('I have pain', 'ئازارم هەیە')) { go('#/urgent'); return; } sendChat(el.textContent); },
    setting(k) { S.settings[k] = !S.settings[k]; save(); render(); },
    editp() {
      const p = S.profile;
      sheet('<h3>' + T('Edit profile', 'دەستکاریی پرۆفایل') + '</h3>' + [['name', T('Full name', 'ناوی تەواو'), p.name, 'text'], ['phone', T('Mobile', 'مۆبایل'), p.phone, 'tel'], ['email', T('Email', 'ئیمەیڵ'), p.email, 'email'], ['dob', T('Date of birth', 'بەرواری لەدایکبوون'), p.dob, 'date']].map(([k, l, v, t]) => '<div class="field"><label>' + l + '</label><input class="in' + (k !== 'name' ? ' ltr' : '') + '" name="' + k + '" type="' + t + '" value="' + esc(v) + '"></div>').join('') + '<button class="btn pri lg block" data-ok>' + T('Save', 'پاشەکەوتکردن') + '</button>', (sh) => {
        sh.querySelector('[data-ok]').onclick = () => { sh.querySelectorAll('input').forEach((inp) => { if (inp.value.trim()) p[inp.name] = inp.value.trim(); }); save(); closeSheet(); render(); toast(T('Profile saved', 'پرۆفایل پاشەکەوت کرا')); };
      });
    },
    who(id) { if (id === (S.active || 'me')) { if (route().path === 'family') go('#/home'); return; } switchTo(id); const n = firstName(S.profile.name); toast(id === 'me' ? T('Back to your own file', 'گەڕایتەوە بۆ پەڕگەی خۆت') : T('Now showing ' + n + '’s file', 'ئێستا پەڕگەی ' + n + ' دەبینیت', 'تعرض الآن ملف ' + n), 'users'); if (route().path === 'family') go('#/home'); else render(); },
    addmember() {
      let rel = 'child', gender = 'm';
      sheet('<h3>' + T('Add a family member', 'زیادکردنی ئەندامێکی خێزان') + '</h3>' +
        '<div class="field"><label>' + T('Full name', 'ناوی تەواو') + '</label><input class="in" name="name" autocomplete="off"></div>' +
        '<div class="field"><label>' + T('Relationship', 'پەیوەندی') + '</label><div class="seg" data-rel>' + ['child', 'spouse', 'parent', 'other'].map((k) => '<button type="button" data-v="' + k + '" class="' + (k === rel ? 'on' : '') + '">' + REL[k] + '</button>').join('') + '</div></div>' +
        '<div class="row" style="gap:10px"><div class="field grow"><label>' + T('Date of birth', 'بەرواری لەدایکبوون') + '</label><input class="in ltr" type="date" name="dob"></div><div class="field grow"><label>' + T('Gender', 'ڕەگەز') + '</label><div class="seg" data-g><button type="button" data-v="m" class="on">' + T('Male', 'نێر') + '</button><button type="button" data-v="f">' + T('Female', 'مێ') + '</button></div></div></div>' +
        '<p class="small muted">' + T('The clinic will link this person to their existing file, or open a new one at the first visit.', 'کلینیک ئەم کەسە بە پەڕگە کۆنەکەیەوە دەبەستێتەوە، یان لە یەکەم سەرداندا پەڕگەیەکی نوێی بۆ دەکاتەوە.') + '</p>' +
        '<button class="btn pri lg block mt" data-ok>' + T('Add', 'زیادکردن') + '</button>', (sh) => {
        const pick = (sel, set) => sh.querySelectorAll(sel + ' [data-v]').forEach((b) => b.addEventListener('click', () => { set(b.dataset.v); sh.querySelectorAll(sel + ' [data-v]').forEach((x) => x.classList.toggle('on', x === b)); }));
        pick('[data-rel]', (v) => { rel = v; }); pick('[data-g]', (v) => { gender = v; });
        sh.querySelector('[data-ok]').onclick = () => {
          const name = sh.querySelector('[name=name]').value.trim(); if (!name) { sh.querySelector('[name=name]').focus(); return; }
          const id = 'm' + Date.now().toString(36);
          const files = people().map((p) => p.file || 0);
          S.members.push({ id, rel, profile: { name, phone: S.profile.phone, dob: sh.querySelector('[name=dob]').value, gender, file: Math.max.apply(null, files) + 1, blood: '', allergies: [] }, data: { appts: [], plan: [], teeth: {}, rx: [], xrays: [], invoices: [], extraPay: [], rated: {} } });
          save(); closeSheet(); render(); toast(T(firstName(name) + ' was added', firstName(name) + ' زیادکرا', 'تمت إضافة ' + firstName(name)), 'users');
        };
      });
    },
    async rmember(id) {
      const m = S.members.find((x) => x.id === id); if (!m) return;
      const nm = id === S.active ? S.profile.name : m.profile.name;
      if (!(await confirmSheet(T('Remove ' + nm + '?', nm + ' لادەبەیت؟', 'إزالة ' + nm + '؟'), T('Their file at the clinic is not deleted. You can add them again later.', 'پەڕگەکەی لە کلینیک ناسڕێتەوە. دواتر دەتوانیت دووبارە زیادی بکەیتەوە.'), T('Remove', 'لابردن'), true))) return;
      if (id === S.active) switchTo('me');
      S.members = S.members.filter((x) => x.id !== id); save(); render();
    },
    checkin(id) {
      const a = S.appts.find((x) => x.id === id); if (!a) return;
      a.checkin = { at: Date.now(), ahead: 2, late: 10 }; save(); render();
      note('pin', 'mint', T('You are checked in', 'گەیشتنت تۆمارکرا'), T('Reception knows you are here', 'پێشوازی دەزانێت گەیشتوویت'), '#/home');
      toast(T('Reception knows you are here', 'پێشوازی دەزانێت گەیشتوویت'), 'check');
    },
    plan(id) {
      const pl = S.plan.find((x) => x.id === id); if (!pl) return;
      const d = doc(pl.doc), cost = planCost(pl), n = pl.pay || 1;
      let opt = pl.payOpt || (n > 1 ? 'inst' : 'full'), ok = false;
      const proposed = pl.status === 'proposed';
      sheet('<h3>' + esc(pl.title) + '</h3><div class="li"><span class="dav" style="width:40px;height:40px;border-radius:12px">' + portrait(pl.doc) + '</span><span class="grow"><div class="row-t">' + esc(d.name) + '</div><div class="row-s">' + (proposed ? T('Sent ', 'نێردرا ') + ago(pl.sent) : T('Accepted ', 'قبووڵکرا ') + (pl.accepted ? fDate(pl.accepted) : '')) + '</div></span></div>' +
        (pl.why ? '<div class="recall" style="margin-top:12px"><span class="c" style="width:36px;height:36px">' + i('info') + '</span><small style="font-size:13px;color:var(--text)">' + esc(pl.why) + '</small></div>' : '') +
        '<div class="card mt">' + (pl.items || []).map((it) => '<div class="sum"><span style="color:var(--text)">' + esc(it[0]) + '</span><b>' + (it[1] ? money(it[1]) : '<span class="badge b-mint">' + T('Included', 'لەخۆدەگرێت') + '</span>') + '</b></div>').join('') + '<div class="sum"><span>' + T('Total', 'کۆی گشتی') + '</span><b style="font-size:16px">' + money(cost) + '</b></div><div class="sum"><span>' + T('Visits', 'سەردان') + '</span><b>' + N(pl.total) + '</b></div></div>' +
        (proposed ? '<div class="lbl">' + T('How would you like to pay?', 'چۆن پارە دەدەیت؟') + '</div><div class="paym two">' + [['full', T('All at once', 'هەمووی یەکجار'), money(cost)], ['inst', T(n + ' instalments', N(n) + ' قیست', N(n) + ' أقساط'), money(Math.round(cost / n)) + T(' each', ' هەر جارێک')]].filter((x) => x[0] === 'full' || n > 1).map(([k, l, v]) => '<button class="pm ' + (k === opt ? 'on' : '') + '" data-o="' + k + '"><b>' + l + '</b><small>' + v + '</small></button>').join('') + '</div>' +
          '<label class="agree"><input type="checkbox" data-agree><span>' + T('I have read the plan and the costs. I can still ask questions before the first visit.', 'پلان و تێچووەکانم خوێندەوە. پێش یەکەم سەردان دەتوانم هێشتا پرسیار بکەم.') + '</span></label>' +
          '<div class="row mt"><a class="btn out lg grow" href="#/chat" data-ask>' + i('message', 's') + T('Ask a question', 'پرسیار') + '</a><button class="btn pri lg grow" data-acc disabled>' + i('check', 's') + T('Accept plan', 'قبووڵکردن') + '</button></div>'
          : '<div class="center mt"><span class="badge b-mint">' + i('check', 's') + T('You accepted this plan', 'ئەم پلانەت قبووڵ کردووە') + (pl.payOpt ? ' · ' + (pl.payOpt === 'inst' ? T(n + ' instalments', N(n) + ' قیست', N(n) + ' أقساط') : T('paid at once', 'یەکجار')) : '') + '</span></div><button class="btn out lg block mt" data-close>' + T('Close', 'داخستن') + '</button>'), (sh) => {
        const c = sh.querySelector('[data-close]'); if (c) c.onclick = () => closeSheet();
        if (!proposed) return;
        sh.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => { opt = b.dataset.o; sh.querySelectorAll('[data-o]').forEach((x) => x.classList.toggle('on', x === b)); }));
        const acc = sh.querySelector('[data-acc]');
        sh.querySelector('[data-agree]').addEventListener('change', (e) => { ok = e.target.checked; acc.disabled = !ok; });
        sh.querySelector('[data-ask]').onclick = () => { closeSheet(true); S.chat.push({ me: true, t: T('I have a question about my plan: ', 'پرسیارێکم هەیە دەربارەی پلانەکەم: ') + pl.title, at: nowStamp() }); save(); };
        acc.onclick = () => {
          if (!ok) return;
          pl.status = 'accepted'; pl.accepted = today(); pl.payOpt = opt;
          note('clipboard', 'mint', T('Plan accepted', 'پلانەکە قبووڵکرا'), pl.title + ' · ' + T('the clinic will call you to book', 'کلینیک پەیوەندیت پێوە دەکات بۆ نۆرە'), '#/file');
          save(); closeSheet(); render(); toast(T('Thank you — the clinic has your approval', 'سوپاس — ڕەزامەندییەکەت گەیشتە کلینیک'), 'check');
        };
      });
    },
    pinlock() {
      if (hasPin()) lockScreen('off', () => render());
      else lockScreen('set', () => render());
    },
    dlfile() {
      const p = S.profile, rows = (a) => a.join('');
      const sec = (t, body) => '<h2>' + t + '</h2>' + body;
      const html = '<!doctype html><html lang="' + (KU ? 'ckb' : AR ? 'ar' : 'en') + '" dir="' + (RTL ? 'rtl' : 'ltr') + '"><meta charset="utf-8"><title>' + esc(p.name) + ' — Bite</title><style>body{font-family:system-ui,"Noto Naskh Arabic",sans-serif;max-width:760px;margin:30px auto;padding:0 20px;color:#1B2A33}h1{color:#1B2B4F;margin:0}h2{color:#1B2B4F;border-bottom:2px solid #E3E9EC;padding-bottom:4px;margin-top:28px;font-size:18px}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid #E3E9EC;padding:7px 4px;text-align:start}small{color:#5B6B75}@media print{body{margin:0}}</style>' +
        '<h1>' + esc(p.name) + '</h1><small>' + esc(CLINIC.name) + ' · ' + T('File #', 'پەڕگەی #') + p.file + ' · ' + T('Printed ', 'چاپکرا ') + fDate(today()) + '</small>' +
        '<p>' + T('Date of birth', 'بەرواری لەدایکبوون') + ': ' + esc(p.dob || '—') + ' · ' + T('Blood', 'خوێن') + ': ' + esc(p.blood || '—') + ' · ' + T('Allergies', 'هەستیاری') + ': ' + esc((p.allergies || []).join(', ') || '—') + '</p>' +
        sec(T('Treatment plans', 'پلانی چارەسەر'), '<table>' + rows(S.plan.map((x) => '<tr><td>' + esc(x.title) + '</td><td>' + esc(doc(x.doc).name) + '</td><td>' + money(planCost(x)) + '</td></tr>')) + '</table>') +
        sec(T('Visits', 'سەردانەکان'), '<table>' + rows(S.appts.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map((a) => '<tr><td>' + fDate(a.date) + '</td><td>' + esc(svc(a.svc).name) + '</td><td>' + esc(doc(a.doc).name) + '</td><td>' + esc(reasonOf(a)) + '</td></tr>')) + '</table>') +
        sec(T('Prescriptions', 'ڕەچەتەکان'), rows(S.rx.map((x) => '<p><b>' + fDate(x.date) + ' · ' + esc(doc(x.doc).name) + '</b><br>' + x.meds.map((m) => esc(m.n) + ' — ' + esc(m.d)).join('<br>') + '</p>')) || '<p>—</p>') +
        sec(T('X-rays', 'تیشکەکان'), '<table>' + rows(S.xrays.map((x) => '<tr><td>' + fDate(x.date) + '</td><td>' + esc(x.title) + '</td></tr>')) + '</table>') +
        sec(T('Bills', 'پسوولەکان'), '<table>' + rows(S.invoices.map((v) => '<tr><td>' + v.id + '</td><td>' + fDate(v.date) + '</td><td>' + money(v.total) + '</td><td>' + money(Math.max(0, v.total - paidOf(v))) + T(' left', ' ماوە') + '</td></tr>')) + '</table>') + '</html>';
      dl(html, 'bite-' + String(p.file) + '.html', 'text/html');
      toast(T('Your file was downloaded', 'پەڕگەکەت داگیرا'), 'download');
    },
    dldata() {
      stash(S); const copy = JSON.parse(JSON.stringify(S)); unstash(S, S.active || 'me');
      const out = { exported: new Date().toISOString(), clinic: CLINIC.name, account: { phone: S.profile.phone }, people: copy.members.map((m) => ({ relation: m.rel, profile: m.profile, records: m.data })) };
      dl(JSON.stringify(out, null, 2), 'bite-my-data.json', 'application/json');
      toast(T('Your data was downloaded', 'زانیارییەکانت داگیران'), 'download');
    },
    delacct() {
      const word = T('DELETE', 'سڕینەوە');
      sheet('<h3>' + T('Delete your account?', 'ئەکاونتەکەت دەسڕیتەوە؟') + '</h3><p class="p">' + T('This removes the app account for you and your family members. To confirm, type ', 'ئەمە ئەکاونتی خۆت و ئەندامانی خێزانەکەت لادەبات. بۆ دڵنیابوونەوە بنووسە ') + '<b>' + word + '</b></p><input class="in" data-w autocomplete="off"><button class="btn red lg block mt" data-ok disabled>' + i('trash', 's') + T('Delete for good', 'بە یەکجاری بیسڕەوە') + '</button><button class="btn out lg block mt" data-no>' + T('Keep my account', 'ئەکاونتەکەم بمێنێتەوە') + '</button>', (sh) => {
        const inp = sh.querySelector('[data-w]'), ok = sh.querySelector('[data-ok]');
        inp.addEventListener('input', () => { ok.disabled = inp.value.trim().toUpperCase() !== word.toUpperCase(); });
        sh.querySelector('[data-no]').onclick = () => closeSheet();
        ok.onclick = () => { try { localStorage.removeItem(KEY); localStorage.removeItem(PINK); sessionStorage.clear(); } catch (e) { /* ignore */ } S = load(); S.seen = false; save(); closeSheet(true); go('#/welcome', true); toast(T('Your account was deleted', 'ئەکاونتەکەت سڕایەوە'), 'trash'); };
      });
    },
    /* --- phase 2 --- */
    ugarea(k) { const j = U.area.indexOf(k); if (j >= 0) U.area.splice(j, 1); else U.area.push(k); render(); },
    ugsym(k) { const j = U.sym.indexOf(k); if (j >= 0) U.sym.splice(j, 1); else U.sym.push(k); render(); },
    ugsince(k) { U.since = k; render(); },
    ugsend() {
      if (!navigator.onLine) { location.href = 'tel:' + CLINIC.phone; return; }
      const tri = triage(U), area = U.area.map((k) => AREAS.find((x) => x[0] === k)[1]).join('، ') || T('not sure where', 'شوێنەکەی دیار نییە');
      const syms = U.sym.map((k) => SYMS.find((x) => x[0] === k)[1]);
      const u = { id: 'u' + Date.now(), at: nowStamp(), tri, area: U.area.slice(), level: U.level, sym: U.sym.slice(), since: U.since, note: U.note, photo: U.photo };
      S.urgent = [u].concat(S.urgent || []).slice(0, 5);
      const summary = T('Pain report', 'ڕاپۆرتی ئازار') + ' · ' + area + ' · ' + U.level + '/10' + (syms.length ? ' · ' + syms.join('، ') : '') + (U.note ? ' · ' + U.note : '');
      S.chat.push({ me: true, t: '🚨 ' + summary, at: nowStamp() });
      note('alert', tri === 'red' ? 'red' : 'amber', T('Pain report sent', 'ڕاپۆرتی ئازار نێردرا'), area + ' · ' + N(U.level) + '/' + N(10), '#/chat');
      save();
      const nm = firstName(S.profile.name);
      setTimeout(() => { S.chat.push({ me: false, t: tri === 'red' ? T('We saw your report, ' + nm + '. Please call us now on ' + CLINIC.phone + ' — the doctor will see you today.', 'ڕاپۆرتەکەتمان بینی ' + nm + '. تکایە ئێستا پەیوەندی بکە بە ' + CLINIC.phone + ' — دکتۆر ئەمڕۆ دەتبینێت.', 'اطّلعنا على بلاغك يا ' + nm + '. يرجى الاتصال بنا الآن على ' + CLINIC.phone + ' — سيراك الطبيب اليوم.') : T('Thank you ' + nm + '. The doctor has looked at your report. The earliest times are in the app — or reply here and we will book for you.', 'سوپاس ' + nm + '. دکتۆر سەیری ڕاپۆرتەکەتی کرد. زووترین کاتەکان لە ئەپەکەدان — یان لێرە وەڵام بدەرەوە و بۆت دەگرین.', 'شكراً ' + nm + '. اطّلع الطبيب على بلاغك. أقرب المواعيد موجودة في التطبيق — أو ردّ هنا وسنحجز لك.'), at: nowStamp() }); note('message', 'purple', T('Reply from the clinic', 'وەڵام لە کلینیکەوە'), T('About your pain report', 'دەربارەی ڕاپۆرتی ئازارەکەت'), '#/chat'); save(); toast(T('The clinic replied to your report', 'کلینیک وەڵامی ڕاپۆرتەکەتی دایەوە'), 'message'); }, 6000);
      U = { area: [], level: 5, sym: [], since: 'today', note: '', photo: '' };
      go('#/urgent/sent', true);
    },
    ugbook(x) {
      const [d, date, time] = x.split('|');
      const a = { id: 'a' + Date.now(), svc: 'consult', doc: d, date, time, status: 'confirmed', reason: T('Urgent check-up — pain report', 'پشکنینی پەلە — ڕاپۆرتی ئازار'), urgent: true };
      S.appts.push(a); note('check', 'mint', T('Urgent visit booked', 'نۆرەی پەلە گیرا'), rel(date) + ' · ' + fTime(time) + ' · ' + doc(d).sn, '#/visits'); save();
      go('#/visits', true); toast(T('Booked — see you ', 'گیرا — دەتبینین ') + rel(date).toLowerCase() + ' · ' + fTime(time), 'check');
    },
    wljoin(id) {
      const a = id && S.appts.find((x) => x.id === id);
      const w0 = { svc: a ? a.svc : B.svc, doc: a ? a.doc : (B.doc && B.doc !== 'any' ? B.doc : null), appt: a ? a.id : null };
      let pref = 'any';
      sheet('<h3>' + T('Join the waiting list', 'چوونە ناو لیستی چاوەڕوانی') + '</h3><p class="p">' + (a ? T('Your visit is on ' + fDate(a.date, true) + '. If someone cancels before that, we will offer you their time first.', 'نۆرەکەت ' + fDate(a.date, true) + 'یە. ئەگەر کەسێک پێش ئەوە هەڵیوەشاندەوە، یەکەم جار کاتەکەی بە تۆ پێشکەش دەکەین.', 'موعدك يوم ' + fDate(a.date, true) + '. إذا ألغى أحدهم قبل ذلك، سنعرض عليك موعده أولاً.') : T('If a time opens up for ' + svc(w0.svc).name + ', we will send it to you first. You have 30 minutes to take it.', 'ئەگەر کاتێک بۆ ' + svc(w0.svc).name + ' بەتاڵ بوو، یەکەم جار بۆ تۆی دەنێرین. ٣٠ خولەکت هەیە بۆ گرتنی.', 'إذا توفّر موعد لـ ' + svc(w0.svc).name + '، سنرسله إليك أولاً. لديك ٣٠ دقيقة لحجزه.')) + '</p>' +
        '<div class="lbl">' + T('Which times suit you?', 'چ کاتێک بۆت گونجاوە؟') + '</div><div class="seg" data-pref>' + [['any', T('Any time', 'هەر کاتێک')], ['aft', T('Afternoon', 'دوانیوەڕۆ')], ['eve', T('Evening', 'ئێوارە')]].map(([k, l]) => '<button data-v="' + k + '" class="' + (k === pref ? 'on' : '') + '">' + l + '</button>').join('') + '</div>' +
        '<button class="btn pri lg block mt" data-ok>' + i('bell', 's') + T('Tell me when a time opens', 'ئاگادارم بکەرەوە کە کاتێک بەتاڵ بوو') + '</button>', (sh) => {
        sh.querySelectorAll('[data-pref] [data-v]').forEach((b) => b.addEventListener('click', () => { pref = b.dataset.v; sh.querySelectorAll('[data-pref] [data-v]').forEach((y) => y.classList.toggle('on', y === b)); }));
        sh.querySelector('[data-ok]').onclick = () => {
          S.waitlist = (S.waitlist || []).filter((w) => !(w0.appt && w.appt === w0.appt));
          S.waitlist.push(Object.assign({ id: 'w' + Date.now(), at: Date.now(), pref, who: aid() }, w0)); save(); closeSheet();
          toast(T('You are on the waiting list', 'خرایتە ناو لیستی چاوەڕوانی'), 'bell');
          if (!a) go('#/visits'); else render();
        };
      });
    },
    wlleave(id) { S.waitlist = (S.waitlist || []).filter((w) => w.id !== id); save(); render(); toast(T('Removed from the waiting list', 'لە لیستی چاوەڕوانی لابرایت'), 'x'); },
    wlno(id) { S.waitlist = (S.waitlist || []).filter((w) => w.id !== id); save(); render(); },
    wlyes(id) {
      const w = (S.waitlist || []).find((x) => x.id === id); if (!w || !w.offer) return;
      const o = w.offer; let a = w.appt && S.appts.find((x) => x.id === w.appt);
      if (a) Object.assign(a, { date: o.date, time: o.time, doc: o.doc, status: 'confirmed' });
      else { a = { id: 'a' + Date.now(), svc: w.svc, doc: o.doc, date: o.date, time: o.time, status: 'confirmed', reason: T('Earlier time from the waiting list', 'کاتی زووتر لە لیستی چاوەڕوانییەوە') }; S.appts.push(a); }
      S.waitlist = S.waitlist.filter((x) => x.id !== id);
      note('check', 'mint', T('Earlier time booked', 'کاتی زووتر گیرا'), svc(a.svc).name + ' · ' + fDate(a.date) + ' · ' + fTime(a.time), '#/visits'); save(); render();
      toast(T('Done — your visit is now ', 'تەواو — نۆرەکەت ئێستا ') + rel(a.date).toLowerCase() + ' · ' + fTime(a.time), 'check');
    },
    cardsave() {
      const p = S.profile, box = app().querySelector('[data-qr] svg'); if (!box) return;
      const W = 720, H = 1000, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      const st = getComputedStyle(document.documentElement), brand = st.getPropertyValue('--mint-2').trim() || '#3FA987';
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = brand; x.fillRect(0, 0, W, 300);
      x.fillStyle = '#fff'; x.font = '700 44px sans-serif'; x.textAlign = 'center'; x.fillText(CLINIC.name, W / 2, 110);
      x.font = '600 52px sans-serif'; x.fillText(p.name, W / 2, 200); x.font = '36px sans-serif'; x.fillText('#' + p.file, W / 2, 260);
      const img = new Image(); img.onload = () => { x.drawImage(img, 160, 360, 400, 400); x.fillStyle = '#5B6B75'; x.font = '30px sans-serif'; x.fillText(qrText(p), W / 2, 830); c.toBlob((b) => { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'bite-card-' + p.file + '.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 400); toast(T('Card saved', 'کارتەکە پاشەکەوت کرا'), 'download'); }); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(box.outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"'));
    },
    wallet() { toast(T('Apple and Google Wallet come with the store version', 'Apple و Google Wallet لە وەشانی ستۆردا دێن'), 'wallet'); },
    lcat(k) { LV.cat = k; render(); },
    refcopy(code) { (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast(T('Code copied', 'کۆدەکە کۆپی کرا'), 'copy')).catch(() => toast(code, 'copy')); },
    refsent(x, el) { S.refer = S.refer || { sent: 0, friends: [] }; S.refer.sent++; save(); window.open(el.href, '_blank', 'noopener'); setTimeout(render, 300); },
    refshare() {
      const R = DATA.REFERRAL, code = refCode();
      const msg = T('Use my code ' + code + ' at Bite for Dentistry and get ' + R.pct + '% off your first visit.', 'کۆدەکەم ' + code + ' لە Bite for Dentistry بەکاربهێنە و ' + N(R.pct) + '٪ داشکاندن لە یەکەم سەردانت وەربگرە.', 'استخدم رمزي ' + code + ' في Bite for Dentistry واحصل على خصم ' + N(R.pct) + '٪ على زيارتك الأولى.');
      S.refer = S.refer || { sent: 0, friends: [] }; S.refer.sent++; save(); render();
      if (navigator.share) navigator.share({ title: 'Bite', text: msg, url: location.href.split('#')[0] }).catch(() => {}); else ACT.refcopy(msg);
    },
    brushgo() { BR = { left: 120, on: true }; chime(1); render(); brushTick(); },
    brushpause() { BR.on = !BR.on; render(); if (BR.on) brushTick(); },
    async brushstop() { const was = BR.on; BR.on = false; if (await confirmSheet(T('Stop brushing?', 'ددانشۆردن ڕادەگریت؟'), T('You only get the star after the full two minutes.', 'تەنها دوای دوو خولەکی تەواو ئەستێرە وەردەگریت.'), T('Stop', 'وەستان'), true)) { BR = null; clearInterval(brushT); render(); } else { BR.on = was; brushTick(); } },
    brushend() { BR = null; },
    alout() { const al = alOf(); al.out = Date.now(); al.nagged = false; save(); render(); toast(T('We will remind you in 30 minutes', 'دوای ٣٠ خولەک بیرت دەخەینەوە'), 'clock'); },
    alin() { const al = alOf(); const m = Math.max(1, Math.round((Date.now() - al.out) / 60000)); al.outLog = al.outLog || {}; al.outLog[today()] = (al.outLog[today()] || 0) + m; al.out = null; al.nagged = false; save(); render(); toast(T('Great — ' + m + ' min out', 'باشە — ' + m + ' خولەک لاتبردبوو', 'ممتاز — ' + N(m) + ' دقيقة خارج الفم'), 'check'); },
    altray() { const al = alOf(); if (al.tray < al.total) al.tray++; al.since = today(); save(); render(); toast(T('Tray ' + al.tray + ' — keep going!', 'قاڵبی ' + N(al.tray) + ' — بەردەوام بە!', 'القالب ' + N(al.tray) + ' — استمر!'), 'check'); },
    /* --- phase 3 --- */
    sq(x) { QV.q = x; const inp = app().querySelector('[data-sq]'); if (inp) { inp.value = x; app().querySelector('[data-sres]').innerHTML = searchResults(); } },
    legal(k) { go('#/legal?t=' + k, true); },
    legalw(k) { const L = DATA.LEGAL; sheet('<h3>' + (k === 'terms' ? T('Terms of use', 'مەرجەکانی بەکارهێنان') : T('Privacy notice', 'ڕوونکردنەوەی تایبەتمەندی')) + '</h3><div class="article">' + (L[k] || []).map((p) => { const t = P(p) || ''; return t.startsWith('• ') ? '<p class="bl">' + esc(t.slice(2)) + '</p>' : '<p>' + esc(t) + '</p>'; }).join('') + '</div><button class="btn pri lg block mt" data-close>' + T('OK', 'باشە') + '</button>', (sh) => { sh.querySelector('[data-close]').onclick = () => closeSheet(); }); },
    look(x) { const [k, v] = x.split(':'); try { localStorage.setItem(k === 'theme' ? 'bite_theme' : 'bite_size', v); } catch (e) { /* ignore */ } window.applyLook(); render(); },
    /* --- medicine reminders --- */
    dose(x) {
      const [id, k] = x.split('|'), m = (S.meds || []).find((y) => y.id === id); if (!m) return;
      m.log = m.log || {}; const l = m.log[today()] = (m.log[today()] || []).slice(); while (l.length < m.times.length) l.push(false);
      l[+k] = !l[+k]; save(); render();
      if (l[+k]) toast(T('Marked as taken', 'وەک خوراو تۆمارکرا'), 'check');
    },
    medtimes(id) { const m = S.meds.find((y) => y.id === id); medTimesSheet([{ name: m.name, how: m.how, times: m.times.slice(), days: m.days }], (l) => { m.times = l[0].times; save(); render(); toast(T('Times updated', 'کاتەکان نوێکرانەوە'), 'clock'); }); },
    async medstop(id) { const m = S.meds.find((y) => y.id === id); if (!(await confirmSheet(T('Stop these reminders?', 'ئەم بیرخستنەوانە ڕادەگریت؟'), T('Ask your doctor before stopping a medicine early.', 'پێش ئەوەی دەرمانێک زوو ڕابگریت لە دکتۆرەکەت بپرسە.'), T('Stop', 'وەستاندن'), true))) return; m.off = true; save(); render(); },
    medset(rxId) {
      const r = S.rx.find((x) => x.id === rxId);
      const list = r.meds.filter((m) => m.f).map((m) => ({ name: m.n, how: String(m.d || '').split(' · ')[0], times: (DEF_TIMES[m.f] || DEF_TIMES[2]).slice(), days: m.days || 0 }));
      medTimesSheet(list, (l) => {
        S.meds = (S.meds || []).filter((m) => !(m.rx === rxId && (m.who || 'me') === aid()));
        l.forEach((m, j) => S.meds.push(Object.assign({ id: 'm' + Date.now().toString(36) + j, who: aid(), rx: rxId, start: today(), log: {} }, m)));
        save(); go('#/meds'); toast(T('Reminders are on', 'بیرخستنەوەکان چالاک کران'), 'bell');
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
  let lastFull = null, booted = false;
  function render() {
    const r = route();
    if (!S.seen && r.path !== 'welcome') { go('#/welcome', true); return; }
    if (!booted) { booted = true; if (['home', 'file', 'visits'].includes(r.path) && !window.__noSkel) { app().innerHTML = skeleton(); setTimeout(render, 380); return; } }
    const fn = SCREENS[r.path] || SCREENS.home;
    const out = fn(r.parts[1], r.q);
    if (!out) return; // the screen redirected
    const keep = lastFull === r.full ? window.scrollY : 0;
    app().innerHTML = out.html;
    if (lastFull !== r.full) { const pg = app().querySelector('.page'); if (pg) pg.classList.add('pg-in'); }
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
  if (!navigator.onLine) netBar();
  if (hasPin() && S.seen) { let u = ''; try { u = sessionStorage.getItem('bite_unl') || ''; } catch (e) { /* ignore */ } if (!u) lockScreen('unlock'); }
})();
