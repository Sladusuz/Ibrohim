/* ============================================================
   Sladus — Support AI (Vercel Serverless Function)
   POST /api/support-chat  { messages: [{role,content}], lang }
   Anthropic kaliti FAQAT shu yerda, serverda ishlatiladi —
   brauzerga hech qachon chiqmaydi.
   ============================================================ */
'use strict';

var buildSystemPrompt = require('../data/build-system-prompt').buildSystemPrompt;

var MODEL = 'claude-haiku-4-5-20251001';
var MAX_TURNS = 10;
var MAX_CHARS_PER_MSG = 1500;

function cors(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Faqat POST so\'rovlar qabul qilinadi.' }));
  }

  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      error: 'Server tomonda ANTHROPIC_API_KEY sozlanmagan. Vercel loyihasining Settings → Environment Variables bo\'limiga qo\'shing.'
    }));
  }

  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || !Array.isArray(body.messages) || !body.messages.length) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Xabarlar ro\'yxati bo\'sh.' }));
  }

  var lang = ['uz', 'ru', 'en'].indexOf(body.lang) > -1 ? body.lang : 'ru';

  var msgs = body.messages
    .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
    .slice(-MAX_TURNS)
    .map(function (m) { return { role: m.role, content: String(m.content).slice(0, MAX_CHARS_PER_MSG) }; });

  if (!msgs.length) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Xabar matni bo\'sh.' }));
  }

  try {
    var upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: buildSystemPrompt(lang),
        messages: msgs
      })
    });

    var data = await upstream.json();

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      return res.end(JSON.stringify({ error: (data && data.error && data.error.message) || 'AI xizmatidan xatolik qaytdi.' }));
    }

    var text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
    res.statusCode = 200;
    return res.end(JSON.stringify({ reply: text || '...' }));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'AI xizmatiga ulanib bo\'lmadi. Birozdan keyin qayta urinib ko\'ring.' }));
  }
};
