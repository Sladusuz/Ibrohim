"""BabyCheer sayti (Sladusuz/Market, js/seed.js) dagi ma'lumotlar. Narxlar saytdagi namunaviy narxlar."""

SETTINGS = {
    "name": "BabyCheer",
    "phone": "+998 99 114 90 99",
    "telegram": "babycheer_admin",
    "channel": "https://t.me/+9CWZLTOE7KczZjky",
    "instagram": "https://instagram.com/babycheer_shop",
    "freeFrom": "1000000",
    "deliveryFee": "40000",
    "warrantyMonths": "6",
}

CATEGORIES = [
    ("elektromobil", "Elektromobillar", 1),
    ("kalyaska", "Kalyaskalar", 2),
    ("velokalyaska", "Velokalyaskalar", 3),
    ("mototsikl", "Mototsikllar", 4),
    ("samokat", "Samokatlar", 5),
]

C = {
    "blue": "Ko'k", "red": "Qizil", "white": "Oq", "black": "Qora", "green": "Yashil",
    "pink": "Pushti", "yellow": "Sariq", "orange": "To'q sariq", "teal": "Zangori", "grey": "Kulrang",
}


def cols(*k):
    return [C[x] for x in k]


# (kategoriya slug, nom, narx, eski narx, ombor, belgi, qisqa, tavsif, xususiyatlar, ranglar)
PRODUCTS = [
    ("elektromobil", "Sport elektromobil, 2 kishilik", 4600000, 0, 5, "Yangi",
     "Karbon uslubidagi sport dizayn, LED yoritish va spoyler.",
     "Sport avtomobil uslubidagi 2 kishilik elektromobil: karbon tolaga o'xshash kapot, katta orqa spoyler, keng g'ildirak kamarlari, LED faralar va pastki LED yoritish. Salonda xavfsizlik kamarlari, qizil sport rul va musiqa paneli bor.",
     {"O'rindiq": "2 ta (yonma-yon)", "Xavfsizlik": "Xavfsizlik kamarlari", "Yoritish": "LED fara va pastki yoritish", "Qo'shimcha": "Orqa spoyler, musiqa paneli", "Kafolat": "6 oy"},
     ["Metallik kulrang"]),
    ("elektromobil", "1 kishilik elektromobil", 2450000, 2790000, 14, "Eng ommabop",
     "Pult, LED chiroq va musiqa. 2 yoshdan.",
     "Pult bilan boshqariladigan, ikki rejimli (bola o'zi haydaydi yoki ota-ona pult bilan boshqaradi) bolalar elektromobili. Xavfsizlik kamari, yumshoq o'rindiq, LED chiroqlar va Bluetooth orqali musiqa.",
     {"Yosh": "2-6 yosh", "Batareya": "12V 7Ah", "Tezlik": "3-5 km/soat", "Yuk ko'tarish": "30 kg gacha", "Boshqaruv": "Pedal va ota-ona pulti", "Kafolat": "6 oy"},
     cols("blue", "red", "white", "black", "green", "pink")),
    ("elektromobil", "2 kishilik elektromobil", 3950000, 0, 8, "Yangi",
     "Ikki o'rindiq, 4 motor, Bluetooth.",
     "Ikki bola uchun keng salon, to'rt motorli yuritma va ota-ona pulti. Notekis yo'llarda ham barqaror: amortizatsiyali g'ildiraklar va kuchli konstruksiya.",
     {"Yosh": "3-8 yosh", "Batareya": "24V 10Ah", "Tezlik": "3-7 km/soat", "Yuk ko'tarish": "60 kg gacha", "Motor": "4 ta", "Kafolat": "6 oy"},
     cols("red", "blue", "white", "black", "yellow")),
    ("elektromobil", "Jip uslubidagi elektromobil", 3290000, 3690000, 6, "Chegirma",
     "Katta g'ildirak, bagajli tom, 2 o'rindiq.",
     "Katta g'ildirakli jip: tomda bagaj, orqada zaxira g'ildirak va yuqori yo'l tirqishi. Hovli va parkda sayr qilish uchun.",
     {"Yosh": "3-7 yosh", "Batareya": "12V 10Ah", "Tezlik": "3-6 km/soat", "Yuk ko'tarish": "40 kg gacha", "Kafolat": "6 oy"},
     cols("green", "black", "white", "orange")),
    ("kalyaska", "Dron kalyaska 3/1", 2150000, 2490000, 11, "",
     "Beshik, yurish bloki va avtokreslo.",
     "Uchta modulli (beshik, yurish bloki, avtokreslo) universal kalyaska. Katta g'ildiraklar va amortizatsiya shahar va yo'l uchun mos.",
     {"Yosh": "0-3 yosh", "Og'irligi": "9.5 kg", "Tarkibi": "3 ta modul", "Kafolat": "6 oy"},
     cols("grey", "black", "teal", "pink")),
    ("kalyaska", "Yengil sayohat kalyaskasi", 890000, 0, 20, "",
     "Bir qo'l bilan yig'iladi, 6 kg.",
     "Samolyot va avtomobil bagajiga sig'adigan ixcham kalyaska.",
     {"Yosh": "6 oy - 3 yosh", "Og'irligi": "6 kg", "Yig'ilishi": "Bir qo'l bilan", "Kafolat": "6 oy"},
     cols("black", "blue", "red")),
    ("velokalyaska", "Velokalyaska 5/1", 1390000, 1590000, 17, "Chegirma",
     "Soyabon, savat, ota-ona tutqichi.",
     "Ota-ona boshqaradigan tutqich, soyabon, xavfsizlik kamari va savat. Bola o'sgani sari oddiy velosipedga aylanadi.",
     {"Yosh": "1-5 yosh", "Og'irligi": "7 kg", "Yuk ko'tarish": "25 kg gacha", "Rejimlar": "5 xil"},
     cols("green", "pink", "blue", "orange")),
    ("mototsikl", "Bolalar elektromototsikli", 1690000, 1890000, 9, "",
     "Ovoz, chiroq, yordamchi g'ildirak.",
     "Ovozli va chiroqli elektromototsikl, yordamchi g'ildiraklar bilan barqaror. Pedal bilan ishga tushadi.",
     {"Yosh": "2-5 yosh", "Batareya": "6V 4.5Ah", "Tezlik": "3 km/soat", "Yuk ko'tarish": "25 kg gacha"},
     cols("red", "black", "blue", "white")),
    ("samokat", "Samokat, 3 g'ildirakli", 390000, 0, 30, "",
     "Balandligi sozlanadi, alyuminiy.",
     "Balandligi sozlanadigan, keng taxtali va tormozli samokat.",
     {"Yosh": "3-8 yosh", "Og'irligi": "2.4 kg", "Yuk ko'tarish": "50 kg gacha", "Material": "Alyuminiy"},
     cols("orange", "teal", "pink", "green")),
    ("samokat", "Samokat, yorug' g'ildirakli", 450000, 520000, 25, "",
     "Harakatda yonadigan LED g'ildiraklar.",
     "LED g'ildiraklar, yig'iladigan konstruksiya.",
     {"Yosh": "4-10 yosh", "Og'irligi": "3 kg", "Yuk ko'tarish": "60 kg gacha", "Material": "Alyuminiy"},
     cols("pink", "blue", "yellow")),
]

