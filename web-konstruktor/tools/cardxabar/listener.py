#!/usr/bin/env python3
"""CardXabar tinglovchisi: kartaga pul tushganda to'lovni o'zi tasdiqlaydi.

Bu skript SIZNING kompyuteringizda/serveringizda ishlaydi. Telegram hisobingizga kirish ma'lumotlari faqat sizda qoladi.
Ishga tushirish va sozlash: README-uz.md.   Sinash:  python listener.py --test "matn"
"""
import os, re, sys, json, time, calendar, asyncio, argparse
try:
    import requests
except ImportError:
    requests = None

API = os.environ.get('IMPRO_API', 'https://impro-bot.impro-6c9a2d.workers.dev').rstrip('/')
CARD_BOT = os.environ.get('CARD_BOT', 'CardXabarBot').lstrip('@')
AUTO = os.environ.get('AUTO_CONFIRM', '1') != '0'
WINDOW_H = int(os.environ.get('MATCH_WINDOW_HOURS', '72'))
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'state.json')

IN_WORDS = re.compile(r'perevod\s+na\s+kartu|popolnen|пополнени|поступлени|зачислени|перевод\s+на\s+карт|kirim|to.?ldirish|o.?tkazma\s+qabul|tushum|qabul\s+qilindi|credit|deposit|income|➕|\+\s*\d', re.I)
OUT_WORDS = re.compile(r'оплат|списани|покупк|снятие|chiqim|to.?lov\s+qilindi|xarid|yechib|debit|purchase|withdraw|➖', re.I)
AMOUNT = re.compile(r'(?<![\d.,])(\d{1,3}(?:[   ,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:UZS|uzs|so.?m|сум|sum)', re.I)

LINE_IN = re.compile(r'^\s*(?:➕|\+)\s*([\d \u00a0\u202f.,]+?)\s*(?:UZS|so.?m|сум)?\s*$', re.I | re.M)
LINE_OUT = re.compile(r'^\s*(?:➖|-)\s*([\d \u00a0\u202f.,]+?)\s*(?:UZS|so.?m|сум)?\s*$', re.I | re.M)
CARD = re.compile(r'💳\s*\**\s*(\d{4})')
STAMP = re.compile(r'🕓\s*(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{2}):(\d{2})')

def _num(raw):
    raw = re.sub(r'[ \u00a0\u202f]', '', raw)
    if re.search(r',\d{3}(?:\.|$)', raw): raw = raw.replace(',', '')          # 150,000.00
    else: raw = raw.replace(',', '.')                                           # 150000,00
    try: return int(round(float(raw)))
    except ValueError: return None

def parse_msg(text):
    """CardXabar xabarini ajratadi: {'kind': 'in'|'out'|None, 'amount', 'last4', 'ts'} (ts = UTC epoch)."""
    t = str(text or '')
    kind, amount = None, None
    m = LINE_IN.search(t)
    if m: kind, amount = 'in', _num(m.group(1))
    else:
        m = LINE_OUT.search(t)
        if m: kind, amount = 'out', _num(m.group(1))
    if kind is None:  # zaxira: so'zlar bo'yicha (boshqa formatdagi xabarlar uchun)
        am = AMOUNT.search(t)
        if am:
            amount = _num(am.group(1))
            inc, out = bool(IN_WORDS.search(t)), bool(OUT_WORDS.search(t))
            kind = 'in' if inc and not out else 'out' if out and not inc else None
    c = CARD.search(t); st = STAMP.search(t); ts = None
    if st:
        d, mo, y, hh, mi = (int(x) for x in st.groups()); y += 2000 if y < 100 else 0
        try: ts = calendar.timegm(time.strptime(f'{y:04d}-{mo:02d}-{d:02d} {hh:02d}:{mi:02d}', '%Y-%m-%d %H:%M')) - 5 * 3600  # Toshkent = UTC+5
        except Exception: ts = None
    return {'kind': kind, 'amount': amount, 'last4': c.group(1) if c else None, 'ts': ts}

def parse(text):
    """Eski interfeys: (kirim_mi, summa)."""
    r = parse_msg(text)
    return (True if r['kind'] == 'in' else False if r['kind'] == 'out' else None), r['amount']

def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)

def load_state():
    try: return json.load(open(STATE))
    except Exception: return {'last_id': 0}
def save_state(s): json.dump(s, open(STATE, 'w'))

_tok = {'v': None}
def admin(method, path, body=None):
    if requests is None: raise RuntimeError("'requests' o'rnatilmagan: pip install requests")
    pw = os.environ.get('ADMIN_PASSWORD', '')
    if not pw: raise RuntimeError('ADMIN_PASSWORD berilmagan')
    for attempt in (1, 2):
        if not _tok['v']:
            r = requests.post(API + '/api/admin/login', json={'password': pw}, timeout=20); r.raise_for_status()
            _tok['v'] = r.json().get('token')
        r = requests.request(method, API + path, json=body, headers={'Authorization': 'Bearer ' + str(_tok['v'])}, timeout=20)
        if r.status_code == 401 and attempt == 1: _tok['v'] = None; continue
        r.raise_for_status(); return r.json()

