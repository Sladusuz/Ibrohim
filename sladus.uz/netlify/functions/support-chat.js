/* ============================================================
   Sladus — Support AI (Netlify Function)
   POST /api/support-chat  (netlify.toml redirect'i orqali)
   { messages: [{role,content}], lang }
   ============================================================ */
'use strict';

var buildSystemPrompt = require('../../data/build-system-prompt').buildSystemPrompt;

var MODEL = 'claude-haiku-4-5-20251001';
var MAX_TURNS = 10;
var MAX_CHARS_PER_MSG = 1500;

exports.handler = async function (event) {
  var headers = { 'Content-Type': 'application/json; charset=utf-8' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Faqat POST so\'rovlar qabul qilinadi.' }) };
  }

  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return {
      statusCode: 500, headers: headers,
      body: JSON.stringify({ error: 'Server tomonda ANTHROPIC_API_KEY sozlanmagan. Netlify loyihasining Site settings → Environment variables bo\'limiga qo\'shing.' })
    };
  }

  var body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = null; }
  if (!body || !Array.isArray(body.messages) || !body.messages.length) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Xabarlar ro\'yxati bo\'sh.' }) };
  }

  var lang = ['uz', 'ru', 'en'].indexOf(body.lang) > -1 ? body.lang : 'ru';

  var msgs = body.messages
    .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
    .slice(-MAX_TURNS)
    .map(function (m) { return { role: m.role, content: String(m.content).slice(0, MAX_CHARS_PER_MSG) }; });

  if (!msgs.length) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Xabar matni bo\'sh.' }) };
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
      return { statusCode: upstream.status, headers: headers, body: JSON.stringify({ error: (data && data.error && data.error.message) || 'AI xizmatidan xatolik qaytdi.' }) };
    }

    var text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n').trim();
    return { statusCode: 200, headers: headers, body: JSON.stringify({ reply: text || '...' }) };
  } catch (err) {
    return { statusCode: 502, headers: headers, body: JSON.stringify({ error: 'AI xizmatiga ulanib bo\'lmadi. Birozdan keyin qayta urinib ko\'ring.' }) };
  }
};