FAQ = [
    ("Elektromobil necha yoshdan?", "Modelga qarab 2 yoshdan 8 yoshgacha. Har bir mahsulotda aniq yosh va yuk ko'tarish ko'rsatilgan."),
    ("Yetkazib berish qancha turadi?", "Butun O'zbekiston bo'ylab yetkazamiz. {freeFrom} dan yuqori buyurtmalarda bepul, qolganida {deliveryFee}. Muddatni operator buyurtmani tasdiqlaganda aytadi."),
    ("To'lov qanday amalga oshiriladi?", "Qabul qilganda naqd yoki karta orqali, shuningdek bot ichida onlayn yoki karta o'tkazmasi orqali oldindan to'lash mumkin."),
    ("Kafolat nimani qamrab oladi?", "Barcha mahsulotlarga {warrantyMonths} oylik kafolat beriladi. Ishlab chiqarish nuqsonlari bepul bartaraf etiladi."),
    ("Rangni keyin o'zgartirsa bo'ladimi?", "Buyurtma tasdiqlanishidan oldin Telegram yoki telefon orqali rangni o'zgartirish mumkin."),
    ("Buyurtmani qanday kuzataman?", "Botda «🔎 Buyurtmani kuzatish» tugmasi: buyurtma raqami va telefon raqamingizni yozasiz."),
]
