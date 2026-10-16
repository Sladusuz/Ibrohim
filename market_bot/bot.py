import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
)
from dotenv import load_dotenv

from db import Database

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_IDS = {int(x) for x in os.getenv("ADMIN_IDS", "").replace(" ", "").split(",") if x}
CURRENCY = os.getenv("CURRENCY", "so'm")

db = Database()
user_router = Router()
admin_router = Router()
admin_router.message.filter(F.from_user.id.in_(ADMIN_IDS))
admin_router.callback_query.filter(F.from_user.id.in_(ADMIN_IDS))

STATUSES = {
    "new": "🆕 Yangi",
    "accepted": "✅ Qabul qilindi",
    "delivering": "🚚 Yetkazilmoqda",
    "done": "🎉 Yetkazildi",
    "cancelled": "❌ Bekor qilindi",
}


def money(value: int) -> str:
    return f"{value:,}".replace(",", " ") + f" {CURRENCY}"


def main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🛍 Katalog"), KeyboardButton(text="🛒 Savat")],
            [KeyboardButton(text="📦 Buyurtmalarim")],
        ],
        resize_keyboard=True,
    )


def kb(rows):
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t, callback_data=d) for t, d in r] for r in rows]
    )


# ───────────────────────── Foydalanuvchi ─────────────────────────


@user_router.message(CommandStart())
async def start(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        f"Assalomu alaykum, {message.from_user.full_name}! 👋\n"
        "Do'konimizga xush kelibsiz. Quyidagi menyudan tanlang.",
        reply_markup=main_menu(),
    )


@user_router.message(F.text == "🛍 Katalog")
async def catalog(message: Message):
    cats = db.categories()
    if not cats:
        await message.answer("Hozircha katalog bo'sh.")
        return
    await message.answer(
        "Kategoriyani tanlang:", reply_markup=kb([[(c["name"], f"cat:{c['id']}")] for c in cats])
    )


@user_router.callback_query(F.data == "catalog")
async def catalog_back(call: CallbackQuery):
    cats = db.categories()
    await call.message.delete()
    await call.message.answer(
        "Kategoriyani tanlang:", reply_markup=kb([[(c["name"], f"cat:{c['id']}")] for c in cats])
    )
    await call.answer()


@user_router.callback_query(F.data.startswith("cat:"))
async def category(call: CallbackQuery):
    cat_id = int(call.data.split(":")[1])
    prods = db.products(cat_id)
    rows = [[(f"{p['name']} — {money(p['price'])}", f"prod:{p['id']}")] for p in prods]
    rows.append([("⬅️ Orqaga", "catalog")])
    text = "Mahsulotni tanlang:" if prods else "Bu kategoriyada mahsulot yo'q."
    await call.message.delete()
    await call.message.answer(text, reply_markup=kb(rows))
    await call.answer()


@user_router.callback_query(F.data.startswith("prod:"))
async def product(call: CallbackQuery):
    p = db.product(int(call.data.split(":")[1]))
    if not p:
        await call.answer("Mahsulot topilmadi", show_alert=True)
        return
    text = f"<b>{p['name']}</b>\n\n{p['description']}\n\n💰 {money(p['price'])}"
    markup = kb([
        [("➕ Savatga qo'shish", f"add:{p['id']}")],
        [("⬅️ Orqaga", f"cat:{p['category_id']}")],
    ])
    await call.message.delete()
    if p["photo"]:
        await call.message.answer_photo(p["photo"], caption=text, reply_markup=markup, parse_mode="HTML")
    else:
        await call.message.answer(text, reply_markup=markup, parse_mode="HTML")
    await call.answer()


@user_router.callback_query(F.data.startswith("add:"))
async def add_to_cart(call: CallbackQuery):
    pid = int(call.data.split(":")[1])
    if not db.product(pid):
        await call.answer("Mahsulot topilmadi", show_alert=True)
        return
    db.cart_add(call.from_user.id, pid)
    await call.answer("Savatga qo'shildi ✅")


def cart_view(user_id: int):
    items = db.cart(user_id)
    if not items:
        return "🛒 Savat bo'sh.", None
    lines, rows, total = ["🛒 <b>Savatingiz</b>\n"], [], 0
    for i in items:
        s = i["price"] * i["qty"]
        total += s
        lines.append(f"• {i['name']} × {i['qty']} = {money(s)}")
        rows.append([
            ("➖", f"dec:{i['id']}"),
            (f"{i['name'][:18]} ({i['qty']})", "noop"),
            ("➕", f"inc:{i['id']}"),
            ("🗑", f"del:{i['id']}"),
        ])
    lines.append(f"\n<b>Jami: {money(total)}</b>")
    rows.append([("✅ Buyurtma berish", "checkout")])
    rows.append([("🧹 Tozalash", "clear")])
    return "\n".join(lines), kb(rows)


