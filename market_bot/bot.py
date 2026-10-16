import asyncio
import json
import logging
import os
from html import escape


from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    LabeledPrice,
    Message,
    PreCheckoutQuery,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    MenuButtonDefault,
    MenuButtonWebApp,
    WebAppInfo,
)
from dotenv import load_dotenv

import seed_data
from db import Database, OrderError, normalize_phone, order_no


def e(text) -> str:
    return escape(str(text), quote=False)


load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_IDS = {int(x) for x in os.getenv("ADMIN_IDS", "").replace(" ", "").split(",") if x}
PROVIDER_TOKEN = os.getenv("PAYMENT_PROVIDER_TOKEN", "")
CARD_NUMBER = os.getenv("CARD_NUMBER", "")
CARD_OWNER = os.getenv("CARD_OWNER", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "").rstrip("/")  # Mini App uchun ommaviy https manzil
PORT = int(os.getenv("PORT", "8080"))

db = Database()
user_router = Router()
admin_router = Router()
admin_router.message.filter(F.from_user.id.in_(ADMIN_IDS))
admin_router.callback_query.filter(F.from_user.id.in_(ADMIN_IDS))

STATUSES = {
    "new": "🆕 Yangi",
    "confirmed": "✅ Tasdiqlandi",
    "shipping": "🚚 Yetkazilmoqda",
    "delivered": "🎉 Yetkazildi",
    "cancelled": "❌ Bekor qilindi",
}
DELIVERY = {"courier": "🚚 Kuryer", "pickup": "🏬 Olib ketish (bepul)"}
# Saytdagi ikki usul (naqd, karta) + bot ichidagi ikki yangi usul (sozlansa yoqiladi)
PAYMENTS = {"cash": "💵 Naqd (qabul qilganda)", "card": "💳 Karta (qabul qilganda, terminal)"}
if PROVIDER_TOKEN:
    PAYMENTS["online"] = "📲 Onlayn (Click / Payme)"
if CARD_NUMBER:
    PAYMENTS["transfer"] = "🏦 Karta o'tkazmasi"
MENU = {
    "catalog": "🛍 Katalog", "cart": "🛒 Savat", "orders": "📦 Buyurtmalarim",
    "track": "🔎 Buyurtmani kuzatish", "search": "🔍 Qidirish", "contact": "☎️ Aloqa",
}


def money(value: int) -> str:
    return f"{value:,}".replace(",", " ") + " so'm"


def main_menu() -> ReplyKeyboardMarkup:
    b = [KeyboardButton(text=t) for t in MENU.values()]
    rows = [b[0:2], b[2:4], b[4:6]]
    if WEBAPP_URL:
        rows.insert(0, [KeyboardButton(text="🛍 Do'konni ochish", web_app=WebAppInfo(url=WEBAPP_URL))])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


def open_shop_kb():
    if not WEBAPP_URL:
        return None
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="🛍 Do'konni ochish", web_app=WebAppInfo(url=WEBAPP_URL))]]
    )


def kb(rows):
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=d) for t, d in r] for r in rows]
    )


def price_line(p) -> str:
    if p["old_price"] > p["price"]:
        return f"<s>{money(p['old_price'])}</s> <b>{money(p['price'])}</b>"
    return f"<b>{money(p['price'])}</b>"


# ───────────────────────── Foydalanuvchi: katalog ─────────────────────────


@user_router.message(CommandStart())
async def start(message: Message, state: FSMContext):
    await state.clear()
    logging.info("START user_id=%s name=%s", message.from_user.id, message.from_user.full_name)
    s = db.settings()
    await message.answer(
        f"Assalomu alaykum, {e(message.from_user.full_name)}! 👋\n\n"
        f"<b>{e(s['name'])}</b>: bolalar elektromobili, kalyaska, velokalyaska, mototsikl va samokatlar.\n"
        f"✅ {s['warrantyMonths']} oylik kafolat · 🚚 butun O'zbekiston bo'ylab yetkazib berish",
        reply_markup=main_menu(),
    )
    if WEBAPP_URL:
        await message.answer("Do'konni to'liq ko'rinishda ochish uchun 👇", reply_markup=open_shop_kb())


async def cat_list(target: Message):
    cats = db.categories()
    await target.answer(
        "Kategoriyani tanlang:", reply_markup=kb([[(c["name"], f"cat:{c['id']}")] for c in cats])
    )


@user_router.message(F.text == MENU["catalog"])
async def catalog(message: Message, state: FSMContext):
    await state.clear()
    await cat_list(message)


@user_router.callback_query(F.data == "catalog")
async def catalog_back(call: CallbackQuery):
    await call.message.delete()
    await cat_list(call.message)
    await call.answer()


