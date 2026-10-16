import json
import sqlite3
from pathlib import Path

import seed_data

DB_PATH = Path(__file__).parent / "market.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    old_price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    badge TEXT NOT NULL DEFAULT '',
    short TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs TEXT NOT NULL DEFAULT '{}',
    colors TEXT NOT NULL DEFAULT '[]',
    photo TEXT,
    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color TEXT NOT NULL DEFAULT '',
    qty INTEGER NOT NULL,
    UNIQUE (user_id, product_id, color)
);
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    delivery TEXT NOT NULL,
    payment TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL
);
"""


class OrderError(Exception):
    pass


def order_no(order_id: int) -> str:
    return f"BC-{1000 + order_id}"


def normalize_phone(raw: str) -> str:
    digits = "".join(ch for ch in raw if ch.isdigit())
    return "+998" + digits[-9:] if len(digits) >= 9 else ""


class Database:
    def __init__(self, path=DB_PATH):
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")
        self.conn.executescript(SCHEMA)
        self._seed()

    def _seed(self):
        if self.conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]:
            return
        with self.conn:
            for k, v in seed_data.SETTINGS.items():
                self.conn.execute("INSERT OR IGNORE INTO settings VALUES (?,?)", (k, v))
            ids = {}
            for slug, name, sort in seed_data.CATEGORIES:
                cur = self.conn.execute(
                    "INSERT INTO categories(slug,name,sort) VALUES (?,?,?)", (slug, name, sort)
                )
                ids[slug] = cur.lastrowid
            for slug, name, price, old, stock, badge, short, desc, specs, colors in seed_data.PRODUCTS:
                self.conn.execute(
                    "INSERT INTO products(category_id,name,price,old_price,stock,badge,short,description,specs,colors)"
                    " VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (ids[slug], name, price, old, stock, badge, short, desc,
                     json.dumps(specs, ensure_ascii=False), json.dumps(colors, ensure_ascii=False)),
                )

    # --- settings ---
    def settings(self) -> dict:
        return {r["key"]: r["value"] for r in self.conn.execute("SELECT * FROM settings")}

    def set_setting(self, key: str, value: str):
        with self.conn:
            self.conn.execute("INSERT OR REPLACE INTO settings VALUES (?,?)", (key, value))

    def delivery_fee(self, subtotal: int, delivery: str) -> int:
        s = self.settings()
        if delivery == "courier" and 0 < subtotal < int(s.get("freeFrom", 1000000)):
            return int(s.get("deliveryFee", 40000))
        return 0

    # --- catalog ---
    def categories(self):
        return self.conn.execute("SELECT * FROM categories ORDER BY sort, name").fetchall()

    def add_category(self, name: str) -> bool:
        slug = name.lower().replace(" ", "-")
        try:
            with self.conn:
                self.conn.execute(
                    "INSERT INTO categories(slug,name,sort) VALUES (?,?,99)", (slug, name)
                )
            return True
        except sqlite3.IntegrityError:
            return False

    def products(self, category_id: int):
        return self.conn.execute(
            "SELECT * FROM products WHERE category_id=? AND active=1 ORDER BY id", (category_id,)
        ).fetchall()

    def search(self, text: str):
        return self.conn.execute(
            "SELECT * FROM products WHERE active=1 AND (name LIKE ? OR short LIKE ?) LIMIT 15",
            (f"%{text}%", f"%{text}%"),
        ).fetchall()

    def product(self, product_id: int):
        return self.conn.execute(
            "SELECT * FROM products WHERE id=? AND active=1", (product_id,)
        ).fetchone()

    def all_products(self):
        return self.conn.execute("SELECT * FROM products WHERE active=1 ORDER BY id").fetchall()

    def add_product(self, category_id, name, price, old_price, stock, short, colors, photo):
        with self.conn:
            self.conn.execute(
                "INSERT INTO products(category_id,name,price,old_price,stock,short,description,colors,photo)"
                " VALUES (?,?,?,?,?,?,?,?,?)",
                (category_id, name, price, old_price, stock, short, short,
                 json.dumps(colors, ensure_ascii=False), photo),
            )

    def update_product(self, product_id: int, field: str, value):
        if field not in {"price", "old_price", "stock", "photo", "name", "short"}:
            raise ValueError(field)
        with self.conn:
            self.conn.execute(f"UPDATE products SET {field}=? WHERE id=?", (value, product_id))

    def delete_product(self, product_id: int):
        with self.conn:
            self.conn.execute("UPDATE products SET active=0 WHERE id=?", (product_id,))
            self.conn.execute("DELETE FROM cart WHERE product_id=?", (product_id,))

    # --- cart ---
    def cart(self, user_id: int):
        return self.conn.execute(
            "SELECT c.id, c.color, c.qty, p.id AS pid, p.name, p.price, p.stock FROM cart c"
            " JOIN products p ON p.id=c.product_id WHERE c.user_id=? AND p.active=1 ORDER BY c.id",
            (user_id,),
        ).fetchall()

    def cart_add(self, user_id: int, product_id: int, color: str) -> bool:
        p = self.product(product_id)
        if not p or p["stock"] <= 0:
            return False
        row = self.conn.execute(
            "SELECT qty FROM cart WHERE user_id=? AND product_id=? AND color=?",
            (user_id, product_id, color),
        ).fetchone()
        if row and row["qty"] >= p["stock"]:
            return False
        with self.conn:
            self.conn.execute(
                "INSERT INTO cart(user_id,product_id,color,qty) VALUES (?,?,?,1)"
                " ON CONFLICT(user_id,product_id,color) DO UPDATE SET qty=qty+1",
                (user_id, product_id, color),
            )
        return True

    def cart_change(self, user_id: int, cart_id: int, delta: int):
        row = self.conn.execute(
            "SELECT c.qty, p.stock FROM cart c JOIN products p ON p.id=c.product_id"
            " WHERE c.id=? AND c.user_id=?",
            (cart_id, user_id),
        ).fetchone()
        if not row:
            return
        qty = row["qty"] + delta
        if qty <= 0:
            self.cart_remove(user_id, cart_id)
        elif qty <= row["stock"]:
            with self.conn:
                self.conn.execute("UPDATE cart SET qty=? WHERE id=?", (qty, cart_id))

    def cart_remove(self, user_id: int, cart_id: int):
        with self.conn:
            self.conn.execute("DELETE FROM cart WHERE id=? AND user_id=?", (cart_id, user_id))

    def cart_clear(self, user_id: int):
        with self.conn:
            self.conn.execute("DELETE FROM cart WHERE user_id=?", (user_id,))

    def cart_totals(self, user_id: int, delivery: str = "courier"):
        items = self.cart(user_id)
        sub = sum(i["price"] * i["qty"] for i in items)
        fee = self.delivery_fee(sub, delivery)
        return sub, fee, sub + fee

    # --- orders ---
    def create_order(self, user_id, name, phone, address, comment, delivery, payment) -> int:
        """Narx, ombor va yetkazish narxi serverda (shu yerda) hisoblanadi, saytdagi place_order() kabi."""
        items = self.cart(user_id)
        if not items:
            raise OrderError("Savat bo'sh")
        for i in items:
            if i["qty"] > i["stock"]:
                raise OrderError(f"«{i['name']}» omborda yetarli emas (qoldi: {i['stock']})")
        sub = sum(i["price"] * i["qty"] for i in items)
        fee = self.delivery_fee(sub, delivery)
        with self.conn:
            cur = self.conn.execute(
                "INSERT INTO orders(user_id,name,phone,address,comment,delivery,payment,"
                "subtotal,delivery_fee,total) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (user_id, name, phone, address, comment, delivery, payment, sub, fee, sub + fee),
            )
            oid = cur.lastrowid
            for i in items:
                self.conn.execute(
                    "INSERT INTO order_items VALUES (?,?,?,?,?,?)",
                    (oid, i["pid"], i["name"], i["color"], i["price"], i["qty"]),
                )
                self.conn.execute(
                    "UPDATE products SET stock=stock-? WHERE id=?", (i["qty"], i["pid"])
                )
            self.conn.execute("DELETE FROM cart WHERE user_id=?", (user_id,))
        return oid

    def order(self, order_id: int):
        return self.conn.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()

    def order_items(self, order_id: int):
        return self.conn.execute(
            "SELECT * FROM order_items WHERE order_id=?", (order_id,)
        ).fetchall()

    def find_order(self, no: str, phone: str):
        no = no.strip().upper()
        if not no.startswith("BC-") or not no[3:].isdigit():
            return None
        o = self.order(int(no[3:]) - 1000)
        return o if o and normalize_phone(o["phone"]) == normalize_phone(phone) else None

    def user_orders(self, user_id: int):
        return self.conn.execute(
            "SELECT * FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 10", (user_id,)
        ).fetchall()

    def last_contact(self, user_id: int):
        return self.conn.execute(
            "SELECT name, phone, address FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 1",
            (user_id,),
        ).fetchone()

    def recent_orders(self, limit: int = 10):
        return self.conn.execute("SELECT * FROM orders ORDER BY id DESC LIMIT ?", (limit,)).fetchall()

    def set_status(self, order_id: int, status: str):
        o = self.order(order_id)
        with self.conn:
            if status == "cancelled" and o["status"] != "cancelled":
                for i in self.order_items(order_id):  # bekor qilinsa ombor qaytariladi
                    self.conn.execute(
                        "UPDATE products SET stock=stock+? WHERE id=?", (i["qty"], i["product_id"])
                    )
            self.conn.execute("UPDATE orders SET status=? WHERE id=?", (status, order_id))

    def mark_paid(self, order_id: int):
        with self.conn:
            self.conn.execute("UPDATE orders SET paid=1 WHERE id=?", (order_id,))
