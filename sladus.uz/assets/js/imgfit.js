/* ============================================================
   Sladus — rasmni avtomatik moslash (admin va panel uchun)
   Har qanday rasm (telefon suratlari, katta PNG/JPG, HEIC→JPEG) ochiladi,
   EXIF yo'nalishi to'g'rilanadi, eng uzun tomoni `max` pikselgacha
   kichraytiriladi va WebP (yoki JPEG) ga siqiladi. Natija odatda
   100–300 KB — sayt tez ochiladi, xotira to'lmaydi.
   ============================================================ */
window.SladusImg = (function () {
  'use strict';

  function decode(file) {
    return new Promise(function (ok, no) {
      function viaImg() {
        var url = URL.createObjectURL(file), im = new Image();
        im.onload = function () { ok({ src: im, w: im.naturalWidth, h: im.naturalHeight, done: function () { URL.revokeObjectURL(url); } }); };
        im.onerror = function () { URL.revokeObjectURL(url); no(new Error('Rasm o‘qilmadi. JPG, PNG yoki WEBP tanlang.')); };
        im.src = url;
      }
      if (window.createImageBitmap) {
        createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bm) {
          ok({ src: bm, w: bm.width, h: bm.height, done: function () { if (bm.close) bm.close(); } });
        }, viaImg);
      } else viaImg();
    });
  }

  function toBlob(canvas, type, q) {
    return new Promise(function (ok) { canvas.toBlob(function (b) { ok(b); }, type, q); });
  }
  function readURL(blob) {
    return new Promise(function (ok, no) {
      var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = function () { no(new Error('Rasm o‘qilmadi')); };
      r.readAsDataURL(blob);
    });
  }

  /* fit(file, {max, quality}) -> Promise<{blob, dataUrl, type, ext, width, height, kb}> */
  function fit(file, opt) {
    opt = opt || {};
    var max = opt.max || 1400, q = opt.quality || .84;
    if (!file || !/^image\//.test(file.type || '')) return Promise.reject(new Error('Bu rasm fayli emas'));
    if (file.size > 40 * 1024 * 1024) return Promise.reject(new Error('Fayl juda katta (40 MB dan oshmasin)'));
    return decode(file).then(function (d) {
      var k = Math.min(1, max / Math.max(d.w, d.h)), w = Math.max(1, Math.round(d.w * k)), h = Math.max(1, Math.round(d.h * k));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(d.src, 0, 0, w, h);
      d.done();
      return toBlob(c, 'image/webp', q).then(function (b) {
        if (b && b.type === 'image/webp') return b;
        /* WebP qo'llab-quvvatlanmasa — JPEG (shaffof fon oq bo'ladi) */
        var c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
        var x2 = c2.getContext('2d'); x2.fillStyle = '#fff'; x2.fillRect(0, 0, w, h); x2.drawImage(c, 0, 0);
        return toBlob(c2, 'image/jpeg', q);
      }).then(function (b) {
        return readURL(b).then(function (u) {
          return { blob: b, dataUrl: u, type: b.type, ext: b.type === 'image/webp' ? 'webp' : 'jpg', width: w, height: h, kb: Math.round(b.size / 1024) };
        });
      });
    });
  }

  return { fit: fit };
})();