def product_buttons(rows_src, back="catalog"):
    rows = [
        [(f"{p['name']} · {money(p['price'])}" + ("" if p["stock"] else " (tugagan)"), f"prod:{p['id']}")]
        for p in rows_src
    ]
    rows.append([("⬅️ Orqaga", back)])
    return kb(rows)


@user_router.callback_query(F.data.startswith("cat:"))
async def category(call: CallbackQuery):
    cat_id = int(call.data.split(":")[1])
    prods = db.products(cat_id)
    await call.message.delete()
    await call.message.answer(
        "Mahsulotni tanlang:" if prods else "Bu kategoriyada mahsulot yo'q.",
        reply_markup=product_buttons(prods),
    )
    await call.answer()


def product_card(p, idx: int):
    colors = json.loads(p["colors"])
    idx = min(idx, max(len(colors) - 1, 0))
    specs = json.loads(p["specs"])
    lines = [f"<b>{e(p['name'])}</b>" + (f"  🏷 {e(p['badge'])}" if p["badge"] else "")]
    lines += ["", e(p["description"] or p["short"]), ""]
    lines += [f"▫️ {e(k)}: {e(str(v))}" for k, v in specs.items()]
    lines += ["", price_line(p), "✅ Mavjud" if p["stock"] else "❌ Sotuvda yo'q"]
    rows = []
    if len(colors) > 1:
        rows.append([("🎨 Rang tanlang:", "noop")])
        btns = [(("✅ " if i == idx else "") + c, f"pc:{p['id']}:{i}") for i, c in enumerate(colors)]
        rows += [btns[i : i + 3] for i in range(0, len(btns), 3)]
    if p["stock"]:
        rows.append([("🛒 Savatga qo'shish", f"add:{p['id']}:{idx}")])
    rows.append([("⬅️ Orqaga", f"cat:{p['category_id']}")])
    return "\n".join(lines), kb(rows)


@user_router.callback_query(F.data.startswith("prod:"))
async def product(call: CallbackQuery):
    p = db.product(int(call.data.split(":")[1]))
    if not p:
        await call.answer("Mahsulot topilmadi", show_alert=True)
        return
    text, markup = product_card(p, 0)
    await call.message.delete()
    if p["photo"]:
        await call.message.answer_photo(p["photo"], caption=text[:1024], reply_markup=markup)
    else:
        await call.message.answer(text, reply_markup=markup)
    await call.answer()


@user_router.callback_query(F.data.startswith("pc:"))
async def pick_color(call: CallbackQuery):
    _, pid, idx = call.data.split(":")
    p = db.product(int(pid))
    if p:
        await call.message.edit_reply_markup(reply_markup=product_card(p, int(idx))[1])
    await call.answer()


@user_router.callback_query(F.data == "noop")
async def noop(call: CallbackQuery):
    await call.answer()


@user_router.callback_query(F.data.startswith("add:"))
async def add_to_cart(call: CallbackQuery):
    _, pid, idx = call.data.split(":")
    p = db.product(int(pid))
    if not p:
        await call.answer("Mahsulot topilmadi", show_alert=True)
        return
    colors = json.loads(p["colors"])
    color = colors[int(idx)] if colors else ""
    if db.cart_add(call.from_user.id, p["id"], color):
        await call.answer("Savatga qo'shildi ✅")
    else:
        await call.answer("Omborda yetarli emas", show_alert=True)


@user_router.message(F.text == MENU["search"])
async def search_start(message: Message, state: FSMContext):
    await state.set_state(Search.text)
    await message.answer("Mahsulot nomini yozing (masalan: kalyaska):", reply_markup=main_menu())


class Search(StatesGroup):
    text = State()


@user_router.message(Search.text, F.text)
async def search_do(message: Message, state: FSMContext):
    await state.clear()
    found = db.search(message.text.strip())
    await message.answer(
        "Topilganlar:" if found else "Hech narsa topilmadi.",
        reply_markup=product_buttons(found) if found else None,
    )


# ───────────────────────── Savat ─────────────────────────


def cart_view(user_id: int):
    items = db.cart(user_id)
    if not items:
        return "🛒 Savat bo'sh.", None
    sub, fee, _ = db.cart_totals(user_id)
    s = db.settings()
    lines, rows = ["🛒 <b>Savatingiz</b>\n"], []
    for i in items:
        color = f" ({e(i['color'])})" if i["color"] else ""
        lines.append(f"• {e(i['name'])}{color} × {i['qty']} = {money(i['price'] * i['qty'])}")
        rows.append([
            ("➖", f"dec:{i['id']}"),
            (f"{i['name'][:16]} · {i['qty']}", "noop"),
            ("➕", f"inc:{i['id']}"),
            ("🗑", f"del:{i['id']}"),
        ])
    lines.append(f"\nMahsulotlar: {money(sub)}")
    lines.append(
        f"Kuryer: {money(fee)}" if fee else f"Kuryer: bepul ({money(int(s['freeFrom']))} dan yuqori)"
    )
    lines.append(f"<b>Jami: {money(sub + fee)}</b>")
    rows.append([("✅ Buyurtma berish", "checkout")])
    rows.append([("🧹 Tozalash", "clear")])
    return "\n".join(lines), kb(rows)


