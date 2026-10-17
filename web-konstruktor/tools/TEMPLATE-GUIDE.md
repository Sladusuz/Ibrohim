# Shablon yozish qo'llanmasi (Impro IT konstruktori)

Shablon — bu kasbga mos tayyor sayt ma'lumoti. Mijoz uni tanlaydi va hamma narsani (matn, rasm, narx, rang, bo'limlar) o'zgartira oladi.
Maqsad: shablon **birinchi qarashdayoq "vau"** deyiladigan, professional agentlik ishi darajasida bo'lsin.

## 1. Fayl tuzilishi

Har bir shablon faylida (`public/tpl-N.js`) quyidagi qolip:

```js
'use strict';
(function () {
  const { add, sec, P } = window.TplKit;   // P('restoran', 3) -> '/img/p/restoran-3.jpg'
  add({
    id: 'restoran',                 // lotin harf, kichik, yagona. Eski shablon id si bilan bir xil bo'lsa, uni almashtiradi
    name: 'Restoran / kafe',        // galereyada ko'rinadigan nom
    cat: 'Xizmat',                  // kategoriya: Savdo | Xizmat | Go'zallik va salomatlik | Ta'lim | Portfolio | Biznes | Ko'chmas mulk va qurilish | Tadbir va turizm
    icon: 'utensils',               // icons.js dagi nom (code phone send design shield zap chart cart cloud support globe star users heart tool truck check mail pin clock tel insta menu x arrow search calendar user gift percent award camera image scissors coffee book terminal layers package card refresh plus minus trash external left right down github briefcase utensils graduation leaf download eye database home sun bell edit dollar settings inbox grid quote help filter)
    badge: '',                      // 'Yangi' | 'Ommabop' | '' 
    tags: ['restoran', 'kafe', 'taom', 'oshxona'],   // qidiruv uchun kalit so'zlar (o'zbekcha va ruscha/inglizcha sinonimlar)
    look: 'luxe',                   // faqat ma'lumot uchun
    desc: "Bir jumlada: kimga va nima uchun.",
    build: () => ({ v: 2, template: 'restoran', company: {...}, theme: {...}, nav: {...}, announce: {...}, orders: {...}, contacts: {...}, footer: {...}, sections: [ sec('bosh', 'hero', {...}), ... ] }),
  });
})();
```

`sec(id, type, props)` — bo'lim yaratadi: `{ id, type, enabled: true, navLabel: '', ...props }`.
`navLabel` to'ldirilgan bo'limlar menyuga havola bo'lib chiqadi (5–7 tadan oshirmang).
Bo'lim id si saytda `#id` havolasi sifatida ishlatiladi (tugmalar `cta1Link: '#bron'` kabi shunga bog'lanadi).

### `company`, `theme`, `nav`, ... maydonlari

```js
company: { name: 'Dasturxon', logo: 'D', tagline: 'Qisqa shior (footerda chiqadi)' },
theme: {
  preset: 'gold',          // dark | light | warm | minimal | fresh | rose | gold | ocean   (ranglar to'plami)
  accent: '', accent2: '', // ixtiyoriy HEX (#d4a64a). Bo'sh qoldirilsa preset ranglari ishlaydi
  look: 'luxe',            // 'cinema' (zamonaviy katta sans) | 'luxe' (nafis serif) | 'classic' (ishlatmang)
  motion: true,
  font: 'luxe',            // display (Bricolage: zamonaviy/jonli) | luxe (Instrument Serif: nafis) | wide (Unbounded: texno, keng) | modern (Inter) | soft | geometric | editorial | mono
  radius: 'round',         // sharp | soft | round
  bg: 'plain', heads: 'left', switcher: false
},
nav: { style: 'pill', cta: 'Stol band qilish', ctaLink: '#bron', search: false },   // style: pill | bar | minimal
announce: { enabled: false, text: '', link: '' },
orders: { enabled: false, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 },     // savat kerak bo'lsa enabled:true
contacts: { phone: '+998 71 200 00 00', email: 'info@sayt.uz', address: '...', hours: 'Har kuni 9:00 – 21:00', telegram: '@nom', instagram: '@nom' },
footer: { text: 'Barcha huquqlar himoyalangan.', links: [] },
```

