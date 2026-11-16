/* surec-adimlar-2 — Sekmeli Süreç Adımları (1 Kas 2026, T1-B varyant).
   Yer tutucular: sa2head sa2tabs sa2panels. Veri: json.data[] = [{no?, baslik{}, metin{}, ikon?}].
   Ortak yardımcılar: esc t guvenliHref gorselYol evet sayi metinleriYaz (desing metinleri kaçışlı). */
var D = json.desing || {};
var L = json.lang || "tr";

/* HTML kaçışı — html'e giden her değer bundan geçer */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Dil seçimi: aktif dil → tr → en → ilk anahtar (motorun wmPickLang'i) */
function t(v) { return wmPickLang(v, L); }
/* Bağlantı: dış/mailto/tel/# aynen; iç sayfa adı → dil önekli yol; javascript: vb. reddedilir */
function guvenliHref(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s) || s.charAt(0) === "/") { return s; }
  return wxLangInternalHref(s);
}
/* Görsel yolu: "/" ve http(s) aynen; yalın ad → /img/<ad>; tehlikeli şema → "" */
function gorselYol(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (s.charAt(0) === "/" || /^https?:\/\//i.test(s)) { return s; }
  return "/img/" + s;
}
function evet(v, d) {
  if (v === undefined || v === null || v === "") { return d; }
  return !(v === false || v === "false" || v === 0 || v === "0");
}
function sayi(v, d, mn, mx) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) { n = d; }
  return Math.min(mx, Math.max(mn, n));
}
/* desing'deki düz metin / {tr,en,ar} değerlerini {{anahtar}} yerine KAÇIŞLI yazar.
   Motor aynı yer tutucuyu ham yazardı; back.js önce davrandığı için kaçışsız değer html'e ulaşmaz. */
function metinleriYaz() {
  var k;
  for (k in D) {
    if (!Object.prototype.hasOwnProperty.call(D, k)) { continue; }
    var v = D[k];
    if (v == null) { continue; }
    var dilli = typeof v === "object" && !Array.isArray(v) && (typeof v.tr === "string" || typeof v.en === "string");
    if (typeof v === "object" && !dilli) { continue; }
    var deger = esc(t(v));
    var desen = new RegExp("\\{\\{" + String(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}\\}", "g");
    html = html.replace(desen, function () { return deger; });
  }
}

var sa2Items = Array.isArray(json.data) ? json.data : [];
var sa2Tpl = t(D.stepLabel);
var sa2Next = t(D.nextLabel);
var sa2Uid = esc(json.id || "x");
var sa2Adimlar = [];
var sa2i;
for (sa2i = 0; sa2i < sa2Items.length; sa2i++) {
  var it = sa2Items[sa2i] || {};
  var baslik = t(it.baslik);
  var metin = t(it.metin);
  if (!baslik && !metin) { continue; }
  var no = it.no != null && String(it.no).trim() !== "" ? String(it.no) : String(sa2Adimlar.length + 1);
  sa2Adimlar.push({ no: no, baslik: baslik, metin: metin, ikon: it.ikon || "" });
}

var sa2Tabs = "";
var sa2Panels = "";
for (sa2i = 0; sa2i < sa2Adimlar.length; sa2i++) {
  var a = sa2Adimlar[sa2i];
  var ilk = sa2i === 0;
  var etiket = sa2Tpl ? sa2Tpl.replace(/\{n\}/g, a.no) : "";
  var tabId = "sa2-" + sa2Uid + "-t" + sa2i;
  var panId = "sa2-" + sa2Uid + "-p" + sa2i;
  sa2Tabs += '<button type="button" class="modulex-sa2-tab" role="tab" id="' + tabId + '" aria-controls="' + panId + '" aria-selected="' + (ilk ? "true" : "false") + '"' + (ilk ? "" : ' tabindex="-1"') + ">" +
    '<span class="modulex-sa2-tno" aria-hidden="true">' + esc(a.no) + "</span>" +
    '<span class="modulex-sa2-tmetin"><span class="modulex-sa2-tetiket">' + esc(etiket) + "</span>" + esc(a.baslik) + "</span></button>";
  var sonraki = sa2i < sa2Adimlar.length - 1 && sa2Next
    ? '<button type="button" class="modulex-sa2-next" data-sa2-git="' + (sa2i + 1) + '">' + esc(sa2Next) + '<span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>'
    : "";
  sa2Panels += '<div class="modulex-sa2-panel" role="tabpanel" id="' + panId + '" aria-labelledby="' + tabId + '" tabindex="0">' +
    '<div class="modulex-sa2-pust"><span class="modulex-sa2-pno" aria-hidden="true">' + esc(a.no) + "</span>" +
    (a.ikon ? '<span class="modulex-sa2-pikon" aria-hidden="true"><span class="material-symbols-outlined">' + esc(a.ikon) + "</span></span>" : "") + "</div>" +
    '<p class="modulex-sa2-petiket">' + esc(etiket) + "</p>" +
    (a.baslik ? '<h3 class="modulex-sa2-h">' + esc(a.baslik) + "</h3>" : "") +
    (a.metin ? '<p class="modulex-sa2-p">' + esc(a.metin) + "</p>" : "") + sonraki + "</div>";
}

var sa2Head = "";
if (t(D.eyebrow) || t(D.title) || t(D.description)) {
  sa2Head = '<header class="modulex-sa2-head">' +
    (t(D.eyebrow) ? '<p class="modulex-sa2-eyebrow">' + esc(t(D.eyebrow)) + "</p>" : "") +
    (t(D.title) ? '<h2 class="modulex-sa2-title">' + esc(t(D.title)) + "</h2>" : "") +
    (t(D.description) ? '<p class="modulex-sa2-desc">' + esc(t(D.description)) + "</p>" : "") + "</header>";
}

html = html.replace(/\{\{sa2head\}\}/g, function () { return sa2Head; });
html = html.replace(/\{\{sa2tabs\}\}/g, function () { return sa2Tabs; });
html = html.replace(/\{\{sa2panels\}\}/g, function () { return sa2Panels; });
metinleriYaz();