@user_router.message(F.text == MENU["cart"])
async def show_cart(message: Message, state: FSMContext):
    await state.clear()
    text, markup = cart_view(message.from_user.id)
    await message.answer(text, reply_markup=markup)


@user_router.callback_query(F.data.regexp(r"^(inc|dec|del|clear)(:|$)"))
async def cart_edit(call: CallbackQuery):
    action, _, cid = call.data.partition(":")
    uid = call.from_user.id
    if action == "inc":
        db.cart_change(uid, int(cid), 1)
    elif action == "dec":
        db.cart_change(uid, int(cid), -1)
    elif action == "del":
        db.cart_remove(uid, int(cid))
    else:
        db.cart_clear(uid)
    text, markup = cart_view(uid)
    await call.message.edit_text(text, reply_markup=markup)
    await call.answer()


# ───────────────────────── Buyurtma berish ─────────────────────────


class Checkout(StatesGroup):
    name = State()
    phone = State()
    delivery = State()
    address = State()
    payment = State()
    comment = State()
    confirm = State()


@user_router.callback_query(F.data == "checkout")
async def checkout(call: CallbackQuery, state: FSMContext):
    if not db.cart(call.from_user.id):
        await call.answer("Savat bo'sh", show_alert=True)
        return
    await state.clear()
    await state.set_state(Checkout.name)
    last = db.last_contact(call.from_user.id)
    await state.update_data(last_address=last["address"] if last else "")
    await call.message.answer("1/5 · Ismingizni kiriting:", reply_markup=ReplyKeyboardRemove())
    await call.answer()


@user_router.message(Checkout.name, F.text)
async def checkout_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("Ismingizni kiriting.")
        return
    await state.update_data(name=name)
    await state.set_state(Checkout.phone)
    await message.answer(
        "2/5 · Telefon raqamingiz (tugma orqali yoki yozing: 90 123 45 67):",
        reply_markup=ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="📱 Raqamni yuborish", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True,
        ),
    )


@user_router.message(Checkout.phone)
async def checkout_phone(message: Message, state: FSMContext):
    phone = normalize_phone(message.contact.phone_number if message.contact else message.text or "")
    if not phone:
        await message.answer("Telefon raqamini to'liq kiriting (masalan: 90 123 45 67).")
        return
    await state.update_data(phone=phone)
    await state.set_state(Checkout.delivery)
    uid = message.from_user.id
    sub, fee, _ = db.cart_totals(uid)
    s = db.settings()
    note = f"Kuryer: {money(fee)}" if fee else "Kuryer: bepul"
    await message.answer("Qabul qilindi ✅", reply_markup=ReplyKeyboardRemove())
    await message.answer(
        f"3/5 · Yetkazib berish usuli ({note}; {money(int(s['freeFrom']))} dan yuqorida bepul):",
        reply_markup=kb([[(v, f"dl:{k}")] for k, v in DELIVERY.items()]),
    )


@user_router.callback_query(Checkout.delivery, F.data.startswith("dl:"))
async def checkout_delivery(call: CallbackQuery, state: FSMContext):
    delivery = call.data.split(":")[1]
    await state.update_data(delivery=delivery)
    await call.answer()
    if delivery == "pickup":
        await state.update_data(address="")
        await ask_payment(call.message, state)
        return
    await state.set_state(Checkout.address)
    d = await state.get_data()
    rows = [[("📍 Oldingi manzil: " + d["last_address"][:30], "addr:last")]] if d.get("last_address") else None
    await call.message.answer(
        "4/5 · Manzilni yozing (shahar, tuman, ko'cha, uy):", reply_markup=kb(rows) if rows else None
    )


@user_router.callback_query(Checkout.address, F.data == "addr:last")
async def checkout_addr_last(call: CallbackQuery, state: FSMContext):
    d = await state.get_data()
    await state.update_data(address=d["last_address"])
    await call.answer()
    await ask_payment(call.message, state)


@user_router.message(Checkout.address, F.text)
async def checkout_address(message: Message, state: FSMContext):
    if len(message.text.strip()) < 5:
        await message.answer("Manzilni to'liqroq yozing.")
        return
    await state.update_data(address=message.text.strip())
    await ask_payment(message, state)


async def ask_payment(target: Message, state: FSMContext):
    await state.set_state(Checkout.payment)
    await target.answer(
        "5/5 · To'lov usulini tanlang:",
        reply_markup=kb([[(v, f"pm:{k}")] for k, v in PAYMENTS.items()]),
    )


