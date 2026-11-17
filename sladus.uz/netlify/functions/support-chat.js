/* ============================================================
   Sladus — Support AI (Netlify Function)
   POST /api/support-chat  (netlify.toml redirect’i orqali)
   { messages: [{role,content}], lang }
   Cloudflare Workers AI orqali ishlaydi.
   ============================================================ */
'use strict';

var buildSystemPrompt = require('../../data/build-system-prompt').buildSystemPrompt;

var MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
var MAX_TURNS = 10;
var MAX_CHARS_PER_MSG = 1500;

exports.handler = async function (event) {
  var headers = { 'Content-Type': 'application/json; charset=utf-8' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Faqat POST so‘rovlar qabul qilinadi.' }) };
  }

  var accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  var token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    return {
      statusCode: 500, headers: headers,
      body: JSON.stringify({ error: 'Server tomonda CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN sozlanmagan. Netlify loyihasining Site settings → Environment variables bo‘limiga qo‘shing.' })
    };
  }

  var body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = null; }
  if (!body || !Array.isArray(body.messages) || !body.messages.length) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Xabarlar ro‘yxati bo‘sh.' }) };
  }

  var lang = ['uz', 'ru', 'en'].indexOf(body.lang) > -1 ? body.lang : 'ru';

  var msgs = body.messages
    .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
    .slice(-MAX_TURNS)
    .map(function (m) { return { role: m.role, content: String(m.content).slice(0, MAX_CHARS_PER_MSG) }; });

  if (!msgs.length) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Xabar matni bo‘sh.' }) };
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
      var errMsg = (data && data.errors && data.errors[0] && data.errors[0].message) || 'AI xizmatidan xatolik qaytdi.';
      return { statusCode: upstream.ok ? 502 : upstream.status, headers: headers, body: JSON.stringify({ error: errMsg }) };
    }

    var text = (data.result && String(data.result.response || '').trim()) || '';
    return { statusCode: 200, headers: headers, body: JSON.stringify({ reply: text || '...' }) };
  } catch (err) {
    return { statusCode: 502, headers: headers, body: JSON.stringify({ error: 'AI xizmatiga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.' }) };
  }
};
