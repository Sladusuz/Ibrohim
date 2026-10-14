(function () {
  'use strict';
  const C = window.BC.core, { esc, I } = C, $ = (s, el = document) => el.querySelector(s);

  C.ready.then((D) => {
    const s = D.settings, w = s.warrantyMonths || 6, car = D.products.find((p) => p.model3d) || D.products[0], hex = car ? C.pColor(car) : '#2b59ff';
    const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    document.documentElement.style.setProperty('--tint', hex);
    $('#main').innerHTML = `<div class="page"><div class="wrap">
      <div class="about-hero"><div><span class="eyebrow" data-r><i></i>Biz haqimizda</span><h1 style="margin-top:22px" data-split>Bolalik uchun yaratilgan texnika.</h1><p data-r>BabyCheer: elektromobil, kalyaska, velokalyaska, mototsikl va samokatlarni bir joyga yig'gan do'kon. Biz har bir modelni oilalarga ishonib tavsiya qila olamiz degan mezon bo'yicha tanlaymiz.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px" data-r><a class="btn" href="shop.html">Katalogni ko'rish ${I.arr}</a><a class="btn glass" href="contact.html">Bog'lanish</a></div></div>
        <div class="emblem" data-r="scale"><i class="r r2"></i><i class="r r1"></i><img src="img/logo.png" alt="BabyCheer logotipi" width="280" height="280"></div></div>

      <section class="sec"><div class="story2"><div><span class="eyebrow" data-r><i></i>Bizning yondashuv</span><h2 style="margin-top:18px" data-split>Ota-ona nigohi bilan tanlaymiz.</h2><p data-r>Katalogdagi har bir mahsulot xavfsizlik, sifat va narx nuqtai nazaridan ko'riladi. Ma'lumotlar ochiq: yosh, yuk ko'tarish, batareya va kafolat har bir sahifada yozilgan.</p><p data-r>Telegram guruhimizdagi 7 600 dan ortiq ota-ona bilan doimiy aloqadamiz. Ularning savollari va fikrlari assortimentni shakllantiradi.</p></div>
        <div class="big-art" data-r="scale">${car ? BC.art(C.artType(car), hex) : ''}</div></div></section>

      <section class="sec"><div class="sec-head"><div><span class="eyebrow"><i></i>Qadriyatlar</span><h2 data-split>Uchta va'da</h2></div></div>
        <div class="values">
          <div class="value" data-r><div class="ico">${ic('<path d="M12 3l8 3v6c0 4.500-3.200 7.800-8 9-4.800-1.200-8-4.500-8-9V6z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>')}</div><h3>Xavfsizlik birinchi</h3><p>Xavfsizlik kamari, ota-ona pulti va past tezlik: bola uchun mos modellarni tanlaymiz.</p></div>
          <div class="value" data-r><div class="ico">${ic('<path d="M12 2v4M12 18v4M4.900 4.900l2.800 2.800M16.300 16.300l2.800 2.800M2 12h4M18 12h4M4.900 19.100l2.800-2.800M16.300 7.700l2.800-2.800"/>')}</div><h3>${w} oylik kafolat</h3><p>Barcha mahsulotlarga rasmiy kafolat. Nuqson bo'lsa, bepul bartaraf etamiz.</p></div>
          <div class="value" data-r><div class="ico">${ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>')}</div><h3>Ochiq muloqot</h3><p>Savollarga Telegram orqali tez javob beramiz. Narx va holat ochiq ko'rsatiladi.</p></div></div></section>

      <section class="sec"><div class="band" data-r><div><b class="num" data-count="${D.products.length}">0</b><span>model katalogda</span></div><div><b class="num" data-count="7600" data-suf="+">0</b><span>ota-ona Telegram guruhida</span></div><div><b class="num" data-count="${w}" data-suf=" oy">0</b><span>rasmiy kafolat muddati</span></div></div></section>

      <section class="sec"><div class="cta" data-r><h2>Keling, tanishamiz.</h2><p>Telegramda yozing yoki qo'ng'iroq qiling. Eng mos modelni birga tanlaymiz.</p>
        <div class="row"><a class="btn wh2" href="${C.tgLink()}" target="_blank" rel="noopener">Telegramda yozish ${I.arr}</a><a class="btn glass" href="contact.html">Bog'lanish sahifasi</a></div></div></section></div></div>`;
    C.observe($('#main'));
  });
})();