@user_router.message(F.text == "🛒 Savat")
async def show_cart(message: Message):
    text, markup = cart_view(message.from_user.id)
    await message.answer(text, reply_markup=markup, parse_mode="HTML")


@user_router.callback_query(F.data == "noop")
async def noop(call: CallbackQuery):
    await call.answer()


@user_router.callback_query(F.data.regexp(r"^(inc|dec|del|clear):?"))
async def cart_edit(call: CallbackQuery):
    action, _, pid = call.data.partition(":")
    uid = call.from_user.id
    if action == "inc":
        db.cart_add(uid, int(pid), 1)
    elif action == "dec":
        db.cart_add(uid, int(pid), -1)
    elif action == "del":
        db.cart_remove(uid, int(pid))
    else:
        db.cart_clear(uid)
    text, markup = cart_view(uid)
    await call.message.edit_text(text, reply_markup=markup, parse_mode="HTML")
    await call.answer()


class Checkout(StatesGroup):
    name = State()
    phone = State()
    address = State()


@user_router.callback_query(F.data == "checkout")
async def checkout(call: CallbackQuery, state: FSMContext):
    if not db.cart(call.from_user.id):
        await call.answer("Savat bo'sh", show_alert=True)
        return
    await state.set_state(Checkout.name)
    await call.message.answer("Ismingizni kiriting:", reply_markup=ReplyKeyboardRemove())
    await call.answer()


@user_router.message(Checkout.name, F.text)
async def checkout_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text.strip())
    await state.set_state(Checkout.phone)
    await message.answer(
        "Telefon raqamingizni yuboring (tugma orqali yoki yozib):",
        reply_markup=ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="📱 Raqamni yuborish", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True,
        ),
    )


@user_router.message(Checkout.phone)
async def checkout_phone(message: Message, state: FSMContext):
    phone = message.contact.phone_number if message.contact else (message.text or "").strip()
    if len(phone) < 7:
        await message.answer("Telefon raqami noto'g'ri, qayta kiriting.")
        return
    await state.update_data(phone=phone)
    await state.set_state(Checkout.address)
    await message.answer("Yetkazib berish manzilini yozing:", reply_markup=ReplyKeyboardRemove())


@user_router.message(Checkout.address, F.text)
async def checkout_address(message: Message, state: FSMContext, bot: Bot):
    data = await state.get_data()
    await state.clear()
    order_id = db.create_order(
        message.from_user.id, data["name"], data["phone"], message.text.strip()
    )
    if not order_id:
        await message.answer("Savat bo'sh.", reply_markup=main_menu())
        return
    await message.answer(
        f"✅ Buyurtma #{order_id} qabul qilindi! To'lov yetkazib berilganda naqd qilinadi.\n"
        "Tez orada siz bilan bog'lanamiz.",
        reply_markup=main_menu(),
    )
    for admin in ADMIN_IDS:
        try:
            await bot.send_message(
                admin,
                "🔔 <b>Yangi buyurtma</b>\n\n" + order_text(order_id),
                reply_markup=status_kb(order_id),
                parse_mode="HTML",
            )
        except Exception:
            logging.exception("Adminga xabar yuborilmadi: %s", admin)


def order_text(order_id: int) -> str:
    o = db.order(order_id)
    items = "\n".join(
        f"• {i['product_name']} × {i['qty']} = {money(i['price'] * i['qty'])}"
        for i in db.order_items(order_id)
    )
    return (
        f"<b>Buyurtma #{o['id']}</b> — {STATUSES[o['status']]}\n"
        f"👤 {o['name']}\n📞 {o['phone']}\n📍 {o['address']}\n\n"
        f"{items}\n\n<b>Jami: {money(o['total'])}</b>"
    )


@user_router.message(F.text == "📦 Buyurtmalarim")
async def my_orders(message: Message):
    orders = db.user_orders(message.from_user.id)
    if not orders:
        await message.answer("Sizda hali buyurtma yo'q.")
        return
    for o in orders:
        await message.answer(order_text(o["id"]), parse_mode="HTML")


# ───────────────────────── Admin ─────────────────────────


def status_kb(order_id: int):
    return kb([
        [("✅ Qabul", f"st:{order_id}:accepted"), ("🚚 Yo'lda", f"st:{order_id}:delivering")],
        [("🎉 Yetkazildi", f"st:{order_id}:done"), ("❌ Bekor", f"st:{order_id}:cancelled")],
    ])


@admin_router.message(Command("admin"))
async def admin_menu(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "🔧 <b>Admin panel</b>",
        reply_markup=kb([
            [("➕ Kategoriya", "a:addcat"), ("➕ Mahsulot", "a:addprod")],
            [("📋 Buyurtmalar", "a:orders"), ("🗑 Mahsulot o'chirish", "a:delprod")],
        ]),
        parse_mode="HTML",
    )


