/* ============================================================
   Sladus — Support AI (Vercel Serverless Function)
   POST /api/support-chat  { messages: [{role,content}], lang }
   Cloudflare Workers AI orqali ishlaydi — kalit FAQAT shu yerda,
   serverda ishlatiladi, brauzerga hech qachon chiqmaydi.
   ============================================================ */
'use strict';

var buildSystemPrompt = require('../data/build-system-prompt').buildSystemPrompt;

var MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
var MAX_TURNS = 10;
var MAX_CHARS_PER_MSG = 1500;

function cors(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Faqat POST so‘rovlar qabul qilinadi.' }));
  }

  var accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  var token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      error: 'Server tomonda CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN sozlanmagan. Vercel loyihasining Settings → Environment Variables bo‘limiga qo‘shing.'
    }));
  }

  var body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || !Array.isArray(body.messages) || !body.messages.length) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Xabarlar ro‘yxati bo‘sh.' }));
  }

  var lang = ['uz', 'ru', 'en'].indexOf(body.lang) > -1 ? body.lang : 'ru';

  var msgs = body.messages
    .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
    .slice(-MAX_TURNS)
    .map(function (m) { return { role: m.role, content: String(m.content).slice(0, MAX_CHARS_PER_MSG) }; });

  if (!msgs.length) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Xabar matni bo‘sh.' }));
  }

  try {
    var upstream = await fetch(
      'https://api.cloudflare.com/client/v4/accounts/' + accountId + '/ai/run/' + MODEL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          max_tokens: 500,
          messages: [{ role: 'system', content: buildSystemPrompt(lang) }].concat(msgs)
        })
      }
    );

    var data = await upstream.json();

    if (!upstream.ok || !data.success) {
      res.statusCode = upstream.ok ? 502 : upstream.status;
      var errMsg = (data && data.errors && data.errors[0] && data.errors[0].message) || 'AI xizmatidan xatolik qaytdi.';
      return res.end(JSON.stringify({ error: errMsg }));
    }

    var text = (data.result && String(data.result.response || '').trim()) || '';
    res.statusCode = 200;
    return res.end(JSON.stringify({ reply: text || '...' }));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'AI xizmatiga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.' }));
  }
};
