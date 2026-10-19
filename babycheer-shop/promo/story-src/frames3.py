import sys, json, base64, os, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.abspath(__file__)); FPS = 30
TL = json.load(open(f'{ROOT}/timeline.json'))
mode = sys.argv[1]  # 'test' times... or 'all'
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(H.func):
    def log_message(self, *a): pass
H = functools.partial(Q, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 8799), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
os.makedirs(f'{ROOT}/frames3', exist_ok=True)
def work(times, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--no-sandbox'])
        pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.on('pageerror', lambda e: print('PAGEERR', e))
        pg.goto('http://127.0.0.1:8799/render3.html'); pg.evaluate('a => init(a[0], a[1])', [TL, json.load(open(f'{ROOT}/cut3/bbox.json'))])
        for idx, t in times:
            data = pg.evaluate('t => render(t)', t)
            open(f'{ROOT}/frames3/{tag}{idx:05d}.jpg', 'wb').write(base64.b64decode(data))
        b.close()
if mode == 'test':
    ts = [float(x) for x in sys.argv[2:]]
    work([(i, t) for i, t in enumerate(ts)], 't')
else:
    n = int(TL['total'] * FPS) + 1; W = 4
    jobs = [[(i, i / FPS) for i in range(w, n, W)] for w in range(W)]
    th = [threading.Thread(target=work, args=(j, 'f')) for j in jobs]; t0 = time.time()
    [x.start() for x in th]; [x.join() for x in th]; print('frames3', n, 'in', round(time.time() - t0))
