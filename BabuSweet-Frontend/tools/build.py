#!/usr/bin/env python3
"""Generates the static HTML pages (shared header/footer baked in). Run: python3 tools/build.py"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHONE = '+998 33 623 33 13'
ADDR = 'Yangihayot, Sputnik-17, 52a, 100102, Tashkent, Tashkent Region'

SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset=".5" stop-color="#e9b24a"/><stop offset="1" stop-color="#a8721a"/></linearGradient><symbol id="mark" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="18" fill="#1a0e07" stroke="url(#lg)" stroke-width="2.5"/><path d="M17 16l5 6 5-8 5 8 5-6-2 8H19z" fill="url(#lg)"/><text x="32" y="48" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="24" fill="url(#lg)">BS</text></symbol></defs></svg>'''

NAV = [('catalog', 'catalog.html', 'Katalog'), ('about', 'about.html', 'Biz haqimizda'), ('export', 'export.html', 'Eksport'), ('news', 'news.html', 'Yangiliklar'), ('contact', 'contact.html', 'Aloqa')]

ORG = '{"@context":"https://schema.org","@type":"Organization","name":"BabuSweet","telephone":"%s","address":{"@type":"PostalAddress","streetAddress":"Sputnik-17, 52a","addressLocality":"Yangihayot","addressRegion":"Tashkent Region","postalCode":"100102","addressCountry":"UZ"}}' % PHONE


LOADER_JS = '<script>(function(){try{if(!/index\\.html$|\\/$/.test(location.pathname)||sessionStorage.getItem("bs_seen"))document.documentElement.className=""}catch(e){}})()</script>'


def head(page, title, desc):
    return f'''<!doctype html>
<html lang="uz" class="is-loading">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#07050a">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BabuSweet">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/products/kok.webp">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{ORG}</script>
<link rel="icon" href="assets/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
{LOADER_JS}
</head>
<body data-page="{page}">
{SPRITE}
<a class="skip" href="#main" data-t="skip">Asosiy qismga o‘tish</a>
<div class="loader" id="loader" aria-hidden="true"><div class="loader-bg"></div><div class="loader-in"><div class="loader-word">BABU<b>SWEET</b></div><div class="loader-num"><span id="loaderNum">0</span><i>%</i></div></div></div>
<div class="curtain" id="curtain" aria-hidden="true"></div>
<div class="cursor" id="cursor" aria-hidden="true"><span></span></div>
<canvas id="fx" aria-hidden="true"></canvas>
<div class="pbar" id="pbar" aria-hidden="true"></div>
'''


def header(page):
    ACT = ' class="active" aria-current="page"'
    links = ''.join('<a href="%s" data-t="nav.%s"%s>%s</a>' % (h, k, ACT if k == page else '', n) for k, h, n in NAV)
    mlinks = ''.join(f'<a href="{h}" data-t="nav.{k}">{n}</a>' for k, h, n in NAV)
    return f'''<header class="header" id="header">
  <a href="index.html" class="logo" aria-label="BabuSweet"><svg viewBox="0 0 64 64" width="40" height="40"><use href="#mark"/></svg><span>BabuSweet</span></a>
  <nav class="nav" aria-label="Main">{links}</nav>
  <div class="head-tools">
    <div class="lang" id="lang" role="group" aria-label="Language"><button data-lang="uz">UZ</button><button data-lang="ru">RU</button><button data-lang="en">EN</button></div>
    <a class="call js-phone" href="tel:+998336233313" aria-label="Call"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg><span class="call-t">{PHONE}</span></a>
    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <nav><a href="index.html" data-t="nav.home">Bosh sahifa</a>{mlinks}</nav>
  <a class="menu-phone js-phone" href="tel:+998336233313">{PHONE}</a>
</div>
<main id="main">
'''


def footer():
    fl = ''.join(f'<a href="{h}" data-t="nav.{k}">{n}</a>' for k, h, n in NAV)
    return f'''</main>
<footer class="footer" data-header="dark">
  <div class="wrap foot-grid">
    <div class="foot-brand"><a href="index.html" class="logo"><svg viewBox="0 0 64 64" width="44" height="44"><use href="#mark"/></svg><span>BabuSweet</span></a><p data-t="ft.tag">Haqiqiy shokolad. O‘zbekistondan.</p></div>
    <div class="foot-col"><h4 data-t="ft.pages">Sahifalar</h4><a href="index.html" data-t="nav.home">Bosh sahifa</a>{fl}</div>
    <div class="foot-col"><h4 data-t="ft.contact">Aloqa</h4><a class="js-phone" href="tel:+998336233313">{PHONE}</a><span class="js-address">{ADDR}</span><div class="socials" id="socials" hidden></div></div>
  </div>
  <div class="footer-word" aria-hidden="true">BABUSWEET</div>
  <div class="wrap footer-in"><span>© <span id="year"></span> BabuSweet. <span data-t="ft.rights">Barcha huquqlar himoyalangan.</span></span><a href="#top" data-t="ft.top">Yuqoriga ↑</a></div>
</footer>
<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="data/site-data.js"></script>
<script src="js/normalize.js"></script>
<script src="js/lang.js" defer></script>
<script src="js/app.js" defer></script>
</body>
</html>
'''


def page_hero(kicker, title, lead=''):
    return f'''<section class="phero" data-header="dark"><div class="wrap">
  <p class="kicker" data-t="{kicker[0]}">{kicker[1]}</p>
  <h1 class="split" data-t="{title[0]}">{title[1]}</h1>
  {f'<p class="lead" data-t="{lead[0]}">{lead[1]}</p>' if lead else ''}
</div></section>
'''


PAGES = {}

# ---------------------------------------------------------------- HOME
PAGES['index'] = (('home', 'BabuSweet — Shokolad fabrikasi | Chocolate factory | Шоколадная фабрика',
                   'BabuSweet — ichki bozor va eksport uchun shokolad mahsulotlari ishlab chiqaruvchi zamonaviy fabrika. Yangihayot, Toshkent.'), '''
<section class="hero" id="top" data-header="dark">
  <div class="hero-bg" id="heroBg"></div>
  <div class="hero-word" aria-hidden="true">BABUSWEET</div>
  <div class="hero-grid">
    <div class="hero-copy">
      <p class="kicker" data-t="hero.kicker">Shokolad fabrikasi · Toshkent</p>
      <h1 class="hero-h1" id="heroTitle">Real chocolate, made in Uzbekistan</h1>
      <p class="hero-lead" id="heroLead"></p>
      <div class="hero-cta"><a href="catalog.html" class="btn btn-w magnetic"><span data-t="hero.cta1">Katalogni ko‘rish</span><i class="arr">→</i></a><a href="contact.html" class="btn btn-o magnetic"><span data-t="hero.cta2">Hamkorlik</span></a></div>
    </div>
    <div class="stage" id="stage" data-cursor="Boom">
      <div class="disk" id="disk"></div>
      <svg class="badge" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="circ" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs><text><textPath href="#circ" id="badgeText" textLength="468" lengthAdjust="spacing">REAL CHOCOLATE INSIDE • SEA SALT CARAMEL • </textPath></text><circle cx="100" cy="100" r="34"/><text x="100" y="108" text-anchor="middle" class="bs">BS</text></svg>
      <div class="floaters" id="floaters"></div>
      <div class="floor" id="floor"></div>
      <div class="stage-tilt" id="stageTilt"><div class="stage-stack" id="stageStack"></div></div>
    </div>
  </div>
  <div class="picker" id="picker"><small data-t="hero.pick">Mahsulotni tanlang</small><div class="picks" id="picks"></div></div>
</section>

<div class="bigmarq" aria-hidden="true"><div class="bigmarq-track" id="bigMarq"></div></div>

<section class="show" id="products" data-header="dark">
  <div class="show-pin" id="showPin">
    <div class="show-bg" id="showBg"></div>
    <div class="show-word" id="showWord" aria-hidden="true"><em id="showWordT"></em></div>
    <div class="show-head"><p class="kicker" data-t="sc.kicker">Kolleksiya</p></div>
    <div class="show-stage" id="showStage" data-cursor="Boom"><span class="show-ring"></span><div class="show-tilt" id="showTilt"><div class="show-stack" id="showStack"></div></div><div class="floor"></div></div>
    <div class="show-info" id="showInfo">
      <p class="ch-n" id="sN"></p><h2 id="sName"></h2><p class="ch-tag" id="sTag"></p><ul class="chips" id="sChips"></ul>
      <div class="btns"><a class="btn btn-w" id="sMore" href="catalog.html"><span data-t="sc.details">Batafsil</span><i class="arr">→</i></a></div>
    </div>
    <div class="show-ui" aria-hidden="true"><div class="show-count"><b id="scur">01</b><span>/</span><em id="stotal">05</em></div><div class="show-rail"><i id="sprog"></i></div><p class="show-tap" data-t="sc.tap">Bosing — shokolad yog‘iladi</p></div>
    <ol class="show-nav" id="showNav" aria-hidden="true"></ol>
  </div>
  <div class="wrap show-fallback" id="showList"><h2 class="h2 split" data-t="sc.title">Har bir rang — alohida kayfiyat</h2><div class="pgrid" id="showGrid"></div></div>
</section>

<section class="statement sec" data-header="dark"><p class="statement-text" id="statement" data-t="ab.statement"></p><div class="wrap"><a href="about.html" class="link-arrow"><span data-t="ab.more">Biz haqimizda</span> →</a></div></section>

<section class="stats sec" data-header="dark" aria-label="Stats"><div class="wrap"><p class="kicker" data-t="st.title">Raqamlarda</p><div class="stats-grid" id="stats"></div></div></section>

<section class="partner sec" data-header="dark"><div class="wrap">
  <p class="kicker" data-t="par.kicker">Hamkorlik</p><h2 class="h2 split" data-t="par.title">Biznesingiz uchun uch yo‘nalish</h2>
  <ul class="prows">
    <li class="prow"><a href="contact.html?type=wholesale"><span class="pn">01</span><span class="pt" data-t="par.1t">Ulgurji savdo</span><span class="pd" data-t="par.1d"></span><i class="pa">↗</i></a></li>
    <li class="prow"><a href="export.html"><span class="pn">02</span><span class="pt" data-t="par.2t">Eksport</span><span class="pd" data-t="par.2d"></span><i class="pa">↗</i></a></li>
    <li class="prow"><a href="contact.html?type=private"><span class="pn">03</span><span class="pt" data-t="par.3t">Private label</span><span class="pd" data-t="par.3d"></span><i class="pa">↗</i></a></li>
  </ul>
</div></section>

<section class="news sec" id="newsSec" data-header="dark"><div class="wrap">
  <p class="kicker" data-t="news.kicker">Yangiliklar</p><h2 class="h2 split" data-t="news.title">Yaqinda yangilari chiqadi</h2>
  <div class="news-grid" id="newsGrid"></div>
  <p class="more-row"><a href="news.html" class="link-arrow"><span data-t="news.all">Barcha yangiliklar</span> →</a></p>
</div></section>

<section class="cta-sec" data-header="dark"><div class="wrap"><p class="kicker" data-t="cta.kicker">Aloqa</p><h2 class="cta-h split" data-t="cta.title">Hamkorlikni boshlaymiz</h2><a class="btn btn-w magnetic" href="contact.html"><span data-t="cta.btn">Bog‘lanish</span><i class="arr">→</i></a><a class="bigphone js-phone magnetic" href="tel:+998336233313">+998 33 623 33 13</a></div></section>
''')

# ---------------------------------------------------------------- CATALOG
PAGES['catalog'] = (('catalog', 'Katalog — BabuSweet shokolad konfetlari',
                     'BabuSweet mahsulotlari katalogi: Sea Salt Caramel to‘ldirilgan shokolad konfetlar. Ulgurji va eksport.'),
                    page_hero(('cat.kicker', 'Katalog'), ('cat.title', 'Barcha mahsulotlar'), ('cat.lead', 'BabuSweet — Sea Salt Caramel to‘ldirilgan shokolad konfetlar.')) + '''
<section class="catalog sec-s" data-header="dark"><div class="wrap">
  <div class="toolbar">
    <label class="search"><span class="sr-only">Search</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" data-tp="cat.search" placeholder="Mahsulot qidirish…" autocomplete="off"></label>
    <div class="filters" id="filters" role="group"><button class="fchip on" data-f="all" data-t="cat.all">Hammasi</button><button class="fchip" data-f="active" data-t="cat.active">Sotuvda</button><button class="fchip" data-f="soon" data-t="cat.soon">Tez orada</button></div>
    <p class="count"><b id="count">0</b> <span data-t="cat.count">ta mahsulot</span></p>
  </div>
  <div class="pgrid" id="pgrid"></div>
  <p class="empty-msg" id="empty" hidden data-t="cat.empty">Hech narsa topilmadi</p>
</div></section>
<section class="cta-sec" data-header="dark"><div class="wrap"><p class="kicker" data-t="cta.kicker">Aloqa</p><h2 class="cta-h split" data-t="cta.title">Hamkorlikni boshlaymiz</h2><a class="btn btn-w magnetic" href="contact.html"><span data-t="cta.btn">Bog‘lanish</span><i class="arr">→</i></a></div></section>
''')

# ---------------------------------------------------------------- PRODUCT
PAGES['product'] = (('product', 'Mahsulot — BabuSweet', 'BabuSweet mahsuloti: Sea Salt Caramel to‘ldirilgan shokolad konfetlar.'), '''
<section class="pdp" id="pdp" data-header="dark">
  <div class="pdp-bg" id="pdpBg"></div>
  <div class="pdp-word" id="pdpWord" aria-hidden="true"><em id="pdpWordT"></em></div>
  <div class="wrap pdp-grid">
    <div class="pdp-info" id="pdpInfo">
      <a class="back" href="catalog.html"><span>←</span> <span data-t="pr.back">Katalogga qaytish</span></a>
      <p class="ch-n" id="pdpCat"></p>
      <h1 id="pdpName"></h1>
      <p class="pdp-tag" id="pdpTag"></p>
      <p class="pdp-desc" id="pdpDesc"></p>
      <p class="soon-note" id="pdpSoon" hidden data-t="pr.soon.note">Bu mahsulot tez orada sotuvga chiqadi.</p>
      <dl class="specs" id="pdpSpecs"></dl>
      <div class="btns"><a class="btn btn-w magnetic" id="pdpAsk" href="contact.html"><span data-t="pr.ask">So‘rov yuborish</span><i class="arr">→</i></a><a class="btn btn-o magnetic" href="catalog.html"><span data-t="sc.all">Butun katalog</span></a></div>
    </div>
    <div class="pdp-stage" id="pdpStage" data-cursor="Boom"><span class="show-ring"></span><div class="show-tilt" id="pdpTilt"><img id="pdpImg" alt="" decoding="async"></div><div class="floor"></div><p class="tap-hint" data-t="pr.tap">Bosing — shokolad yog‘iladi</p></div>
  </div>
  <div class="wrap pdp-nf" id="pdpNF" hidden><h1 data-t="pr.nf.t">Mahsulot topilmadi</h1><p data-t="pr.nf.d">Bunday mahsulot yo‘q yoki yashirilgan.</p><a class="btn btn-w" href="catalog.html"><span data-t="pr.back">Katalogga qaytish</span></a></div>
</section>
<section class="more sec-s" id="moreSec" data-header="dark"><div class="wrap"><p class="kicker" data-t="pr.more">Boshqa mahsulotlar</p><div class="pgrid" id="moreGrid"></div></div></section>
''')

# ---------------------------------------------------------------- ABOUT
PAGES['about'] = (('about', 'Biz haqimizda — BabuSweet shokolad fabrikasi', 'BabuSweet fabrikasi haqida: Yangihayotda joylashgan, ichki bozor va eksport uchun shokolad ishlab chiqaruvchi.'),
                  page_hero(('about.kicker', 'Biz haqimizda'), ('about.title', 'Shokoladni sevib ishlaymiz')) + '''
<section class="story sec-s" data-header="dark"><div class="wrap story-grid"><p class="story-p" data-t="about.p1"></p><p class="story-p" data-t="about.p2"></p></div></section>

<section class="values sec" data-header="dark"><div class="wrap">
  <p class="kicker" data-t="val.kicker">Qadriyatlar</p><h2 class="h2 split" data-t="val.title">Bizga ishonish sabablari</h2>
  <div class="vals">
    <article class="val tilt"><span class="vn">01</span><h3 data-t="val.1t">Haqiqiy shokolad</h3><p data-t="val.1d"></p></article>
    <article class="val tilt"><span class="vn">02</span><h3 data-t="val.2t">Barqaror sifat</h3><p data-t="val.2d"></p></article>
    <article class="val tilt"><span class="vn">03</span><h3 data-t="val.3t">Ishonchli hamkor</h3><p data-t="val.3d"></p></article>
  </div>
</div></section>

<section class="factory sec" data-header="light"><div class="wrap fac-grid">
  <div class="fac-head"><p class="kicker" data-t="fac.kicker">Ishlab chiqarish</p><h2 class="h2 split" data-t="fac.title">Kakaodan qadoqgacha — nazorat ostida</h2></div>
  <ol class="fsteps" id="fsteps">
    <li class="fstep"><span class="fn">01</span><div><h3 data-t="fac.1t">Xomashyo</h3><p data-t="fac.1d"></p></div></li>
    <li class="fstep"><span class="fn">02</span><div><h3 data-t="fac.2t">Tayyorlash</h3><p data-t="fac.2d"></p></div></li>
    <li class="fstep"><span class="fn">03</span><div><h3 data-t="fac.3t">Shakllantirish</h3><p data-t="fac.3d"></p></div></li>
    <li class="fstep"><span class="fn">04</span><div><h3 data-t="fac.4t">Qadoqlash</h3><p data-t="fac.4d"></p></div></li>
  </ol>
</div></section>

<section class="stats sec" data-header="dark" aria-label="Stats"><div class="wrap"><p class="kicker" data-t="st.title">Raqamlarda</p><div class="stats-grid" id="stats"></div></div></section>

<section class="loc sec" data-header="dark"><div class="wrap"><p class="kicker" data-t="loc.kicker">Fabrika</p><h2 class="h2 split" data-t="loc.title">Yangihayot, Toshkent viloyati</h2><p class="lead js-address">''' + ADDR + '''</p><a class="btn btn-w magnetic" href="contact.html"><span data-t="cta.btn">Bog‘lanish</span><i class="arr">→</i></a></div></section>
''')

# ---------------------------------------------------------------- EXPORT
PAGES['export'] = (('export', 'Eksport va hamkorlik — BabuSweet', 'BabuSweet eksport va ulgurji hamkorlik: shartlar, jarayon va aloqa. Toshkent, Yangihayot.'), '''
<section class="phero phero-ex" data-header="dark"><div class="wrap export-grid">
  <div>
    <p class="kicker" data-t="ex.kicker">Eksport va hamkorlik</p>
    <h1 class="split" data-t="ex.title">Toshkentdan dunyoga</h1>
    <p class="lead" data-t="ex.lead"></p>
    <ul class="regions" id="regions"></ul>
    <div class="btns"><a class="btn btn-w magnetic" href="contact.html?type=export"><span data-t="ex.cta">So‘rov yuborish</span><i class="arr">→</i></a></div>
  </div>
  <div class="globe-wrap"><canvas id="globe" aria-hidden="true"></canvas></div>
</div></section>

<section class="partner sec-s" data-header="dark"><div class="wrap">
  <p class="kicker" data-t="par.kicker">Hamkorlik</p><h2 class="h2 split" data-t="par.title">Biznesingiz uchun uch yo‘nalish</h2>
  <ul class="prows">
    <li class="prow"><a href="contact.html?type=wholesale"><span class="pn">01</span><span class="pt" data-t="par.1t">Ulgurji savdo</span><span class="pd" data-t="par.1d"></span><i class="pa">↗</i></a></li>
    <li class="prow"><a href="contact.html?type=export"><span class="pn">02</span><span class="pt" data-t="par.2t">Eksport</span><span class="pd" data-t="par.2d"></span><i class="pa">↗</i></a></li>
    <li class="prow"><a href="contact.html?type=private"><span class="pn">03</span><span class="pt" data-t="par.3t">Private label</span><span class="pd" data-t="par.3d"></span><i class="pa">↗</i></a></li>
  </ul>
</div></section>

<section class="xsteps-sec sec" data-header="light"><div class="wrap">
  <p class="kicker" data-t="ex.steps.kicker">Qanday ishlaymiz</p><h2 class="h2 split" data-t="ex.steps.title">Hamkorlik 4 qadamda</h2>
  <ol class="xsteps">
    <li><span class="xn">01</span><h3 data-t="ex.1t">So‘rov</h3><p data-t="ex.1d"></p></li>
    <li><span class="xn">02</span><h3 data-t="ex.2t">Muhokama</h3><p data-t="ex.2d"></p></li>
    <li><span class="xn">03</span><h3 data-t="ex.3t">Shartnoma</h3><p data-t="ex.3d"></p></li>
    <li><span class="xn">04</span><h3 data-t="ex.4t">Yetkazib berish</h3><p data-t="ex.4d"></p></li>
  </ol>
</div></section>

<section class="faq sec" data-header="dark"><div class="wrap narrow">
  <h2 class="h2 split" data-t="faq.title">Ko‘p so‘raladigan savollar</h2>
  <details class="qa"><summary data-t="faq.1q">Hamkorlikni qanday boshlayman?</summary><p data-t="faq.1a"></p></details>
  <details class="qa"><summary data-t="faq.2q">Mahsulot namunasini olsam bo‘ladimi?</summary><p data-t="faq.2a"></p></details>
  <details class="qa"><summary data-t="faq.3q">Private label qanday ishlaydi?</summary><p data-t="faq.3a"></p></details>
</div></section>
<section class="cta-sec" data-header="dark"><div class="wrap"><p class="kicker" data-t="cta.kicker">Aloqa</p><h2 class="cta-h split" data-t="cta.title">Hamkorlikni boshlaymiz</h2><a class="btn btn-w magnetic" href="contact.html?type=export"><span data-t="cta.btn">Bog‘lanish</span><i class="arr">→</i></a></div></section>
''')

# ---------------------------------------------------------------- NEWS
PAGES['news'] = (('news', 'Yangiliklar — BabuSweet', 'BabuSweet yangiliklari: yangi mahsulotlar, e’lonlar va fabrikadan xabarlar.'),
                 page_hero(('nw.kicker', 'Yangiliklar'), ('nw.title', 'Yangiliklar va e’lonlar'), ('nw.lead', 'Yangi mahsulotlar, e’lonlar va fabrikadan xabarlar.')) + '''
<section class="news sec-s" data-header="dark"><div class="wrap"><div class="news-grid" id="newsGrid"></div><p class="empty-msg" id="empty" hidden data-t="news.empty">Hozircha yangilik yo‘q</p></div></section>
''')

# ---------------------------------------------------------------- CONTACT
PAGES['contact'] = (('contact', 'Aloqa — BabuSweet', 'BabuSweet bilan bog‘lanish: telefon +998 33 623 33 13, Yangihayot, Toshkent viloyati. Ulgurji, eksport va private label so‘rovlari.'),
                    page_hero(('ct.kicker', 'Aloqa'), ('ct.title', 'Keling, birga ishlaymiz')) + '''
<section class="contact sec-s" data-header="dark"><div class="wrap">
  <a class="bigphone js-phone magnetic" href="tel:+998336233313">+998 33 623 33 13</a>
  <div class="contact-grid">
    <div>
      <ul class="cinfo">
        <li><small data-t="ct.addr">Manzil</small><b class="js-address">''' + ADDR + '''</b><a id="mapLink" href="#" target="_blank" rel="noopener" class="link-arrow"><span data-t="ct.map">Xaritada ochish</span> ↗</a></li>
        <li id="hoursRow"><small data-t="ct.hours">Ish vaqti</small><b id="hours"></b></li>
        <li id="emailRow" hidden><small>Email</small><a id="emailLink" href="#"></a></li>
      </ul>
      <div class="map"><iframe id="mapFrame" title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Sputnik-17%2C+52a%2C+Yangihayot%2C+Tashkent&amp;output=embed"></iframe></div>
    </div>
    <form class="form" id="form" novalidate>
      <label><span data-t="f.name">Ismingiz</span><input name="name" required autocomplete="name" maxlength="80"></label>
      <label><span data-t="f.company">Kompaniya</span><input name="company" autocomplete="organization" maxlength="100"></label>
      <label><span data-t="f.contact">Telefon yoki Telegram</span><input name="contact" required autocomplete="tel" maxlength="100"></label>
      <div class="cols2"><label><span data-t="f.type">So‘rov turi</span><select name="type" id="fType"><option value="wholesale" data-t="f.t1">Ulgurji savdo</option><option value="export" data-t="f.t2">Eksport</option><option value="private" data-t="f.t3">Private label</option><option value="other" data-t="f.t4">Boshqa</option></select></label>
      <label><span data-t="f.product">Mahsulot</span><select name="product" id="fProduct"><option value="" data-t="f.none">— tanlanmagan —</option></select></label></div>
      <label><span data-t="f.msg">Xabar</span><textarea name="msg" rows="4" maxlength="2000"></textarea></label>
      <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-w magnetic" type="submit"><span data-t="f.send">Yuborish</span><i class="arr">→</i></button>
      <p class="form-note" id="formNote" role="status" aria-live="polite"></p>
    </form>
  </div>
</div></section>
''')

for name, ((page, title, desc), body) in PAGES.items():
    html = head(page, title, desc) + header(page) + body + footer()
    with open(os.path.join(ROOT, name + '.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('wrote', name + '.html')

# sitemap
urls = ['index', 'catalog', 'about', 'export', 'news', 'contact']
with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>https://YOUR-DOMAIN.uz/{"" if u == "index" else u + ".html"}</loc></url>\n' for u in urls) + '</urlset>\n')
