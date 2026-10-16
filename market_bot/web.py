"""Mini App serveri: statik sayt (webapp/) va /api. `m` botning asosiy moduli (bot.py)."""
import hashlib
import hmac
import json
import logging
import time
from pathlib import Path
from urllib.parse import parse_qsl

from aiohttp import web

import seed_data
from db import OrderError, normalize_phone, order_no

WEBAPP_DIR = Path(__file__).parent / "webapp"


def check_init_data(init_data: str, token: str):
    """Telegram WebApp initData imzosini tekshiradi. To'g'ri bo'lsa foydalanuvchi dict, aks holda None."""
    if not init_data:
        return None
    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    got = pairs.pop("hash", "")
    check = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    if not hmac.compare_digest(hmac.new(secret, check.encode(), hashlib.sha256).hexdigest(), got):
        return None
    if time.time() - int(pairs.get("auth_date", 0)) > 86400:
        return None
    try:
        return json.loads(pairs["user"])
    except (KeyError, ValueError):
        return None


def err(message: str, status: int = 400):
    return web.json_response({"error": message}, status=status)


def create_app(bot, m) -> web.Application:
    photo_cache: dict[str, bytes] = {}

    def product_json(p):
        colors = [{"name": c, "hex": seed_data.HEX.get(c, "#7d8594")} for c in json.loads(p["colors"])]
        return {
            "id": str(p["id"]), "category_id": str(p["category_id"]), "title": p["name"], "brand": "BabyCheer",
            "price": p["price"], "old_price": p["old_price"], "stock": p["stock"], "badge": p["badge"],
            "short": p["short"], "description": p["description"], "specs": json.loads(p["specs"]),
            "images": [f"/photo/{p['photo']}"] if p["photo"] else [], "colors": colors,
            "color": colors[0]["hex"] if colors else "#2b59ff", "model3d": p["model3d"],
            "featured": bool(p["featured"]), "active": True, "sort": p["id"],
        }

    async def catalog(request):
        s = m.db.settings()
        payments = [
            {"id": k, "label": v.split(" ", 1)[1].split(" (")[0], "hint": (v.split("(")[1].rstrip(")") if "(" in v else "")}
            for k, v in m.PAYMENTS.items()
        ]
        return web.json_response({
            "categories": [{"id": str(c["id"]), "slug": c["slug"], "name": c["name"], "sort": c["sort"]} for c in m.db.categories()],
            "products": [product_json(p) for p in m.db.all_products()],
            "settings": {
                "name": s["name"], "phone": s["phone"], "telegram": s["telegram"], "channel": s["channel"],
                "instagram": s["instagram"], "freeFrom": int(s["freeFrom"]), "deliveryFee": int(s["deliveryFee"]),
                "warrantyMonths": int(s["warrantyMonths"]), "payments": payments,
            },
        })

    async def photo(request):
        fid = request.match_info["fid"]
        if fid not in photo_cache:
            try:
                f = await bot.get_file(fid)
                buf = await bot.download_file(f.file_path)
                photo_cache[fid] = buf.read()
            except Exception:
                return web.Response(status=404)
        return web.Response(body=photo_cache[fid], content_type="image/jpeg",
                            headers={"Cache-Control": "public, max-age=86400"})

    async def place_order(request):
        user = check_init_data(request.headers.get("X-Tg-Init-Data", ""), m.BOT_TOKEN)
        if not user:
            return err("Buyurtma berish uchun do'konni Telegram ichida oching.", 401)
        try:
            data = await request.json()
        except ValueError:
            return err("Noto'g'ri so'rov")
        name = str(data.get("name", "")).strip()[:80]
        phone = normalize_phone(str(data.get("phone", "")))
        delivery = data.get("delivery")
        payment = data.get("payment")
        address = str(data.get("address", "")).strip()[:250]
        comment = str(data.get("comment", "")).strip()[:300]
        if len(name) < 2:
            return err("Ismingizni kiriting")
        if not phone:
            return err("Telefon raqami noto'g'ri")
        if delivery not in m.DELIVERY:
            return err("Yetkazish usulini tanlang")
        if delivery == "courier" and len(address) < 5:
            return err("Manzilni kiriting")
        if delivery == "pickup":
            address = ""
        if payment not in m.PAYMENTS:
            return err("To'lov usulini tanlang")
        try:
            items = [{"pid": int(i["id"]), "color": i.get("color", ""), "qty": int(i["qty"])} for i in data.get("items", [])]
            oid = m.db.create_order_items(user["id"], name, phone, address, comment, delivery, payment, items)
        except (OrderError, KeyError, ValueError, TypeError) as e:
            return err(str(e) if isinstance(e, OrderError) else "Savat ma'lumoti noto'g'ri")

        o = m.db.order(oid)
        out = {"no": order_no(oid), "total": o["total"], "fee": o["delivery_fee"]}
        text = f"✅ Buyurtma <b>{order_no(oid)}</b> qabul qilindi!\n\n" + m.order_text(oid)
        if payment == "transfer":
            out["transfer"] = {"card": m.CARD_NUMBER, "owner": m.CARD_OWNER}
            text += (f"\n\n🏦 Karta: <code>{m.e(m.CARD_NUMBER)}</code>" + (f" ({m.e(m.CARD_OWNER)})" if m.CARD_OWNER else "")
                     + f"\nIzohga <b>{order_no(oid)}</b> yozing va chek rasmini yuboring.")
        if payment == "online":
            try:
                out["invoice_url"] = await bot.create_invoice_link(
                    title=f"Buyurtma {order_no(oid)}", description="BabyCheer: buyurtma uchun to'lov",
                    payload=f"order:{oid}", provider_token=m.PROVIDER_TOKEN, currency="UZS",
                    prices=m.invoice_prices(oid),
                )
            except Exception:
                logging.exception("Invoice havolasi yaratilmadi")
        try:
            await bot.send_message(user["id"], text, reply_markup=m.pay_kb(o))
        except Exception:
            logging.warning("Mijozga chatga yozib bo'lmadi: %s", user["id"])
        await m.notify_admins(bot, "🔔 <b>Yangi buyurtma (Mini App)</b>\n\n" + m.order_text(oid), m.admin_order_kb(o))
        return web.json_response(out)

    async def track(request):
        o = m.db.find_order(request.query.get("no", ""), request.query.get("phone", ""))
        if not o:
            return web.json_response({"order": None})
        return web.json_response({"order": {
            "no": order_no(o["id"]), "status": o["status"], "created_at": o["created_at"].replace(" ", "T") + "Z",
            "total": o["total"], "items": [
                {"title": i["product_name"], "color": i["color"], "qty": i["qty"], "price": i["price"]}
                for i in m.db.order_items(o["id"])
            ],
        }})

    async def message(request):
        try:
            d = await request.json()
        except ValueError:
            return err("Noto'g'ri so'rov")
        name, phone, text = str(d.get("name", "")).strip()[:80], normalize_phone(str(d.get("phone", ""))), str(d.get("message", "")).strip()[:1000]
        if len(name) < 2:
            return err("Ismingizni kiriting")
        if not phone:
            return err("Telefon raqami noto'g'ri")
        if len(text) < 3:
            return err("Xabarni yozing")
        await m.notify_admins(bot, f"✉️ <b>Saytdan xabar</b>\n{m.e(name)} · {phone}\n\n{m.e(text)}")
        return web.json_response({"ok": True})

    async def index(request):
        return web.FileResponse(WEBAPP_DIR / "index.html")

    @web.middleware
    async def no_cache_html(request, handler):
        resp = await handler(request)
        if request.path.endswith((".html", ".js", ".css")) or request.path == "/":
            resp.headers["Cache-Control"] = "no-cache"
        return resp

    app = web.Application(middlewares=[no_cache_html])
    app.add_routes([
        web.get("/api/catalog", catalog), web.post("/api/order", place_order),
        web.get("/api/track", track), web.post("/api/message", message),
        web.get("/photo/{fid}", photo), web.get("/", index),
        web.static("/", WEBAPP_DIR, show_index=False),
    ])
    return app