Qoidalar: har bir shablon **o'ziga xos** ko'rinsin. `preset` + `look` + `font` + `hero.layout` kombinatsiyasini turlicha tanlang
(masalan: restoran = gold+luxe+luxe+cinema hero; IT kompaniya = dark+cinema+display+aurora; salon = rose+luxe+luxe+photo; do'kon = fresh/light+cinema+display; fitnes = dark+cinema+wide...).
Yorug' presetlar (light, minimal, fresh, rose, ocean) ham, qorong'i (dark, warm, gold) ham ishlating; hammasi qorong'i bo'lib qolmasin.

## 2. Bo'lim turlari

**Aniq maydon nomlari uchun `tools/SECTION-REFERENCE.json` ni o'qing** (har bir bo'lim: `fields` ro'yxati va `defaults`). Kalit nomlarni aynan shunday yozing
(masalan: `menu` elementida `tag` (badge emas), `mode: 'none' | 'cart'`; `stats` da `value/suffix/label`; `products` da `price/oldPrice/category/badge/description/image/stock/active`).
**Sifat me'yori sifatida `public/tpl-1.js` dagi `restoran` va `kompaniya` shablonlarini o'qing** — sizniki bundan past bo'lmasin. Ularni o'zgartirmang.

hero, marquee, stats, features, process, about, products, categories, menu, gallery, projects, skills, timeline, team, pricing, testimonials, faq, cta, cards, brief, contact — eski turlar.
Yangi turlar: **statement** (katta bayonot), **bento**, **services** (raqamli katta ro'yxat), **showcase** (gorizontal vitrina), **logos**, **split** (rasm+matn qatorlari), **video**, **map**, **compare** (oldin/keyin).

### Hero ko'rinishlari (`layout`)
- `aurora` — markazda ulkan sarlavha + WebGL nurli fon; `image` berilsa pastda katta "ekran" rasm. Texnologiya, agentlik, startap, ta'lim uchun.
- `cinema` — to'liq ekranli foto (Ken Burns), pastki chapda ulkan sarlavha, o'ngda shisha kartochka (`trust`). Restoran, turizm, avtoservis, qurilish, fitnes, to'y uchun. `image` — manifestdagi `hero:true` fotolardan.
- `photo` — chapda matn, o'ngda yarim aylana ramkali katta foto + suzuvchi chiplar (`chips`) + aylanuvchi yozuv (`spinText`) + kichik ikkinchi rasm (`image2`). Salon, klinika, yoga, shaxsiy brend, gul do'koni uchun.
- `editorial` — ulkan sarlavha ichida so'zlar orasiga rasm "tabletkalar" (`inlineImgs`: 3 ta rasm). Dizayner, fotograf, kreativ studiya uchun.
- `shop` — do'kon kollaji (`collage`), `split`, `center`, `image` — eski, imkon qadar yuqoridagilarni tanlang.

Hero sarlavhasi: `titleStart` (+ ixtiyoriy `words` yozuvchi so'zlar + `titleEnd`). **`*so'z*`** — nafis kursiv aksent (masalan `titleStart: "Mazali *lahzalar* shu yerda"`).
Aurora/editorial uchun qisqa (3–7 so'z) sarlavha; `words: []` qoldiring (yozuvchi so'z shart emas).
Barcha bo'lim sarlavhalarida (`title`) ham `*so'z*` ishlaydi: kursiv aksent. Har bo'limda 1 ta aksent yetarli.

### Ritm (taxminiy tuzilma, 10–14 ta bo'lim)
hero → marquee/logos/stats (ishonch) → statement yoki about → asosiy taklif (products/menu/services/bento/showcase/pricing — kasbga qarab) →
split/process (nega biz) → gallery/projects/compare (isbot) → team → testimonials (`layout: 'wall'` yoki grid) → pricing (kerak bo'lsa) → faq → cta (`fx: true` bilan) → map yoki contact.
Hamma bo'lim bir xil ko'rinmasin: bento, services, showcase, split, statement, compare kabi yangilarini kasbga mos holda aralashtiring.
`contact` bo'limi bo'lmasa mijoz xabar yubora olmaydi — har bir shablonda kamida bitta `contact` (yoki `brief`) bo'lsin va nav CTA ga bog'lansin.
Bron/yozilish kerak bo'lgan kasblarda `contact` `form: 'booking'` (+ `serviceOptions`), do'konda `orders.enabled:true` + `products mode:'cart'` + `contact form:'order'`.

## 3. Rasmlar

Haqiqiy fotolar: `public/img/p/<mavzu>-<n>.jpg` va tavsifi `public/img/p/manifest.json` da (har bir foto: alt, tone, hero, o'lcham).
Rasm yo'li: `P('restoran', 2)`. **Faqat mavjud fayllardan foydalaning** (manifestni o'qing va fotolarni ko'zdan kechiring: Read vositasi rasmni ko'rsatadi).
Bir shablonda bir fotoni ikki marta ishlatmang; mavzuga mos bo'lmagan fotoni qo'ymang. Boshqa mavzudan ham olish mumkin (masalan, restoran shablonida `odam-3` ni sharhga, `abstrakt-2` ni fon sifatida).
Mavzular: market elektronika kiyim gul mebel restoran kafe fastfood qandolat salon barber fitness klinika stomatolog talim til avtoservis qurilish rieltor yurist turizm toy fotograf dizayner dasturchi startap ilova musiqa yoga hayvon logistika organik odam(8 ta kvadrat portret) abstrakt(6).
Mahsulot/menyu kartochkalari uchun kvadrat-ga yaqin fotolar yaxshi (object-fit: cover ishlaydi). Agar mavzuda kerakli fotolar yetmasa, `/img/t/...svg` (eski chizma) ishlatmang — o'rniga boshqa mavzudan mos fotoni oling.
Kontentda "Lorem ipsum" bo'lmasin.

## 4. Kontent sifati (o'zbek tilida, lotin)

- Haqiqiy ko'ringan kompaniya nomi, shior, 3–6 ta xizmat/mahsulot, **realistik narxlar so'mda** (xizmat uchun `price` matn: "150 000 so'm"), 3–4 ta sharh (ism + kasb), 5–6 ta FAQ, telefon/manzil (Toshkent yoki boshqa shahar).
- Sarlavhalar qisqa, kuchli va yurak bilan (Shunchaki "Bizning xizmatlar" emas: "Soch emas, *kayfiyat* yaratamiz").
- Matnlar qisqa. Tugmalar fe'l bilan ("Stol band qilish", "Narxni bilish").
- `testimonials.items[].image` uchun `P('odam', n)` (har xil n).

## 5. Tekshirish (majburiy)

1. Sintaksis: `node -e "new (require('vm').Script)(require('fs').readFileSync('public/tpl-N.js','utf8'))"`.
2. Skrinshot: `node tools/shoot-thumbs.js <id1> <id2> ...` — `public/img/tpl/<id>.jpg` yaratadi (bosh ekran). **Read vositasi bilan ko'ring** va yomon bo'lsa tuzating.
3. To'liq sahifa tekshiruvi: `node tools/check-template.js <id>` — barcha bo'limlar bo'ylab aylanib, konsol xatolarini, siniq rasmlarni va gorizontal scroll'ni tekshiradi, `/tmp/.../shots/<id>-*.png` saqlaydi. Kamida hero va 3–4 ta bo'limni ko'zdan kechiring.
4. Mobil (390px) da gorizontal scroll bo'lmasin, matn kesilmasin (`check-template.js` shuni ham tekshiradi).
5. Jonli ko'rinish yaxshi chiqmasa — hero layout, preset, foto yoki bo'lim tartibini o'zgartiring. "Yaxshi" yetarli emas: agentlik portfoliosiga qo'ysa bo'ladigan darajada bo'lsin.

Boshqa fayllarni (sections*.js, motion.*, style.css, editor.js, builder.js, templates.js) **o'zgartirmang** — boshqa muhandis ishlayapti. Kamchilik/xato topsangiz hisobotda yozing.
