import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "market.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo TEXT,
    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cart (
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL,
    PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL
);
"""


def connect(path=DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


class Database:
    def __init__(self, path=DB_PATH):
        self.conn = connect(path)
        self.conn.executescript(SCHEMA)

    # --- catalog ---
    def categories(self):
        return self.conn.execute("SELECT * FROM categories ORDER BY name").fetchall()

    def add_category(self, name: str) -> bool:
        try:
            with self.conn:
                self.conn.execute("INSERT INTO categories(name) VALUES (?)", (name,))
            return True
        except sqlite3.IntegrityError:
            return False

    def products(self, category_id: int):
        return self.conn.execute(
            "SELECT * FROM products WHERE category_id=? AND active=1 ORDER BY name",
            (category_id,),
        ).fetchall()

    def product(self, product_id: int):
        return self.conn.execute(
            "SELECT * FROM products WHERE id=? AND active=1", (product_id,)
        ).fetchone()

    def add_product(self, category_id, name, price, description, photo):
        with self.conn:
            self.conn.execute(
                "INSERT INTO products(category_id,name,price,description,photo)"
                " VALUES (?,?,?,?,?)",
                (category_id, name, price, description, photo),
            )

    def delete_product(self, product_id: int):
        # buyurtma tarixi saqlanadi (order_items da nom/narx nusxasi bor)
        with self.conn:
            self.conn.execute("UPDATE products SET active=0 WHERE id=?", (product_id,))
            self.conn.execute("DELETE FROM cart WHERE product_id=?", (product_id,))

    def all_products(self):
        return self.conn.execute(
            "SELECT * FROM products WHERE active=1 ORDER BY id DESC LIMIT 50"
        ).fetchall()

    # --- cart ---
    def cart(self, user_id: int):
        return self.conn.execute(
            "SELECT p.id, p.name, p.price, c.qty FROM cart c"
            " JOIN products p ON p.id=c.product_id"
            " WHERE c.user_id=? AND p.active=1 ORDER BY p.name",
            (user_id,),
        ).fetchall()

    def cart_add(self, user_id: int, product_id: int, delta: int = 1):
        with self.conn:
            self.conn.execute(
                "INSERT INTO cart(user_id,product_id,qty) VALUES (?,?,?)"
                " ON CONFLICT(user_id,product_id) DO UPDATE SET qty=qty+?",
                (user_id, product_id, max(delta, 1), delta),
            )
            self.conn.execute("DELETE FROM cart WHERE qty<=0")

    def cart_remove(self, user_id: int, product_id: int):
        with self.conn:
            self.conn.execute(
                "DELETE FROM cart WHERE user_id=? AND product_id=?", (user_id, product_id)
            )

    def cart_clear(self, user_id: int):
        with self.conn:
            self.conn.execute("DELETE FROM cart WHERE user_id=?", (user_id,))

    # --- orders ---
    def create_order(self, user_id: int, name: str, phone: str, address: str):
        items = self.cart(user_id)
        if not items:
            return None
        total = sum(i["price"] * i["qty"] for i in items)
        with self.conn:
            cur = self.conn.execute(
                "INSERT INTO orders(user_id,name,phone,address,total) VALUES (?,?,?,?,?)",
                (user_id, name, phone, address, total),
            )
            order_id = cur.lastrowid
            self.conn.executemany(
                "INSERT INTO order_items(order_id,product_name,price,qty) VALUES (?,?,?,?)",
                [(order_id, i["name"], i["price"], i["qty"]) for i in items],
            )
            self.conn.execute("DELETE FROM cart WHERE user_id=?", (user_id,))
        return order_id

    def order(self, order_id: int):
        return self.conn.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()

    def order_items(self, order_id: int):
        return self.conn.execute(
            "SELECT * FROM order_items WHERE order_id=?", (order_id,)
        ).fetchall()

    def user_orders(self, user_id: int):
        return self.conn.execute(
            "SELECT * FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 10", (user_id,)
        ).fetchall()

    def recent_orders(self, limit: int = 10):
        return self.conn.execute(
            "SELECT * FROM orders ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()

    def set_status(self, order_id: int, status: str):
        with self.conn:
            self.conn.execute("UPDATE orders SET status=? WHERE id=?", (status, order_id))
