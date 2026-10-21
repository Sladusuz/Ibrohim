#!/usr/bin/env python3
"""CardXabar tinglovchisi: kartaga pul tushganda to'lovni o'zi tasdiqlaydi.

Bu skript SIZNING kompyuteringizda/serveringizda ishlaydi. Telegram hisobingizga kirish ma'lumotlari faqat sizda qoladi.
Ishga tushirish va sozlash: README-uz.md.   Sinash:  python listener.py --test "matn"
"""
import os, re, sys, json, time, asyncio, argparse
try:
    import requests
except ImportError:
    requests = None

API = os.environ.get('IMPRO_API', 'https://impro-bot.impro-6c9a2d.workers.dev').rstrip('/')
CARD_BOT = os.environ.get('CARD_BOT', 'CardXabarBot').lstrip('@')
AUTO = os.environ.get('AUTO_CONFIRM', '1') != '0'
WINDOW_H = int(os.environ.get('MATCH_WINDOW_HOURS', '72'))
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'state.json')

IN_WORDS = re.compile(r'пополнени|поступлени|зачислени|перевод\s+на\s+карт|kirim|to.?ldirish|o.?tkazma\s+qabul|tushum|qabul\s+qilindi|credit|deposit|income|➕|\+\s*\d', re.I)
OUT_WORDS = re.compile(r'оплат|списани|покупк|снятие|chiqim|to.?lov\s+qilindi|xarid|yechib|debit|purchase|withdraw|➖', re.I)
AMOUNT = re.compile(r'(?<![\d.,])(\d{1,3}(?:[   ,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:UZS|uzs|so.?m|сум|sum)', re.I)

def parse(text):
    """Xabardan (kirim_mi, summa_so'm) ni ajratadi. Aniqlab bo'lmasa (None, None)."""
    t = str(text or '')
    m = AMOUNT.search(t)
    if not m:
        return None, None
    raw = re.sub(r'[   ]', '', m.group(1))
    if re.search(r',\d{3}(?:\.|$)', raw): raw = raw.replace(',', '')          # 150,000.00
    else: raw = raw.replace(',', '.')                                           # 150000,00
    try: amount = int(round(float(raw)))
    except ValueError: return None, None
    inc, out = bool(IN_WORDS.search(t)), bool(OUT_WORDS.search(t))
    if inc and not out: return True, amount
    if out and not inc: return False, amount
    if inc and out:  # ikkalasi ham bor: birinchi uchragan so'z hal qiladi
        return (IN_WORDS.search(t).start() < OUT_WORDS.search(t).start()), amount
    return None, amount

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

def handle(amount, text):
    """Kirimga mos kutilayotgan to'lovni topadi; bitta bo'lsa tasdiqlaydi, bo'lmasa egasiga aytadi."""
    try:
        pays = admin('GET', '/api/admin/payments')
    except Exception as e:
        log('API xatosi:', e); notify(f"⚠️ {amount:,} so'm tushdi, lekin serverga ulanib bo'lmadi: {e}".replace(',', ' ')); return
    cand = [p for p in pays if p.get('state') == 'pending' and int(p.get('uzs') or 0) == amount]
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
    inc, amount = parse(text)
    if inc is True and amount:
        log('KIRIM', amount); handle(amount, text)
    elif inc is False: log('chiqim (e\'tiborsiz):', amount)
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
        print(parse(a.test)); sys.exit(0)
    asyncio.run(main())