def notify(text):
    tok, chat = os.environ.get('NOTIFY_BOT_TOKEN'), os.environ.get('NOTIFY_CHAT_ID')
    if not (tok and chat and requests): return
    try: requests.post(f'https://api.telegram.org/bot{tok}/sendMessage', json={'chat_id': chat, 'text': text}, timeout=15)
    except Exception as e: log('xabar yuborilmadi:', e)

def handle(amount, text, ts=None):
    """Kirimga mos kutilayotgan to'lovni topadi; bitta bo'lsa tasdiqlaydi, bo'lmasa egasiga aytadi."""
    try:
        pays = admin('GET', '/api/admin/payments')
    except Exception as e:
        log('API xatosi:', e); notify(f"⚠️ {amount:,} so'm tushdi, lekin serverga ulanib bo'lmadi: {e}".replace(',', ' ')); return
    def in_window(p):
        if not ts: return True
        try: cts = calendar.timegm(time.strptime(str(p['createdAt'])[:19], '%Y-%m-%dT%H:%M:%S'))
        except Exception: return True
        return cts - 300 <= ts <= cts + WINDOW_H * 3600
    cand = [p for p in pays if p.get('state') == 'pending' and int(p.get('uzs') or 0) == amount and in_window(p)]
    pretty = f"{amount:,}".replace(',', ' ')
    if len(cand) == 1 and cand[0].get('projectId') and AUTO:
        p = cand[0]
        try:
            admin('PUT', '/api/admin/projects/' + p['projectId'], {'paid': True})
            log('TASDIQLANDI', p['id'], pretty); notify(f"✅ {pretty} so'm tushdi. To'lov #{p['id']} avtomatik tasdiqlandi ({p.get('project') or p['projectId']}).")
        except Exception as e:
            log('tasdiqlashda xato:', e); notify(f"⚠️ {pretty} so'm tushdi (#{p['id']}), lekin tasdiqlab bo'lmadi: {e}")
    elif len(cand) == 0:
        log('mos buyurtma yo\'q', pretty); notify(f"💳 {pretty} so'm tushdi, lekin shu summaga mos kutilayotgan to'lov topilmadi. Qo'lda tekshiring.")
    else:
        ids = ', '.join('#' + str(p['id']) for p in cand)
        log('bir nechta mos', ids); notify(f"💳 {pretty} so'm tushdi. Bir xil summali {len(cand)} ta to'lov bor ({ids}). Qaysi biri ekanini o'zingiz tasdiqlang.")

def process(text):
    r = parse_msg(text)
    want = os.environ.get('CARD_LAST4', '8066')
    if r['last4'] and want and r['last4'] != want:
        log('boshqa karta, e\'tiborsiz:', r['last4']); return
    if r['kind'] == 'in' and r['amount']:
        log('KIRIM', r['amount'], '| karta', r['last4']); handle(r['amount'], text, r['ts'])
    elif r['kind'] == 'out': log("chiqim (e'tiborsiz):", r['amount'])
    else: log("xabar tushunilmadi (kirim/chiqim aniqlanmadi):", repr(str(text)[:80]))

async def main():
    try:
        from telethon import TelegramClient, events
    except ImportError:
        sys.exit("Telethon o'rnatilmagan: pip install telethon requests")
    api_id, api_hash = os.environ.get('TG_API_ID'), os.environ.get('TG_API_HASH')
    if not (api_id and api_hash): sys.exit('TG_API_ID va TG_API_HASH kerak (my.telegram.org). README-uz.md ni o\'qing.')
    sess = os.environ.get('TG_SESSION', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cardxabar.session'))
    client = TelegramClient(sess, int(api_id), api_hash)
    await client.start()  # birinchi marta telefon va kodni so'raydi
    me = await client.get_me(); log('ulandi:', me.first_name, '| tinglanmoqda: @' + CARD_BOT)
    st = load_state()
    # o'tkazib yuborilgan so'nggi xabarlarni ham ko'rib chiqamiz
    async for msg in client.iter_messages(CARD_BOT, limit=15):
        if msg.id > st['last_id'] and st['last_id'] and msg.text: process(msg.text)
    last = await client.get_messages(CARD_BOT, limit=1)
    if last: st['last_id'] = max(st['last_id'], last[0].id); save_state(st)
    @client.on(events.NewMessage(chats=CARD_BOT, incoming=True))
    async def on_msg(ev):
        if ev.message.id <= st['last_id']: return
        st['last_id'] = ev.message.id; save_state(st)
        if os.environ.get('DEBUG'): log('XOM XABAR:', repr(ev.message.text))
        process(ev.message.text)
    await client.run_until_disconnected()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--test', help='xabar matnini sinash (Telegramsiz)')
    a = ap.parse_args()
    if a.test is not None:
        print(parse_msg(a.test)); sys.exit(0)
    asyncio.run(main())