@user_router.callback_query(Checkout.payment, F.data.startswith("pm:"))
async def checkout_payment(call: CallbackQuery, state: FSMContext):
    method = call.data.split(":")[1]
    if method not in PAYMENTS:
        await call.answer("Bu usul mavjud emas", show_alert=True)
        return
    await state.update_data(payment=method)
    await state.set_state(Checkout.comment)
    await call.message.answer(
        "Izoh qoldirasizmi? (masalan, qulay vaqt). Yo'q bo'lsa tugmani bosing:",
        reply_markup=kb([[("➡️ Izohsiz davom etish", "cm:skip")]]),
    )
    await call.answer()


async def ask_confirm(target: Message, state: FSMContext, uid: int):
    d = await state.get_data()
    sub, fee, total = db.cart_totals(uid, d["delivery"])
    lines = [
        "📝 <b>Buyurtmani tekshiring</b>\n",
        f"👤 {e(d['name'])} · 📞 {d['phone']}",
        f"{DELIVERY[d['delivery']]}" + (f": {e(d['address'])}" if d["address"] else ""),
        f"To'lov: {PAYMENTS[d['payment']]}",
    ]
    if d.get("comment"):
        lines.append(f"💬 {e(d['comment'])}")
    lines.append("")
    for i in db.cart(uid):
        color = f" ({e(i['color'])})" if i["color"] else ""
        lines.append(f"• {e(i['name'])}{color} × {i['qty']} = {money(i['price'] * i['qty'])}")
    lines.append(f"\nYetkazish: {money(fee) if fee else 'bepul'}\n<b>Jami: {money(total)}</b>")
    await state.set_state(Checkout.confirm)
    await target.answer(
        "\n".join(lines),
        reply_markup=kb([[("✅ Tasdiqlash", "ok")], [("❌ Bekor qilish", "cancel")]]),
    )


@user_router.callback_query(Checkout.comment, F.data == "cm:skip")
async def checkout_skip_comment(call: CallbackQuery, state: FSMContext):
    await state.update_data(comment="")
    await call.answer()
    await ask_confirm(call.message, state, call.from_user.id)


@user_router.message(Checkout.comment, F.text)
async def checkout_comment(message: Message, state: FSMContext):
    await state.update_data(comment=message.text.strip()[:300])
    await ask_confirm(message, state, message.from_user.id)


@user_router.callback_query(Checkout.confirm, F.data == "cancel")
async def checkout_cancel(call: CallbackQuery, state: FSMContext):
    await state.clear()
    await call.message.answer("Bekor qilindi. Savat saqlandi.", reply_markup=main_menu())
    await call.answer()


class Receipt(StatesGroup):
    photo = State()


@user_router.callback_query(Checkout.confirm, F.data == "ok")
async def checkout_done(call: CallbackQuery, state: FSMContext, bot: Bot):
    d = await state.get_data()
    try:
        oid = db.create_order(
            call.from_user.id, d["name"], d["phone"], d["address"], d.get("comment", ""),
            d["delivery"], d["payment"],
        )
    except OrderError as err:
        await state.clear()
        await call.message.answer(f"⚠️ {e(str(err))}", reply_markup=main_menu())
        await call.answer()
        return
    await state.clear()
    o = db.order(oid)
    await call.message.answer(
        f"✅ Buyurtma <b>{order_no(oid)}</b> qabul qilindi!\n"
        "Operator tez orada telefon orqali tasdiqlaydi.",
        reply_markup=main_menu(),
    )
    await call.message.answer(order_text(oid), reply_markup=pay_kb(o))
    await notify_admins(bot, "🔔 <b>Yangi buyurtma</b>\n\n" + order_text(oid), admin_order_kb(o))
    if o["payment"] == "online":
        await send_invoice(bot, call.from_user.id, oid)
    elif o["payment"] == "transfer":
        await ask_receipt(call.message, state, oid)
    await call.answer()


# ───────────────────────── To'lov ─────────────────────────


def pay_kb(o):
    """Mijozga: to'lanmagan onlayn/o'tkazma buyurtmalari uchun tugma."""
    if o["paid"] or o["status"] == "cancelled":
        return None
    if o["payment"] == "online":
        return kb([[("💳 To'lash", f"inv:{o['id']}")]])
    if o["payment"] == "transfer":
        return kb([[("🧾 Chek yuborish", f"rc:{o['id']}")]])
    return None


def invoice_prices(oid: int):
    o = db.order(oid)
    prices = [
        LabeledPrice(label=f"{i['product_name']} × {i['qty']}"[:60], amount=i["price"] * i["qty"] * 100)
        for i in db.order_items(oid)
    ]
    if o["delivery_fee"]:
        prices.append(LabeledPrice(label="Yetkazib berish", amount=o["delivery_fee"] * 100))
    return prices