class AddCat(StatesGroup):
    name = State()


class AddProd(StatesGroup):
    category = State()
    name = State()
    price = State()
    description = State()
    photo = State()


@admin_router.callback_query(F.data == "a:addcat")
async def a_addcat(call: CallbackQuery, state: FSMContext):
    await state.set_state(AddCat.name)
    await call.message.answer("Yangi kategoriya nomini yozing:")
    await call.answer()


@admin_router.message(AddCat.name, F.text)
async def a_addcat_name(message: Message, state: FSMContext):
    await state.clear()
    ok = db.add_category(message.text.strip())
    await message.answer("✅ Qo'shildi" if ok else "Bunday kategoriya allaqachon bor.")


@admin_router.callback_query(F.data == "a:addprod")
async def a_addprod(call: CallbackQuery, state: FSMContext):
    cats = db.categories()
    if not cats:
        await call.answer("Avval kategoriya qo'shing", show_alert=True)
        return
    await state.set_state(AddProd.category)
    await call.message.answer(
        "Kategoriyani tanlang:", reply_markup=kb([[(c["name"], f"apc:{c['id']}")] for c in cats])
    )
    await call.answer()


@admin_router.callback_query(AddProd.category, F.data.startswith("apc:"))
async def a_addprod_cat(call: CallbackQuery, state: FSMContext):
    await state.update_data(category_id=int(call.data.split(":")[1]))
    await state.set_state(AddProd.name)
    await call.message.answer("Mahsulot nomi:")
    await call.answer()


@admin_router.message(AddProd.name, F.text)
async def a_addprod_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text.strip())
    await state.set_state(AddProd.price)
    await message.answer(f"Narxi ({CURRENCY}, faqat raqam):")


@admin_router.message(AddProd.price, F.text)
async def a_addprod_price(message: Message, state: FSMContext):
    digits = message.text.replace(" ", "")
    if not digits.isdigit() or int(digits) <= 0:
        await message.answer("Faqat musbat butun son kiriting.")
        return
    await state.update_data(price=int(digits))
    await state.set_state(AddProd.description)
    await message.answer("Tavsif (yoki '-' yozing):")


@admin_router.message(AddProd.description, F.text)
async def a_addprod_desc(message: Message, state: FSMContext):
    desc = "" if message.text.strip() == "-" else message.text.strip()
    await state.update_data(description=desc)
    await state.set_state(AddProd.photo)
    await message.answer("Rasm yuboring (yoki '-' yozing):")


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
    db.add_product(d["category_id"], d["name"], d["price"], d["description"], photo)
    await message.answer(f"✅ «{d['name']}» qo'shildi")


@admin_router.callback_query(F.data == "a:delprod")
async def a_delprod(call: CallbackQuery):
    prods = db.all_products()
    if not prods:
        await call.answer("Mahsulot yo'q", show_alert=True)
        return
    await call.message.answer(
        "O'chiriladigan mahsulotni tanlang:",
        reply_markup=kb([[(f"🗑 {p['name']}", f"dp:{p['id']}")] for p in prods]),
    )
    await call.answer()


@admin_router.callback_query(F.data.startswith("dp:"))
async def a_delprod_do(call: CallbackQuery):
    db.delete_product(int(call.data.split(":")[1]))
    await call.message.edit_text("✅ O'chirildi")
    await call.answer()


@admin_router.callback_query(F.data == "a:orders")
async def a_orders(call: CallbackQuery):
    orders = db.recent_orders()
    if not orders:
        await call.answer("Buyurtma yo'q", show_alert=True)
        return
    for o in orders:
        await call.message.answer(
            order_text(o["id"]), reply_markup=status_kb(o["id"]), parse_mode="HTML"
        )
    await call.answer()


@admin_router.callback_query(F.data.startswith("st:"))
async def a_set_status(call: CallbackQuery, bot: Bot):
    _, oid, status = call.data.split(":")
    oid = int(oid)
    if status not in STATUSES or not db.order(oid):
        await call.answer("Xato", show_alert=True)
        return
    db.set_status(oid, status)
    await call.message.edit_text(order_text(oid), reply_markup=status_kb(oid), parse_mode="HTML")
    try:
        await bot.send_message(
            db.order(oid)["user_id"], f"Buyurtma #{oid} holati: {STATUSES[status]}"
        )
    except Exception:
        logging.warning("Mijozga xabar yuborilmadi (order %s)", oid)
    await call.answer("Yangilandi")


async def main():
    logging.basicConfig(level=logging.INFO)
    if not BOT_TOKEN:
        raise SystemExit("BOT_TOKEN topilmadi. .env faylini to'ldiring (.env.example ga qarang).")
    bot = Bot(BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(admin_router)
    dp.include_router(user_router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
