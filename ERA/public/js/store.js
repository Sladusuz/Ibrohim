/* ERA — frontend-only mode.
 * When the site runs without server.js (opened as a file, VS Code "Go Live", any static
 * hosting), leads are kept in this browser's localStorage and the admin panel reads them
 * from there. Optionally every lead is also sent to Telegram straight from the browser.
 *
 * ⚠ Frontend mode limits: leads live only in the browser they were sent from, and the
 *   admin password below is visible to anyone who opens the page source. For real
 *   customers from other devices use server.js, or fill in the Telegram bot below.
 */
window.ERA_CONFIG = {
  admin: { user: "eratashkent", pass: "era2026" },
  // Telegram bot (optional): create a bot with @BotFather, paste its token, and put the
  // chat id of the person or group that should receive leads (e.g. from @userinfobot).
  telegram: { botToken: "", chatId: "" }
};

window.ERA_STORE = (function () {
  "use strict";
  const KEY = "era-leads", SEQ = "era-seq";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const write = (leads) => { localStorage.setItem(KEY, JSON.stringify(leads)); };

  function add(data) {
    const leads = read();
    const id = (parseInt(localStorage.getItem(SEQ) || "0", 10) || 0) + 1;
    const lead = {
      id, createdAt: new Date().toISOString(), status: "new", note: "",
      name: data.name, phone: data.phone, item: data.item, services: data.services || [],
      branch: data.branch, time: data.time, brand: data.brand || "", comment: data.comment || "",
      photos: data.photos || []
    };
    leads.unshift(lead);
    try { write(leads); }
    catch (e) { // storage full: keep the lead, drop its photos
      lead.photos = []; lead.note = "(rasmlar brauzer xotirasiga sig'madi)";
      write(leads);
    }
    localStorage.setItem(SEQ, String(id));
    return lead;
  }
  function update(id, patch) {
    const leads = read(), l = leads.find(x => x.id === id);
    if (!l) throw new Error("Topilmadi");
    Object.assign(l, patch, { updatedAt: new Date().toISOString() });
    write(leads);
    return l;
  }
  function remove(id) { write(read().filter(x => x.id !== id)); }

  async function telegram(lead) {
    const tg = window.ERA_CONFIG.telegram;
    if (!tg.botToken || !tg.chatId) return false;
    const base = "https://api.telegram.org/bot" + tg.botToken;
    const text = [
      "🆕 Yangi zayavka № " + lead.id,
      "👤 " + lead.name, "📞 " + lead.phone,
      "👞 " + lead.item + (lead.brand ? " — " + lead.brand : ""),
      lead.services.length ? "🧰 " + lead.services.join(", ") : "",
      "📍 " + lead.branch, "🕐 " + lead.time,
      lead.comment ? "💬 " + lead.comment : ""
    ].filter(Boolean).join("\n");
    await fetch(base + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: tg.chatId, text }) });
    for (const p of lead.photos || []) {
      const blob = await (await fetch(p)).blob(), fd = new FormData();
      fd.append("chat_id", tg.chatId); fd.append("photo", blob, "rasm.jpg"); fd.append("caption", "Zayavka № " + lead.id);
      await fetch(base + "/sendPhoto", { method: "POST", body: fd });
    }
    return true;
  }

  return { read, add, update, remove, telegram };
})();