async def send_invoice(bot: Bot, chat_id: int, oid: int):
    prices = invoice_prices(oid)
    await bot.send_invoice(
        chat_id,
        title=f"Buyurtma {order_no(oid)}",
        description="BabyCheer: buyurtma uchun to'lov",
        payload=f"order:{oid}",
        provider_token=PROVIDER_TOKEN,
        currency="UZS",
        prices=prices,
    )


@user_router.callback_query(F.data.startswith("inv:"))
async def pay_again(call: CallbackQuery, bot: Bot):
    oid = int(call.data.split(":")[1])
    o = db.order(oid)
    if not o or o["user_id"] != call.from_user.id or o["paid"] or o["status"] == "cancelled":
        await call.answer("To'lov mumkin emas", show_alert=True)
        return
    await send_invoice(bot, call.from_user.id, oid)
    await call.answer()


@user_router.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery):
    oid = int(query.invoice_payload.split(":")[1])
    o = db.order(oid)
    ok = bool(o) and not o["paid"] and o["status"] != "cancelled" and o["total"] * 100 == query.total_amount
    await query.answer(ok=ok, error_message=None if ok else "Buyurtma topilmadi yoki allaqachon to'langan.")


@user_router.message(F.successful_payment)
async def paid(message: Message, bot: Bot):
    oid = int(message.successful_payment.invoice_payload.split(":")[1])
    db.mark_paid(oid)
    await message.answer(f"✅ To'lov qabul qilindi. Buyurtma {order_no(oid)} uchun rahmat!")
    await notify_admins(bot, "💰 <b>Onlayn to'lov qabul qilindi</b>\n\n" + order_text(oid), admin_order_kb(db.order(oid)))


async def ask_receipt(target: Message, state: FSMContext, oid: int):
    await state.set_state(Receipt.photo)
    await state.update_data(oid=oid)
    await target.answer(
        f"🏦 <b>Karta o'tkazmasi</b>\n\nKarta: <code>{e(CARD_NUMBER)}</code>\n"
        + (f"Egasi: {e(CARD_OWNER)}\n" if CARD_OWNER else "")
        + f"Summa: <b>{money(db.order(oid)['total'])}</b>\n"
        f"Izohga buyurtma raqamini yozing: <b>{order_no(oid)}</b>\n\n"
        "To'lagach, <b>chek rasmini</b> shu yerga yuboring 👇"
    )


@user_router.callback_query(F.data.startswith("rc:"))
async def receipt_again(call: CallbackQuery, state: FSMContext):
    oid = int(call.data.split(":")[1])
    o = db.order(oid)
    if not o or o["user_id"] != call.from_user.id or o["paid"]:
        await call.answer("Kerak emas", show_alert=True)
        return
    await ask_receipt(call.message, state, oid)
    await call.answer()


@user_router.message(Receipt.photo, F.photo)
async def receipt_photo(message: Message, state: FSMContext, bot: Bot):
    oid = (await state.get_data())["oid"]
    await state.clear()
    for admin in ADMIN_IDS:
        try:
            await bot.send_photo(
                admin, message.photo[-1].file_id,
                caption="🧾 <b>To'lov cheki</b>\n\n" + order_text(oid)[:900],
                reply_markup=admin_order_kb(db.order(oid)),
            )
        except Exception:
            logging.exception("Adminga chek yuborilmadi: %s", admin)
    await message.answer("Chek yuborildi ✅ Operator tekshirib, to'lovni tasdiqlaydi.")


@user_router.message(Receipt.photo)
async def receipt_not_photo(message: Message):
    await message.answer("Iltimos, chek <b>rasmini</b> yuboring.")


# ───────────────────────── Buyurtmalar, kuzatish, aloqa ─────────────────────────


def order_text(order_id: int) -> str:
    o = db.order(order_id)
    items = "\n".join(
        f"• {e(i['product_name'])}" + (f" ({e(i['color'])})" if i["color"] else "")
        + f" × {i['qty']} = {money(i['price'] * i['qty'])}"
        for i in db.order_items(order_id)
    )
    pay = PAYMENTS.get(o["payment"], o["payment"]) + (" · ✅ to'langan" if o["paid"] else "")
    return (
        f"<b>Buyurtma {order_no(o['id'])}</b> · {STATUSES[o['status']]}\n"
        f"👤 {e(o['name'])} · 📞 {o['phone']}\n"
        f"{DELIVERY[o['delivery']]}" + (f": {e(o['address'])}" if o["address"] else "") + "\n"
        f"To'lov: {pay}\n"
        + (f"💬 {e(o['comment'])}\n" if o["comment"] else "")
        + f"\n{items}\n\nYetkazish: {money(o['delivery_fee']) if o['delivery_fee'] else 'bepul'}\n"
        f"<b>Jami: {money(o['total'])}</b>"
    )


