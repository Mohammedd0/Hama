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
  const TILES = { book: '', rx: '', xray: '', pay: '', welcome: '' };
  const CLINIC = {
    name: 'Bite for Dentistry', phone: '07505430000', wa: '9647505430000',
    address: ['Nergz Plaza, 3rd floor, Gulan Street, Erbil', 'نێرگز پلازا، نهۆمی ٣، شەقامی گوڵان، هەولێر'],
    hours: ['Sat – Thu · 12:00 – 21:00', 'شەممە – پێنجشەممە · ١٢:٠٠ – ٢١:٠٠'],
    brand: '#67CDAB', logo: '',
    map: 'https://www.google.com/maps/search/?api=1&query=Nergz+Plaza+Gulan+Street+Erbil',
    instagram: 'https://instagram.com/'
  };


  /* ---------- aftercare guides (editable in admin) ----------
     key: [en, ku] pairs. days = how long the guide stays on the home screen after the visit */
  const AFTERCARE = {
    rct: { days: 14, title: ['After your root canal', 'دوای چارەسەری ڕەگ'],
      normal: [['Tenderness when biting for 2–3 days', 'هەستیاری لە کاتی گەستندا بۆ ٢–٣ ڕۆژ'], ['A dull ache that gets better each day', 'ئازارێکی کەم کە ڕۆژ بە ڕۆژ کەم دەبێتەوە']],
      do: [['Take the pain relief as prescribed', 'دەرمانی ئازار وەک ڕەچەتەکە بخۆ'], ['Chew on the other side until the crown is fitted', 'تا کراونەکە دادەنرێت بە لایەکەی تر بجوو'], ['Brush and floss as usual, gently around the tooth', 'وەک هەمیشە ددان بشۆ و دەزوو بەکاربهێنە، بە نەرمی لە دەوری ددانەکە']],
      avoid: [['Hard or sticky food on that side', 'خواردنی ڕەق یان چەسپاو لەو لایە'], ['Leaving the tooth without a crown for months', 'هێشتنەوەی ددانەکە بەبێ کراون بۆ چەند مانگێک']],
      call: [['Swelling of the face or gum', 'ئاوسانی ڕوخسار یان پووک'], ['Pain that gets worse after 3 days', 'ئازار کە دوای ٣ ڕۆژ خراپتر دەبێت'], ['The temporary filling falls out', 'پڕکردنەوە کاتییەکە دەکەوێت']] },
    ext: { days: 7, title: ['After your extraction', 'دوای هەڵکێشانی ددان'],
      normal: [['Some bleeding for the first few hours', 'کەمێک خوێنبەربوون لە چەند کاتژمێری یەکەمدا'], ['Mild swelling for 2–3 days', 'ئاوسانێکی کەم بۆ ٢–٣ ڕۆژ']],
      do: [['Bite on the gauze for 30–45 minutes', 'بۆ ٣٠–٤٥ خولەک گاز لەسەر پەڕۆکە بگرە'], ['Use a cold pack on the cheek the first day', 'ڕۆژی یەکەم شتی سارد لەسەر ڕوومەت دابنێ'], ['Eat soft, cool food', 'خواردنی نەرم و فێنک بخۆ']],
      avoid: [['Rinsing, spitting or using a straw for 24 hours', 'غەرغەرە، تفکردن یان قامیش بۆ ٢٤ کاتژمێر'], ['Smoking for at least 3 days', 'جگەرەکێشان بۆ لانیکەم ٣ ڕۆژ'], ['Hot drinks on the first day', 'خواردنەوەی گەرم لە ڕۆژی یەکەمدا']],
      call: [['Bleeding that does not stop after 1 hour of pressure', 'خوێنبەربوون کە دوای یەک کاتژمێر گوشار نەوەستێت'], ['Strong pain on day 3–4', 'ئازاری بەهێز لە ڕۆژی ٣–٤'], ['Fever', 'تا']] },
    implant: { days: 14, title: ['After your implant', 'دوای ئیمپلانت'],
      normal: [['Swelling and bruising for a few days', 'ئاوسان و شینبوونەوە بۆ چەند ڕۆژێک'], ['Slight bleeding on the first day', 'کەمێک خوێنبەربوون لە ڕۆژی یەکەمدا']],
      do: [['Take all the antibiotics, even if you feel well', 'هەموو دژەزیندەکان بخۆ، تەنانەت ئەگەر باشیش بیت'], ['Rinse gently with salt water from day 2', 'لە ڕۆژی دووەمەوە بە نەرمی بە ئاوی خوێ غەرغەرە بکە'], ['Keep the area very clean', 'شوێنەکە زۆر پاک ڕابگرە']],
      avoid: [['Chewing on the implant until the doctor says', 'جوین لەسەر ئیمپلانتەکە تا دکتۆر ڕێگە دەدات'], ['Smoking — it is the main reason implants fail', 'جگەرەکێشان — هۆکاری سەرەکی شکستی ئیمپلانتە']],
      call: [['Swelling that grows after day 3', 'ئاوسان کە دوای ڕۆژی ٣ زیاد دەکات'], ['The implant feels loose', 'هەست بکەیت ئیمپلانتەکە دەجووڵێت'], ['Fever or bad taste', 'تا یان تامێکی ناخۆش']] },
    white: { days: 3, title: ['After whitening', 'دوای سپیکردنەوە'],
      normal: [['Sensitive teeth for 1–2 days', 'هەستیاری ددان بۆ ١–٢ ڕۆژ']],
      do: [['Eat “white” food for 48 hours: rice, chicken, yoghurt', 'بۆ ٤٨ کاتژمێر خواردنی «سپی» بخۆ: برنج، مریشک، ماست'], ['Use sensitive toothpaste', 'ددانشۆری تایبەت بە هەستیاری بەکاربهێنە']],
      avoid: [['Tea, coffee, cola and smoking for 48 hours', 'چا، قاوە، کۆلا و جگەرە بۆ ٤٨ کاتژمێر'], ['Very cold or very hot drinks', 'خواردنەوەی زۆر سارد یان زۆر گەرم']],
      call: [['Sensitivity that lasts more than a week', 'هەستیاری کە زیاتر لە هەفتەیەک بمێنێتەوە']] },
    fill: { days: 3, title: ['After your filling', 'دوای پڕکردنەوە'],
      normal: [['The numbness lasts 2–3 hours', 'سڕبوون ٢–٣ کاتژمێر دەمێنێتەوە'], ['Mild sensitivity to cold for a few days', 'هەستیارییەکی کەم بەرامبەر سارد بۆ چەند ڕۆژێک']],
      do: [['Wait until the numbness is gone before eating', 'تا سڕبوونەکە نەڕوات نان مەخۆ']],
      avoid: [['Biting your cheek or lip while numb', 'گەستنی ڕوومەت یان لێو لە کاتی سڕبووندا']],
      call: [['The bite feels high or uneven after a day', 'دوای ڕۆژێک هەست بکەیت ددانەکە بەرزە یان ڕێک نییە']] },
    clean: { days: 2, title: ['After your cleaning', 'دوای پاککردنەوە'],
      normal: [['Gums may be a little sore or bleed slightly', 'لەوانەیە پووکەکان کەمێک ئازاریان هەبێت یان کەمێک خوێن بکەن']],
      do: [['Brush twice a day for 2 minutes', 'ڕۆژانە دوو جار بۆ ٢ خولەک ددان بشۆ'], ['Floss once a day', 'ڕۆژانە یەکجار دەزوو بەکاربهێنە']],
      avoid: [['Skipping the next check-up in 6 months', 'پشتگوێخستنی پشکنینی داهاتوو دوای ٦ مانگ']],
      call: [['Bleeding gums that continue for more than a week', 'خوێنبەربوونی پووک کە زیاتر لە هەفتەیەک بەردەوام بێت']] },
    crown: { days: 7, title: ['After your crown or veneer', 'دوای کراون یان ڤینیەر'],
      normal: [['It may feel a little strange for a few days', 'لەوانەیە بۆ چەند ڕۆژێک کەمێک نامۆ بێت']],
      do: [['Clean around it like your natural teeth', 'وەک ددانی سروشتی دەوری پاک بکەرەوە']],
      avoid: [['Biting ice, nuts or opening things with your teeth', 'گەستنی سەهۆڵ، چەرەز یان کردنەوەی شت بە ددان']],
      call: [['It feels loose or the bite is uneven', 'هەست بکەیت دەجووڵێت یان ڕێک نییە']] },
    ortho: { days: 7, title: ['Life with braces or aligners', 'ژیان لەگەڵ تەل یان ئەلاینەر'],
      normal: [['Teeth feel tight or sore for 3–5 days after each adjustment', 'ددانەکان بۆ ٣–٥ ڕۆژ دوای هەر ڕێکخستنێک توند یان بەئازار دەبن']],
      do: [['Wear aligners 22 hours a day', 'ڕۆژانە ٢٢ کاتژمێر ئەلاینەر لەبەر بکە'], ['Brush after every meal', 'دوای هەر ژەمێک ددان بشۆ'], ['Use orthodontic wax on sharp parts', 'مۆمی ئۆرتۆ لەسەر بەشە تیژەکان دابنێ']],
      avoid: [['Hard, sticky and chewy food', 'خواردنی ڕەق، چەسپاو و جوینی زۆر'], ['Eating or drinking sugary drinks with aligners in', 'خواردن یان خواردنەوەی شیرین بە ئەلاینەرەوە']],
      call: [['A wire is poking your cheek', 'تەلێک ڕوومەتت دەڕووشێنێت'], ['A bracket comes off', 'پارچەیەک دەکەوێتەوە']] }
  };
  const CARE_OF = { rct: 'rct', ext: 'ext', implant: 'implant', white: 'white', veneer: 'crown', crown: 'crown', fill: 'fill', clean: 'clean', braces: 'ortho', aligner: 'ortho' };

  /* ---------- health library (editable in admin) ----------
     body: list of paragraphs [en, ku]; a paragraph that starts with "• " is shown as a bullet */
  const LIBRARY = [
    { id: 'brush', cat: 'daily', mins: 2, art: 'clean', title: ['How to brush properly', 'چۆن بە دروستی ددان بشۆیت'],
      body: [
        ['Most people brush for less than a minute. Two full minutes, twice a day, is what keeps teeth and gums healthy.', 'زۆربەی خەڵک کەمتر لە یەک خولەک ددان دەشۆن. دوو خولەکی تەواو، ڕۆژانە دوو جار، ئەوەیە کە ددان و پووک بە تەندروستی دەهێڵێتەوە.'],
        ['• Use a soft brush and a pea-sized amount of fluoride toothpaste.', '• فڵچەیەکی نەرم و بڕێک ددانشۆری فلۆرایددار بە قەبارەی نۆکێک بەکاربهێنە.'],
        ['• Hold the brush at 45° to the gum line and use small circles.', '• فڵچەکە بە گۆشەی ٤٥ پلە بەرامبەر هێڵی پووک بگرە و بازنەی بچووک بکە.'],
        ['• Brush the outside, the inside and the chewing surfaces of every tooth.', '• دەرەوە، ناوەوە و ڕووی جوینی هەموو ددانێک بشۆ.'],
        ['• Spit out the foam but do not rinse with water — the fluoride keeps working.', '• کەفەکە تف بکەرەوە بەڵام بە ئاو مەیشۆ — فلۆرایدەکە بەردەوام کار دەکات.'],
        ['Change your brush every three months, or sooner if the bristles are bent.', 'هەر سێ مانگ جارێک فڵچەکەت بگۆڕە، یان زووتر ئەگەر تاڵەکانی چەمابوونەوە.']
      ] },
    { id: 'floss', cat: 'daily', mins: 2, art: 'clean', title: ['Why flossing matters', 'بۆچی دەزووی ددان گرنگە'],
      body: [
        ['A toothbrush cannot reach between the teeth. That is where most cavities in adults start, and where gum disease begins.', 'فڵچە ناگاتە نێوان ددانەکان. زۆربەی کونبوونی ددانی گەورەکان و نەخۆشی پووک لەوێوە دەست پێ دەکات.'],
        ['• Floss once a day, before brushing at night.', '• ڕۆژانە یەکجار، پێش ددانشۆردنی شەو، دەزوو بەکاربهێنە.'],
        ['• Curve the floss around each tooth in a C shape and slide it gently under the gum.', '• دەزووەکە بە شێوەی C بە دەوری هەر ددانێکدا بچەمێنەوە و بە نەرمی بیبە ژێر پووک.'],
        ['• A little bleeding in the first week is normal. It stops as the gums get healthier.', '• کەمێک خوێنبەربوون لە هەفتەی یەکەمدا ئاساییە. کە پووکەکان تەندروستتر بوون دەوەستێت.'],
        ['If floss is hard to use, ask us about interdental brushes or a water flosser.', 'ئەگەر بەکارهێنانی دەزوو قورسە، پرسیارمان لێ بکە دەربارەی فڵچەی نێوان ددان یان دەزووی ئاوی.']
      ] },
    { id: 'kids', cat: 'kids', mins: 3, art: 'kid', title: ['Your child’s first dental visit', 'یەکەم سەردانی منداڵەکەت بۆ ددانساز'],
      body: [
        ['The first visit should be around the first birthday, or when the first tooth appears. Early visits are short and friendly.', 'یەکەم سەردان باشترە نزیکەی یەکەم ساڵڕۆژی بێت، یان کاتێک یەکەم ددان دەردەچێت. سەردانە سەرەتاییەکان کورت و دۆستانەن.'],
        ['• Talk about the visit in a positive way. Avoid words like “pain” or “injection”.', '• بە شێوەیەکی ئەرێنی باسی سەردانەکە بکە. وشەی وەک «ئازار» یان «دەرزی» بەکارمەهێنە.'],
        ['• Book a morning or after-nap time, when your child is rested.', '• کاتێکی بەیانی یان دوای خەو هەڵبژێرە کە منداڵەکەت پشووی داوە.'],
        ['• Bring their favourite toy. Sitting on your lap is fine.', '• یاریی دڵخوازی لەگەڵ خۆت بهێنە. دانیشتنی لەسەر کۆشی تۆ ئاساییە.'],
        ['Children need help brushing until about age 8. Use a smear of toothpaste under 3, and a pea-sized amount after.', 'منداڵ تا نزیکەی تەمەنی ٨ ساڵ پێویستی بە یارمەتی هەیە بۆ ددانشۆردن. لە خوار ٣ ساڵ کەمێکی زۆر کەم و دوای ئەوە بە قەبارەی نۆکێک ددانشۆر بەکاربهێنە.']
      ] },
    { id: 'gums', cat: 'health', mins: 3, art: 'root', title: ['Bleeding gums: what they mean', 'خوێنبەربوونی پووک: واتای چییە'],
      body: [
        ['Bleeding when you brush is usually the first sign of gum inflammation (gingivitis). It is common, and it can be reversed.', 'خوێنبەربوون لە کاتی ددانشۆردندا زۆرجار یەکەم نیشانەی هەوکردنی پووکە. بڵاوە و دەکرێت چاک بکرێتەوە.'],
        ['• Keep brushing and flossing gently — stopping makes it worse.', '• بە نەرمی بەردەوام بە لە ددانشۆردن و دەزوو — وازهێنان خراپتری دەکات.'],
        ['• Book a cleaning: hard tartar can only be removed at the clinic.', '• نۆرەی پاککردنەوە بگرە: چەوری ڕەق تەنها لە کلینیک لادەبرێت.'],
        ['• Smoking hides the bleeding but damages the gums faster.', '• جگەرەکێشان خوێنبەربوونەکە دەشارێتەوە بەڵام پووکەکان خێراتر تێکدەدات.'],
        ['See us soon if your gums are receding, your teeth feel loose, or you have bad breath that does not go away.', 'ئەگەر پووکەکانت دەکشێنەوە، ددانەکانت دەجووڵێن یان بۆنی ناخۆشی دەمت نەڕوات، زوو سەردانمان بکە.']
      ] },
    { id: 'white', cat: 'cosmetic', mins: 2, art: 'white', title: ['Whitening: facts and myths', 'سپیکردنەوە: ڕاستی و ئەفسانە'],
      body: [
        ['Professional whitening is safe when it is planned by a dentist. Whitening toothpastes only remove surface stains.', 'سپیکردنەوەی پیشەیی سەلامەتە کاتێک ددانسازێک پلانی بۆ دادەنێت. ددانشۆری سپیکەرەوە تەنها ڕەنگی سەر ڕووی ددان لادەبات.'],
        ['• Myth: whitening weakens teeth. Fact: it does not damage the enamel when done properly.', '• ئەفسانە: سپیکردنەوە ددان لاواز دەکات. ڕاستی: ئەگەر بە دروستی بکرێت زیان بە مینای ددان ناگەیەنێت.'],
        ['• Fillings and crowns do not change colour, so we check them before we start.', '• پڕکردنەوە و کراون ڕەنگیان ناگۆڕێت، بۆیە پێش دەستپێکردن سەیریان دەکەین.'],
        ['• Lemon, baking soda and charcoal can wear the enamel away. Avoid them.', '• لیمۆ، کاربۆنات و خەڵوز دەتوانن مینای ددان بسوون. بەکاریان مەهێنە.'],
        ['The result lasts one to three years, longer if you limit tea, coffee and smoking.', 'ئەنجامەکە یەک بۆ سێ ساڵ دەمێنێتەوە، و زیاتر ئەگەر چا، قاوە و جگەرە کەم بکەیتەوە.']
      ] },
    { id: 'knocked', cat: 'emergency', mins: 2, art: 'ext', title: ['A tooth was knocked out — what to do', 'ددانێک کەوت — چی بکەیت'],
      body: [
        ['Act fast. An adult tooth can often be saved if it is put back within 30–60 minutes.', 'خێرا بە. ددانی گەورەکان زۆرجار دەپارێزرێت ئەگەر لە ماوەی ٣٠–٦٠ خولەکدا بگەڕێنرێتەوە شوێنی خۆی.'],
        ['• Pick it up by the crown (the white part), never by the root.', '• لە تاجەکەیەوە (بەشە سپییەکە) هەڵیبگرە، هەرگیز لە ڕەگەکەیەوە نا.'],
        ['• If it is dirty, rinse it briefly in milk. Do not scrub it.', '• ئەگەر پیس بوو، بۆ ماوەیەکی کورت بە شیر بیشۆ. مەیسوو.'],
        ['• Keep it in milk or inside the cheek — not in water, not dry.', '• لە ناو شیر یان لە ناو دەم لە نێوان ڕوومەتدا هەڵیبگرە — نەک لە ئاودا، نەک وشک.'],
        ['• Call us immediately and come straight to the clinic.', '• یەکسەر پەیوەندیمان پێوە بکە و ڕاستەوخۆ وەرە کلینیک.'],
        ['Baby teeth are not put back. Bring your child in so we can check the area.', 'ددانی شیری ناگەڕێنرێتەوە. منداڵەکەت بهێنە تا شوێنەکە بپشکنین.']
      ] }
  ];
  const LIB_CATS = [['daily', 'Everyday care', 'چاودێری ڕۆژانە'], ['kids', 'Children', 'منداڵان'], ['health', 'Gums & health', 'پووک و تەندروستی'], ['cosmetic', 'Cosmetic', 'جوانکاری'], ['emergency', 'Emergencies', 'فریاکەوتن']];
  const REFERRAL = { on: true, pct: 10, note: ['Your friend gets 10% off their first visit. You get 10% off your next visit once they come.', 'هاوڕێکەت ١٠٪ داشکاندن لە یەکەم سەردانی وەردەگرێت. کە هات، تۆش ١٠٪ داشکاندن لە سەردانی داهاتووت وەردەگریت.'] };

  /* ---------- help & legal (editable in admin) ---------- */
  const FAQ = [
    { cat: 'book', q: ['How do I book, change or cancel a visit?', 'چۆن نۆرە بگرم، بیگۆڕم یان هەڵیبوەشێنمەوە؟'], a: ['Tap the green + button and follow the four steps. To change or cancel, open My visits and use the buttons on the visit. Please cancel at least 24 hours before so someone else can take the time.', 'دوگمەی سەوزی + دابگرە و چوار هەنگاوەکە تەواو بکە. بۆ گۆڕین یان هەڵوەشاندنەوە، بچۆ «نۆرەکانم» و دوگمەکانی سەر نۆرەکە بەکاربهێنە. تکایە لانیکەم ٢٤ کاتژمێر پێشتر هەڵیبوەشێنەوە تا کەسێکی تر بتوانێت کاتەکە بگرێت.'] },
    { cat: 'book', q: ['Why is my visit “waiting for confirmation”?', 'بۆچی نۆرەکەم «چاوەڕوانی پشتڕاستکردنەوە»یە؟'], a: ['Reception checks every new request against the doctor’s diary. You will get a notification as soon as it is confirmed — usually within an hour during opening times.', 'پێشوازی هەموو داواکارییەکی نوێ لەگەڵ خشتەی دکتۆر بەراورد دەکات. هەر کە پشتڕاستکرایەوە ئاگادار دەکرێیتەوە — زۆرجار لە ماوەی یەک کاتژمێردا لە کاتی دەوامدا.'] },
    { cat: 'book', q: ['What if I am late?', 'ئەگەر دواکەوتم چی؟'], a: ['Let us know in the chat or by phone. If you are more than 15 minutes late we may need to move your visit so other patients are not kept waiting.', 'لە چات یان بە تەلەفۆن ئاگادارمان بکەرەوە. ئەگەر زیاتر لە ١٥ خولەک دواکەویت، لەوانەیە ناچار بین نۆرەکەت بگوازینەوە تا نەخۆشەکانی تر چاوەڕێ نەکەن.'] },
    { cat: 'pay', q: ['Can I pay in instalments?', 'دەتوانم بە قیست پارە بدەم؟'], a: ['Yes. Larger treatments can be split into instalments. You can pay each one in the app with FIB, FastPay, ZainCash or a card, or at reception.', 'بەڵێ. چارەسەرە گەورەکان دەکرێت دابەش بکرێن بە قیست. دەتوانیت هەر قیستێک لە ئەپەکەدا بە FIB، FastPay، ZainCash یان کارت بدەیت، یان لە پێشوازی.'] },
    { cat: 'pay', q: ['Are the prices in the app final?', 'ئایا نرخەکانی ناو ئەپ کۆتایین؟'], a: ['Prices shown are “from” prices. The doctor confirms the exact cost after examining you, and you always see a treatment plan with the cost before anything starts.', 'ئەو نرخانەی پیشان دەدرێن نرخی «لە»ن. دکتۆر دوای پشکنین تێچووی ڕاستەقینە دیاری دەکات، و هەمیشە پێش دەستپێکردن پلانێکی چارەسەر بە تێچووەکەیەوە دەبینیت.'] },
    { cat: 'acct', q: ['How do I add my children?', 'چۆن منداڵەکانم زیاد بکەم؟'], a: ['Open Profile → Family members → Add. Each person keeps their own file, and you can switch between them at the top of the screen.', 'بچۆ پرۆفایل ← ئەندامانی خێزان ← زیادکردن. هەر کەسێک پەڕگەی خۆی دەبێت، و لە سەرەوەی شاشەکە دەتوانیت لە نێوانیاندا بگوازیتەوە.'] },
    { cat: 'acct', q: ['Who can see my medical file?', 'کێ دەتوانێت پەڕگە پزیشکییەکەم ببینێت؟'], a: ['Only you, your doctor and the clinic staff who need it for your care. You can turn on the app lock in Profile, download your data, or delete your account at any time.', 'تەنها خۆت، دکتۆرەکەت و ئەو ستافەی کلینیک کە بۆ چارەسەرکردنت پێویستیانە. لە پرۆفایل دەتوانیت قفڵی ئەپ چالاک بکەیت، زانیارییەکانت دابگریت یان هەر کاتێک ئەکاونتەکەت بسڕیتەوە.'] },
    { cat: 'app', q: ['I am not getting reminders', 'بیرخستنەوەکان پێم ناگەن'], a: ['Check that Appointment reminders is on in Profile and that WhatsApp messages from the clinic are not blocked. Reminders are sent the day before your visit.', 'دڵنیا بەرەوە کە «بیرخستنەوەی نۆرە» لە پرۆفایل چالاکە و نامەکانی کلینیک لە واتسئاپ بلۆک نەکراون. بیرخستنەوە ڕۆژێک پێش سەردانەکەت دەنێردرێت.'] },
    { cat: 'app', q: ['Does the app work without internet?', 'ئەپەکە بەبێ ئینتەرنێت کار دەکات؟'], a: ['Yes, you can open the app and see your saved visits, prescriptions and card without internet. Booking and paying need a connection.', 'بەڵێ، بەبێ ئینتەرنێت دەتوانیت ئەپەکە بکەیتەوە و نۆرە، ڕەچەتە و کارتەکەت ببینیت. نۆرەگرتن و پارەدان پێویستیان بە ئینتەرنێتە.'] }
  ];
  const FAQ_CATS = [['book', 'Booking & visits', 'نۆرە و سەردان'], ['pay', 'Payments', 'پارەدان'], ['acct', 'Account & family', 'ئەکاونت و خێزان'], ['app', 'Using the app', 'بەکارهێنانی ئەپ']];
  const LEGAL = {
    updated: '2026-10-01',
    privacy: [
      ['This notice explains what information Bite for Dentistry keeps about you in this app and how we use it.', 'ئەم ڕوونکردنەوەیە دەڵێت Bite for Dentistry چ زانیارییەکت لەم ئەپەدا هەڵدەگرێت و چۆن بەکاری دەهێنێت.'],
      ['• What we keep: your name, mobile number, date of birth, the people in your family account, your visits, treatment plans, prescriptions, x-rays, bills and the messages you send us.', '• چی هەڵدەگرین: ناو، ژمارەی مۆبایل، بەرواری لەدایکبوون، ئەندامانی خێزان لە ئەکاونتەکەت، سەردانەکان، پلانی چارەسەر، ڕەچەتە، تیشک، پسوولە و ئەو نامانەی بۆمان دەنێریت.'],
      ['• Why: to book and run your visits, to treat you safely, to send reminders you asked for, and to keep the medical records the law requires.', '• بۆچی: بۆ گرتن و بەڕێوەبردنی سەردانەکانت، چارەسەرکردنت بە سەلامەتی، ناردنی ئەو بیرخستنەوانەی داوات کردووە، و هەڵگرتنی ئەو تۆمارە پزیشکییانەی یاسا داوای دەکات.'],
      ['• Who sees it: your doctors and the clinic staff who need it. We never sell your information and never use it for advertising by others.', '• کێ دەیبینێت: دکتۆرەکانت و ئەو ستافەی کلینیک کە پێویستیانە. هەرگیز زانیارییەکانت نافرۆشین و بۆ ڕیکلامی کەسانی تر بەکاری ناهێنین.'],
      ['• Your choices: you can download a copy of your data, correct it, turn off offers, or delete your app account at any time from Profile.', '• هەڵبژاردنەکانت: هەر کاتێک لە پرۆفایلەوە دەتوانیت کۆپییەکی زانیارییەکانت دابگریت، ڕاستی بکەیتەوە، داشکاندن و هەواڵ بکوژێنیتەوە، یان ئەکاونتی ئەپەکەت بسڕیتەوە.'],
      ['• How long: medical records are kept for the period required by law. App-only data (like settings) is removed when you delete your account.', '• بۆ چەند ماوە: تۆمارە پزیشکییەکان بۆ ئەو ماوەیەی یاسا داوای دەکات هەڵدەگیرێن. زانیارییە تایبەتەکانی ئەپ (وەک ڕێکخستنەکان) کاتی سڕینەوەی ئەکاونت لادەبرێن.'],
      ['Questions? Write to us in the chat or call the clinic.', 'پرسیارت هەیە؟ لە چات بۆمان بنووسە یان پەیوەندی بە کلینیکەوە بکە.']
    ],
    terms: [
      ['By using this app you agree to these terms.', 'بە بەکارهێنانی ئەم ئەپە ڕەزامەندی لەسەر ئەم مەرجانە دەدەیت.'],
      ['• The app helps you manage visits and see your records. It does not replace an examination by a dentist.', '• ئەپەکە یارمەتیت دەدات سەردانەکانت بەڕێوە ببەیت و تۆمارەکانت ببینیت. جێگەی پشکنینی ددانساز ناگرێتەوە.'],
      ['• Guides and tips in the app are general advice. Always follow the instructions your doctor gives you.', '• ڕێنمایی و ئامۆژگارییەکانی ناو ئەپ ئامۆژگاری گشتین. هەمیشە ئەو ڕێنماییانە جێبەجێ بکە کە دکتۆرەکەت پێت دەدات.'],
      ['• In an emergency, call the clinic or go to the nearest emergency department. Do not wait for a reply in the chat.', '• لە کاتی فریاکەوتندا پەیوەندی بە کلینیکەوە بکە یان بچۆ نزیکترین فریاکەوتن. چاوەڕێی وەڵامی چات مەکە.'],
      ['• Please cancel at least 24 hours before your visit. Repeated missed visits may mean we ask for a deposit to book.', '• تکایە لانیکەم ٢٤ کاتژمێر پێش سەردان هەڵیبوەشێنەوە. ئەگەر چەند جار نەهاتیت، لەوانەیە بۆ نۆرەگرتن داوای پێشەکی بکەین.'],
      ['• Keep your phone and PIN private. You are responsible for the family members you add to your account.', '• مۆبایل و پینەکەت بە نهێنی بهێڵەوە. تۆ بەرپرسیاری ئەو ئەندامانەی خێزانیت کە زیادیان دەکەیت.']
    ]
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
  const DEFAULTS = clone({ SERVICES, DOCTORS, REVIEWS, PROMOS, CLINIC, TILES, AFTERCARE, LIBRARY, REFERRAL, FAQ, LEGAL });
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
    if (c.tiles) Object.assign(TILES, c.tiles);
    if (Array.isArray(c.library)) { LIBRARY.length = 0; c.library.forEach((x) => LIBRARY.push(x)); }
    if (c.referral) Object.assign(REFERRAL, c.referral);
    if (Array.isArray(c.faq)) { FAQ.length = 0; c.faq.forEach((x) => FAQ.push(x)); }
    if (c.legal) Object.assign(LEGAL, c.legal);
    if (c.aftercare) Object.keys(c.aftercare).forEach((k) => { if (AFTERCARE[k] && c.aftercare[k]) Object.assign(AFTERCARE[k], c.aftercare[k]); });
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

  /* ---------- clinic colour + logo (from admin) ---------- */
  const hex = (h) => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); return /^[0-9a-f]{6}$/i.test(h) ? [0, 2, 4].map((k) => parseInt(h.substr(k, 2), 16)) : null; };
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (c, w, t) => c.map((v, k) => v + (w[k] - v) * t);
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  function palette(h) {
    const b = hex(h); if (!b) return null;
    const W = [255, 255, 255], K = [0, 0, 0];
    let b2 = mix(b, K, 0.2);
    while (lum(b2) > 0.22) b2 = mix(b2, K, 0.08); /* keep white text readable on buttons */
    return {
      '--mint': toHex(b), '--mint-2': toHex(b2), '--mint-d': toHex(mix(b2, K, 0.25)), '--mint-3': toHex(mix(b, K, lum(b) > 0.3 ? 0.62 : 0.4)),
      '--mint-bg': toHex(mix(b, W, 0.86)), '--mint-bg2': toHex(mix(b, W, 0.94)), '--mint-line': toHex(mix(b, W, 0.7)), '--mint-lt': toHex(mix(b, W, 0.45)),
      '--mint-ink': lum(b) > 0.4 ? toHex(mix(b, K, 0.8)) : '#ffffff', '--mint-rgb': b.join(','), '--mint-rgb2': b2.map(Math.round).join(',')
    };
  }
  function applyBrand() {
    const p = palette(CLINIC.brand); if (!p || String(CLINIC.brand).toLowerCase() === '#67cdab') return;
    Object.keys(p).forEach((k) => document.documentElement.style.setProperty(k, p[k]));
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', '#F3F6F8');
  }
  if (typeof document !== 'undefined') applyBrand();
  if (CLINIC.logo && window.ART) { const L = CLINIC.logo; window.ART.logo = (s) => '<img class="logo" src="' + L + '" width="' + (s || 40) + '" height="' + (s || 40) + '" alt="">'; }

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
    const ar = lang === 'ar', arT = window.arT || ((x) => x);
    const L = (en, k) => (ku ? k : ar ? arT(en) : en);
    const appts = [
      { id: 'a1', svc: 'clean', doc: 'd5', date: workday(addDays(T, -190), 'd5', -1), time: '17:00', status: 'done', rated: 5, reason: L('Routine 6-month check-up and cleaning', 'پشکنین و پاککردنەوەی ئاسایی هەر ٦ مانگ جارێک') },
      { id: 'a2', svc: 'consult', doc: 'd1', date: workday(addDays(T, -31), 'd1', -1), time: '18:30', status: 'done', note: L('Pain on the lower left', 'ئازار لە لای چەپی خوارەوە'), reason: L('Pain when chewing on the lower left', 'ئازار لە کاتی جوین لە لای چەپی خوارەوە') },
      { id: 'a3', svc: 'rct', doc: 'd1', date: workday(addDays(T, -24), 'd1', -1), time: '16:00', status: 'done', step: [1, 3], reason: L('Opening and cleaning the canals of tooth 36', 'کردنەوە و پاککردنەوەی ڕەگەکانی ددانی ٣٦') },
      { id: 'a4', svc: 'rct', doc: 'd1', date: workday(addDays(T, -4), 'd1', -1), time: '17:30', status: 'done', step: [2, 3], reason: L('Changing the medicine inside the tooth', 'گۆڕینی دەرمانی ناو ددانەکە') },
      { id: 'a5', svc: 'rct', doc: 'd1', date: workday(T, 'd1'), time: '17:30', status: 'confirmed', step: [3, 3], reason: L('Final filling of the canals', 'پڕکردنەوەی کۆتایی ڕەگەکان') }
    ];
    return {
      v: 2, lang,
      profile: { name: L('Lana Ahmed', 'لانا ئەحمەد'), phone: '0750 123 4567', email: 'lana@example.com', dob: '1996-04-18', file: 1042, gender: 'f', blood: 'A+', allergies: [L('Penicillin', 'پەنسلین')] },
      appts,
      plan: [
        { id: 'pl1', title: L('Root canal · tooth 36', 'چارەسەری ڕەگ · ددانی ٣٦'), done: 2, total: 3, doc: 'd1', status: 'active', accepted: appts[1].date,
          items: [[L('Root canal treatment · tooth 36 (3 visits)', 'چارەسەری ڕەگ · ددانی ٣٦ (٣ سەردان)'), 450000]], cost: 450000, pay: 3 },
        { id: 'pl2', title: L('Zirconia crown · tooth 36', 'کراونی زیرکۆنیا · ددانی ٣٦'), done: 0, total: 2, doc: 'd2', status: 'proposed', sent: addDays(T, -2),
          why: L('After a root canal the tooth becomes weaker. A crown covers and protects it so it does not crack when you chew.', 'دوای چارەسەری ڕەگ ددانەکە لاوازتر دەبێت. کراون دایدەپۆشێت و دەیپارێزێت بۆ ئەوەی لە کاتی جویندا نەشکێت.'),
          items: [[L('Digital scan and shade matching', 'سکانی دیجیتاڵ و هەڵبژاردنی ڕەنگ'), 0], [L('Temporary crown', 'کراونی کاتی'), 0], [L('Zirconia crown · tooth 36', 'کراونی زیرکۆنیا · ددانی ٣٦'), 600000]], cost: 600000, pay: 3 }
      ],
      teeth: { 36: 'rct', 26: 'fill', 47: 'fill', 18: 'missing', 28: 'missing' },
      rx: [
        { id: 'rx1', date: appts[3].date, doc: 'd1', meds: [
          { n: 'Clindamycin 300 mg', d: L('1 capsule · 3 times a day · 7 days', '١ کەپسول · ٣ جار لە ڕۆژێکدا · ٧ ڕۆژ'), f: 3, days: 7 },
          { n: 'Ibuprofen 400 mg', d: L('1 tablet when needed · max 3 a day · after food', '١ حەب لە کاتی پێویستدا · زۆرترین ٣ جار · دوای نان'), prn: true },
          { n: 'Chlorhexidine 0.12%', d: L('Rinse 15 ml · twice a day · 10 days', '١٥ ملل غەرغەرە · ٢ جار لە ڕۆژێکدا · ١٠ ڕۆژ'), f: 2, days: 10 }
        ], advice: L('Avoid chewing on the left side until the crown is fitted.', 'تا کراونەکە دادەنرێت، بە لای چەپ مەجوو.') },
        { id: 'rx2', date: appts[0].date, doc: 'd5', meds: [
          { n: 'Fluoride toothpaste 1450 ppm', d: L('Twice a day · spit, don\'t rinse', '٢ جار لە ڕۆژێکدا · تف بکە، مەیشۆ'), f: 2, days: 0 }
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
        { me: false, t: L('Hello Lana 🌿 Welcome to Bite. How can we help you today?', 'سڵاو لانا 🌿 بەخێربێیت بۆ Bite. ئەمڕۆ چۆن یارمەتیت بدەین؟'), at: addDays(T, -4) + 'T18:40' },
        { me: true, t: L('Hi, my tooth feels sensitive after the visit, is that normal?', 'سڵاو، دوای سەردانەکە ددانەکەم هەستیارە، ئاساییە؟'), at: addDays(T, -3) + 'T10:12' },
        { me: false, t: L('Yes, some sensitivity for 2–3 days is normal after a root canal. Take the ibuprofen as prescribed. If it gets worse, call us and Dr. Aras will see you.', 'بەڵێ، هەستیاری بۆ ٢–٣ ڕۆژ دوای چارەسەری ڕەگ ئاساییە. ئیبوپرۆفینەکە وەک ڕەچەتەکە بخۆ. ئەگەر خراپتر بوو پەیوەندیمان پێوە بکە و د. ئاراس دەتبینێت.'), at: addDays(T, -3) + 'T10:20' }
      ],
      active: 'me',
      members: [{ id: 'me', rel: 'self' }, { id: 'kid1', rel: 'child', demo: true,
        profile: { name: L('Aram Ahmed', 'ئارام ئەحمەد'), phone: '0750 123 4567', dob: '2017-03-02', file: 1043, gender: 'm', blood: 'O+', allergies: [] },
        data: {
          appts: [
            { id: 'k1', svc: 'kids', doc: 'd5', date: workday(addDays(T, -200), 'd5', -1), time: '16:00', status: 'done', rated: 5, reason: L('First check-up and fluoride', 'یەکەم پشکنین و فلۆراید') },
            { id: 'k2', svc: 'fill', doc: 'd5', date: workday(addDays(T, -40), 'd5', -1), time: '16:30', status: 'done', reason: L('Small cavity on a back tooth', 'کونێکی بچووک لە ددانێکی دواوە') },
            { id: 'k3', svc: 'kids', doc: 'd5', date: workday(addDays(T, 12), 'd5'), time: '16:00', status: 'confirmed', reason: L('6-month check-up', 'پشکنینی ٦ مانگی') }
          ],
          plan: [], teeth: { 16: 'fill' }, rx: [], xrays: [],
          invoices: [{ id: 'INV-2101', date: workday(addDays(T, -40), 'd5', -1), doc: 'd5', items: [[L('White filling', 'پڕکردنەوەی سپی'), 75000]], total: 75000, payments: [[workday(addDays(T, -40), 'd5', -1), 75000, L('Cash', 'نەختینە')]] }],
          extraPay: [], rated: {}
        } }],
      brush: { kid1: [addDays(T, -1), addDays(T, -2), addDays(T, -3), addDays(T, -5)].reduce((o, x) => { o[x] = 2; return o; }, {}) },
      aligner: { me: { kind: 'aligner', tray: 6, total: 20, every: 14, since: addDays(T, -10), out: null, outLog: {} } },
      meds: (function () {
        const st = appts[3].date, days = Math.max(0, Math.round((new Date(T + 'T12:00:00') - new Date(st + 'T12:00:00')) / 864e5));
        const log = (n, miss) => { const o = {}; for (let k = 0; k < days; k++) o[addDays(st, k)] = Array.from({ length: n }, (x, j) => !(miss && k === 1 && j === n - 1)); return o; };
        return [
          { id: 'm1', who: 'me', rx: 'rx1', name: 'Clindamycin 300 mg', how: L('1 capsule', '١ کەپسول'), times: ['08:00', '14:00', '20:00'], start: st, days: 7, log: log(3, true) },
          { id: 'm2', who: 'me', rx: 'rx1', name: 'Chlorhexidine 0.12%', how: L('Rinse 15 ml for 30 seconds', '١٥ ملل بۆ ٣٠ چرکە غەرغەرە بکە'), times: ['09:00', '21:00'], start: st, days: 10, log: log(2, false) }
        ];
      })(),
      waitlist: [], urgent: [],
      refer: { sent: 3, friends: [{ name: ['Shna K.', 'شنە ک.'], came: true }, { name: ['Ari M.', 'ئاری م.'], came: false }] },
      favs: ['d1'], extraPay: [], rated: {},
      settings: { remind: true, offers: true }
    };
  }

  window.DATA = { FAQ, FAQ_CATS, LEGAL, LIBRARY, LIB_CATS, REFERRAL, AFTERCARE, CARE_OF, TILES, CATS, SERVICES, DOCTORS, REVIEWS, PROMOS, CLINIC, build, addDays, ymd, workday, palette, DEFAULTS, THEMES, CORE_DOCS, CORE_SVCS, draft };
})();
