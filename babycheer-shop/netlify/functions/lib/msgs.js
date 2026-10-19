// Mijozga yuboriladigan bot xabarlari: o'zbekcha va ruscha. Adminlarga xabarlar doim o'zbekcha.
import { STATUSES, STATUSES_RU, orderNo } from './shop.js';

const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const M = {
  uz: {
    orderOk: (no) => `✅ Buyurtma <b>${no}</b> qabul qilindi! Operator tez orada telefon orqali tasdiqlaydi.`,
    transfer: (card, owner, no) => `\n\n🏦 Karta: <code>${e(card)}</code>${owner ? ` (${e(owner)})` : ''}\nIzohga <b>${no}</b> yozing, so'ng «Chek yuborish» tugmasini bosing.`,
    status: (o) => `Buyurtma ${orderNo(o.id)} holati: ${STATUSES[o.status]}`,
    paidOk: (no) => `💰 Buyurtma ${no} uchun to'lov tasdiqlandi. Rahmat!`,
    payOnline: (no) => `✅ To'lov qabul qilindi. Buyurtma ${no} uchun rahmat!`,
    start: (name, s) => `Assalomu alaykum, ${e(name)}! 👋\n\n<b>${e(s.name)}</b>: bolalar elektromobili, kalyaska, velokalyaska, mototsikl va samokatlar.\n🚚 Toshkent bo'ylab yetkazib berish bepul · 📦 butun O'zbekiston bo'ylab yetkazib beramiz\n\nDo'konni ochish uchun pastdagi <b>Open</b> tugmasini yoki shu tugmani bosing 👇`,
    open: "🛍 Do'konni ochish", view: "🛍 Ko'rish",
    noOrders: "Sizda hali buyurtma yo'q.",
    ack: '✅ Xabaringiz adminga yuborildi. Tez orada javob beramiz.',
    spam: "⏳ Juda ko'p xabar yubordingiz. Birozdan keyin yozing.",
    error: "⚠️ Vaqtincha xatolik yuz berdi. Iltimos, bir necha soniyadan keyin qayta urinib ko'ring.",
    receiptSent: "Chek yuborildi ✅ Operator tekshirib, to'lovni tasdiqlaydi.",
    langSet: "Til o'zgartirildi: O'zbekcha 🇺🇿",
    hint: "Do'konni ochish uchun tugmani bosing 👇",
    product: (p, price) => `<b>${e(p)}</b>\n${price}`,
  },
  ru: {
    orderOk: (no) => `✅ Заказ <b>${no}</b> принят! Оператор скоро свяжется с вами по телефону для подтверждения.`,
    transfer: (card, owner, no) => `\n\n🏦 Карта: <code>${e(card)}</code>${owner ? ` (${e(owner)})` : ''}\nВ комментарии укажите <b>${no}</b>, затем нажмите «Отправить чек».`,
    status: (o) => `Статус заказа ${orderNo(o.id)}: ${STATUSES_RU[o.status]}`,
    paidOk: (no) => `💰 Оплата заказа ${no} подтверждена. Спасибо!`,
    payOnline: (no) => `✅ Оплата получена. Спасибо за заказ ${no}!`,
    start: (name, s) => `Здравствуйте, ${e(name)}! 👋\n\n<b>${e(s.name)}</b>: детские электромобили, коляски, велоколяски, мотоциклы и самокаты.\n🚚 Доставка по Ташкенту бесплатно · 📦 доставляем по всему Узбекистану\n\nЧтобы открыть магазин, нажмите кнопку <b>Open</b> внизу или эту кнопку 👇`,
    open: '🛍 Открыть магазин', view: '🛍 Открыть',
    noOrders: 'У вас пока нет заказов.',
    ack: '✅ Ваше сообщение отправлено администратору. Скоро ответим.',
    spam: '⏳ Слишком много сообщений. Напишите чуть позже.',
    error: '⚠️ Временная ошибка. Пожалуйста, повторите через несколько секунд.',
    receiptSent: 'Чек отправлен ✅ Оператор проверит и подтвердит оплату.',
    langSet: 'Язык изменён: Русский 🇷🇺',
    hint: 'Чтобы открыть магазин, нажмите кнопку 👇',
    product: (p, price) => `<b>${e(p)}</b>\n${price}`,
  },
};
export const msg = (lang) => M[lang === 'ru' ? 'ru' : 'uz'];