@user_router.message(F.text == MENU["orders"])
async def my_orders(message: Message, state: FSMContext):
    await state.clear()
    orders = db.user_orders(message.from_user.id)
    if not orders:
        await message.answer("Sizda hali buyurtma yo'q.")
        return
    for o in orders:
        await message.answer(order_text(o["id"]), reply_markup=pay_kb(o))


class Track(StatesGroup):
    no = State()
    phone = State()


@user_router.message(F.text == MENU["track"])
async def track_start(message: Message, state: FSMContext):
    await state.set_state(Track.no)
    await message.answer("Buyurtma raqamini yozing (masalan: BC-1001):")


@user_router.message(Track.no, F.text)
async def track_no(message: Message, state: FSMContext):
    await state.update_data(no=message.text)
    await state.set_state(Track.phone)
    await message.answer("Buyurtmada ko'rsatilgan telefon raqamini yozing:")


@user_router.message(Track.phone, F.text)
async def track_phone(message: Message, state: FSMContext):
    no = (await state.get_data())["no"]
    await state.clear()
    o = db.find_order(no, message.text)
    await message.answer(
        order_text(o["id"]) if o else "Buyurtma topilmadi. Raqam va telefonni tekshiring.",
        reply_markup=pay_kb(o) if o else None,
    )


class Contact(StatesGroup):
    text = State()


@user_router.message(F.text == MENU["contact"])
async def contact(message: Message, state: FSMContext):
    await state.clear()
    s = db.settings()
    await message.answer(
        f"☎️ <b>{e(s['name'])}</b>\n\n"
        f"Telefon: {e(s['phone'])}\n"
        f"Telegram: @{e(s['telegram'])}\n"
        f"Kanal: {e(s['channel'])}\n"
        f"Instagram: {e(s['instagram'])}",
        reply_markup=kb([
            [("❓ Ko'p so'raladigan savollar", "faq")],
            [("✉️ Xabar yozish", "msg")],
        ]),
        disable_web_page_preview=True,
    )


@user_router.callback_query(F.data == "faq")
async def faq(call: CallbackQuery):
    s = db.settings()
    fmt = {"freeFrom": money(int(s["freeFrom"])), "deliveryFee": money(int(s["deliveryFee"])),
           "warrantyMonths": s["warrantyMonths"]}
    await call.message.answer(
        "\n\n".join(f"<b>{e(q)}</b>\n{e(a.format(**fmt))}" for q, a in seed_data.FAQ)
    )
    await call.answer()


@user_router.callback_query(F.data == "msg")
async def msg_start(call: CallbackQuery, state: FSMContext):
    await state.set_state(Contact.text)
    await call.message.answer("Xabaringizni yozing, operatorga yetkazamiz:")
    await call.answer()


@user_router.message(Contact.text, F.text)
async def msg_send(message: Message, state: FSMContext, bot: Bot):
    await state.clear()
    u = message.from_user
    await notify_admins(
        bot,
        f"✉️ <b>Mijoz xabari</b>\n{e(u.full_name)}" + (f" (@{e(u.username)})" if u.username else "")
        + f" · id {u.id}\n\n{e(message.text)}",
    )
    await message.answer("Xabaringiz yuborildi ✅ Tez orada javob beramiz.", reply_markup=main_menu())


# ───────────────────────── Admin ─────────────────────────


async def notify_admins(bot: Bot, text: str, markup=None):
    for admin in ADMIN_IDS:
        try:
            await bot.send_message(admin, text, reply_markup=markup)
        except Exception:
            logging.exception("Adminga xabar yuborilmadi: %s", admin)


def admin_order_kb(o):
    oid = o["id"]
    rows = [
        [("✅ Tasdiqlash", f"st:{oid}:confirmed"), ("🚚 Yo'lda", f"st:{oid}:shipping")],
        [("🎉 Yetkazildi", f"st:{oid}:delivered"), ("❌ Bekor", f"st:{oid}:cancelled")],
    ]
    if not o["paid"]:
        rows.append([("💰 To'langan deb belgilash", f"pay:{oid}")])
    return kb(rows)


@admin_router.message(Command("admin"))
async def admin_menu(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "🔧 <b>Admin panel</b>",
        reply_markup=kb([
            [("📋 Buyurtmalar", "a:orders"), ("📦 Mahsulotlar", "a:prods")],
            [("➕ Mahsulot", "a:addprod"), ("➕ Kategoriya", "a:addcat")],
        ]),
    )
    await message.answer(
        "Sozlamani o'zgartirish: <code>/set deliveryFee 50000</code>\n"
        "Kalitlar: " + ", ".join(db.settings()) + "\n(/set kalit qiymat)"
    )


@admin_router.message(Command("set"))
async def admin_set(message: Message):
    parts = (message.text or "").split(maxsplit=2)
    if len(parts) < 3 or parts[1] not in db.settings():
        await message.answer("Format: /set kalit qiymat")
        return
    db.set_setting(parts[1], parts[2])
    await message.answer(f"✅ {parts[1]} = {e(parts[2])}")


@admin_router.callback_query(F.data == "a:orders")
async def a_orders(call: CallbackQuery):
    orders = db.recent_orders()
    if not orders:
        await call.answer("Buyurtma yo'q", show_alert=True)
        return
    for o in orders:
        await call.message.answer(order_text(o["id"]), reply_markup=admin_order_kb(o))
    await call.answer()


@admin_router.callback_query(F.data.startswith("st:"))
async def a_set_status(call: CallbackQuery, bot: Bot):
    _, oid, status = call.data.split(":")
    oid = int(oid)
    if status not in STATUSES or not db.order(oid):
        await call.answer("Xato", show_alert=True)
        return
    db.set_status(oid, status)
    await refresh_admin_msg(call, oid)
    try:
        await bot.send_message(
            db.order(oid)["user_id"], f"Buyurtma {order_no(oid)} holati: {STATUSES[status]}"
        )
    except Exception:
        logging.warning("Mijozga xabar yuborilmadi (order %s)", oid)
    await call.answer("Yangilandi")


@admin_router.callback_query(F.data.startswith("pay:"))
async def a_pay(call: CallbackQuery, bot: Bot):
    oid = int(call.data.split(":")[1])
    db.mark_paid(oid)
    await refresh_admin_msg(call, oid)
    try:
        await bot.send_message(db.order(oid)["user_id"], f"💰 Buyurtma {order_no(oid)} uchun to'lov tasdiqlandi. Rahmat!")
    except Exception:
        logging.warning("Mijozga xabar yuborilmadi (order %s)", oid)
    await call.answer("To'langan deb belgilandi")


async def refresh_admin_msg(call: CallbackQuery, oid: int):
    o = db.order(oid)
    if call.message.photo:
        await call.message.edit_caption(caption=order_text(oid)[:1024], reply_markup=admin_order_kb(o))
    else:
        await call.message.edit_text(order_text(oid), reply_markup=admin_order_kb(o))


class AddCat(StatesGroup):
    name = State()


class AddProd(StatesGroup):
    category = State()
    name = State()
    price = State()
    old_price = State()
    stock = State()
    short = State()
    colors = State()
    photo = State()


class EditProd(StatesGroup):
    value = State()


@admin_router.callback_query(F.data == "a:addcat")
async def a_addcat(call: CallbackQuery, state: FSMContext):
    await state.set_state(AddCat.name)
    await call.message.answer("Yangi kategoriya nomi:")
    await call.answer()


@admin_router.message(AddCat.name, F.text)
async def a_addcat_name(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("✅ Qo'shildi" if db.add_category(message.text.strip()) else "Bunday kategoriya bor.")


@admin_router.callback_query(F.data == "a:addprod")
async def a_addprod(call: CallbackQuery, state: FSMContext):
    await state.set_state(AddProd.category)
    await call.message.answer(
        "Kategoriya:", reply_markup=kb([[(c["name"], f"apc:{c['id']}")] for c in db.categories()])
    )
    await call.answer()


@admin_router.callback_query(AddProd.category, F.data.startswith("apc:"))
async def a_addprod_cat(call: CallbackQuery, state: FSMContext):
    await state.update_data(category_id=int(call.data.split(":")[1]))
    await state.set_state(AddProd.name)
    await call.message.answer("Mahsulot nomi:")
    await call.answer()


def number(text: str):
    t = text.replace(" ", "")
    return int(t) if t.isdigit() else None


@admin_router.message(AddProd.name, F.text)
async def a_addprod_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text.strip())
    await state.set_state(AddProd.price)
    await message.answer("Narxi (so'm, faqat raqam):")


@admin_router.message(AddProd.price, F.text)
async def a_addprod_price(message: Message, state: FSMContext):
    n = number(message.text)
    if not n:
        await message.answer("Musbat butun son kiriting.")
        return
    await state.update_data(price=n)
    await state.set_state(AddProd.old_price)
    await message.answer("Eski narxi (chegirma bo'lsa; yo'q bo'lsa 0):")


@admin_router.message(AddProd.old_price, F.text)
async def a_addprod_old(message: Message, state: FSMContext):
    n = number(message.text)
    if n is None:
        await message.answer("Son kiriting (yo'q bo'lsa 0).")
        return
    await state.update_data(old_price=n)
    await state.set_state(AddProd.stock)
    await message.answer("Omborda nechta bor?")


@admin_router.message(AddProd.stock, F.text)
async def a_addprod_stock(message: Message, state: FSMContext):
    n = number(message.text)
    if n is None:
        await message.answer("Son kiriting.")
        return
    await state.update_data(stock=n)
    await state.set_state(AddProd.short)
    await message.answer("Qisqa tavsif:")


@admin_router.message(AddProd.short, F.text)
async def a_addprod_short(message: Message, state: FSMContext):
    await state.update_data(short=message.text.strip())
    await state.set_state(AddProd.colors)
    await message.answer("Ranglar, vergul bilan (masalan: Qizil, Ko'k) yoki '-':")


@admin_router.message(AddProd.colors, F.text)
async def a_addprod_colors(message: Message, state: FSMContext):
    t = message.text.strip()
    colors = [] if t == "-" else [c.strip() for c in t.split(",") if c.strip()]
    await state.update_data(colors=colors)
    await state.set_state(AddProd.photo)
    await message.answer("Rasm yuboring yoki '-':")


@admin_router.message(AddProd.photo)
async def a_addprod_photo(message: Message, state: FSMContext):
    if message.photo:
        photo = message.photo[-1].file_id
    elif message.text and message.text.strip() == "-":
        photo = None
    else:
        await message.answer("Rasm yuboring yoki '-' yozing.")
        return
    d = await state.get_data()
    await state.clear()
    db.add_product(d["category_id"], d["name"], d["price"], d["old_price"], d["stock"], d["short"], d["colors"], photo)
    await message.answer(f"✅ «{e(d['name'])}» qo'shildi")


@admin_router.callback_query(F.data == "a:prods")
async def a_prods(call: CallbackQuery):
    await call.message.answer(
        "Mahsulotni tanlang:",
        reply_markup=kb([[(f"{p['name']} · {p['stock']} ta", f"ap:{p['id']}")] for p in db.all_products()]),
    )
    await call.answer()


@admin_router.callback_query(F.data.startswith("ap:"))
async def a_prod(call: CallbackQuery):
    pid = int(call.data.split(":")[1])
    p = db.product(pid)
    if not p:
        await call.answer("Topilmadi", show_alert=True)
        return
    await call.message.answer(
        f"<b>{e(p['name'])}</b>\nNarx: {money(p['price'])} · eski: {money(p['old_price'])} · ombor: {p['stock']}",
        reply_markup=kb([
            [("Narx", f"ae:{pid}:price"), ("Eski narx", f"ae:{pid}:old_price"), ("Ombor", f"ae:{pid}:stock")],
            [("🖼 Rasm", f"ae:{pid}:photo"), ("🗑 O'chirish", f"dp:{pid}")],
        ]),
    )
    await call.answer()


@admin_router.callback_query(F.data.startswith("ae:"))
async def a_edit(call: CallbackQuery, state: FSMContext):
    _, pid, field = call.data.split(":")
    await state.set_state(EditProd.value)
    await state.update_data(pid=int(pid), field=field)
    await call.message.answer("Rasm yuboring:" if field == "photo" else "Yangi qiymat (son):")
    await call.answer()


@admin_router.message(EditProd.value)
async def a_edit_value(message: Message, state: FSMContext):
    d = await state.get_data()
    if d["field"] == "photo":
        if not message.photo:
            await message.answer("Rasm yuboring.")
            return
        value = message.photo[-1].file_id
    else:
        value = number(message.text or "")
        if value is None:
            await message.answer("Son kiriting.")
            return
    db.update_product(d["pid"], d["field"], value)
    await state.clear()
    await message.answer("✅ Yangilandi")


@admin_router.callback_query(F.data.startswith("dp:"))
async def a_delprod(call: CallbackQuery):
    db.delete_product(int(call.data.split(":")[1]))
    await call.message.edit_text("✅ O'chirildi")
    await call.answer()


async def main(session=None):
    logging.basicConfig(level=logging.INFO)
    if not BOT_TOKEN:
        raise SystemExit("BOT_TOKEN topilmadi. .env faylini to'ldiring (.env.example ga qarang).")
    bot = Bot(BOT_TOKEN, session=session, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()
    dp.include_router(admin_router)
    dp.include_router(user_router)

    import sys

    from aiohttp import web

    import web as webapp

    runner = web.AppRunner(webapp.create_app(bot, sys.modules[__name__]))
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    logging.info("Mini App serveri: http://0.0.0.0:%s (WEBAPP_URL=%s)", PORT, WEBAPP_URL or "-")
    if WEBAPP_URL:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="🛍 Do'kon", web_app=WebAppInfo(url=WEBAPP_URL))
        )
    else:
        await bot.set_chat_menu_button(menu_button=MenuButtonDefault())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
