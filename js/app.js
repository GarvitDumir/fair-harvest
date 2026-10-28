/* Fair Harvest – Seller Console
   HTML + Tailwind CSS (CDN) + vanilla JS. Data is kept in localStorage so it works without a backend. */

const CROPS = {
  kiwi:      { name: 'Arunachal Organic Kiwi', short: 'Kiwi',      icon: '🥝', price: 140,  shelf: 7,  hue: 55, sat: 0.35 },
  ginger:    { name: 'Ginger',                 short: 'Ginger',    icon: '🫚', price: 70,   shelf: 14, hue: 38, sat: 0.35 },
  turmeric:  { name: 'Turmeric',               short: 'Turmeric',  icon: '🟡', price: 90,   shelf: 14, hue: 42, sat: 0.80 },
  cardamom:  { name: 'Large Cardamom',         short: 'Cardamom',  icon: '🌿', price: 1400, shelf: 30, hue: 95, sat: 0.45 },
  orange:    { name: 'Orange',                 short: 'Orange',    icon: '🍊', price: 55,   shelf: 10, hue: 28, sat: 0.90 },
  pineapple: { name: 'Pineapple',              short: 'Pineapple', icon: '🍍', price: 40,   shelf: 5,  hue: 48, sat: 0.60 }
};
const GRADES = {
  A: { label: 'Grade A · Premium Export', mult: 1.0 },
  B: { label: 'Grade B · Processing',     mult: 0.7 },
  C: { label: 'Grade C · Low grade',      mult: 0.4 }
};
/* Tailwind class snippets used by the JS-rendered markup */
const GRADE_CLS = { A: 'bg-brand-50 text-brand-800', B: 'bg-amber-100 text-amber-800', C: 'bg-red-100 text-red-700' };
const STATUS_CLS = { open: 'bg-brand-50 text-brand-800', pooled: 'bg-blue-100 text-blue-800', sold: 'bg-slate-200 text-slate-600' };
const TAG = 'inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500';
const BADGE = 'inline-block rounded-full px-3 py-1 text-xs font-bold';
const LI = 'flex justify-between gap-2.5 rounded-xl bg-slate-50 px-3 py-2';
const BUB = { out: 'self-end bg-[#dcf8c6]', in: 'self-start bg-white', sys: 'self-center bg-amber-100 text-xs' };
const TRUCK = { capacity: 1000, route: 'Ziro → Guwahati', cost: 18000, soloCost: 8000, soloKg: 200, fee: 0.03 };
const OTHER_FARMERS = [
  { name: 'Pema (Tawang)', kg: 220 }, { name: 'Nabam (Ziro)', kg: 140 },
  { name: 'Kalpana (Bomdila)', kg: 90 }, { name: 'Tage (Daporijo)', kg: 110 }
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const uid = () => 'FH-' + Math.random().toString(16).slice(2, 8).toUpperCase();
const today = () => new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 3200);
}

/* ---------- state ---------- */
const KEY = 'fairHarvestSeller.v1';
const defaults = () => ({
  settings: { name: 'Tashi Dorjee', village: 'Ziro', phone: '', key: '', model: 'gemini-2.0-flash' },
  listings: [
    { id: 'FH-DEMO01', crop: 'ginger', grade: 'B', qty: 80, price: 55, village: 'Ziro', harvest: today(), notes: 'Sample listing', cert: '', status: 'open', source: 'app', pending: false, created: Date.now() - 86400000 }
  ],
  alerts: [], activity: [], sms: []
});
let state = load();
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || defaults(); } catch { return defaults(); } }
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function log(text) { state.activity.unshift({ text, t: Date.now() }); state.activity = state.activity.slice(0, 30); save(); }
const timeAgo = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };

/* ---------- navigation ---------- */
function go(view) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'pool') renderPool();
  if (view === 'listings') renderListings();
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

/* ---------- crop selects ---------- */
function fillCropSelects() {
  const opts = Object.entries(CROPS).map(([k, c]) => `<option value="${k}">${c.icon} ${c.name}</option>`).join('');
  $('#scanCrop').innerHTML = '<option value="auto">🔍 Auto-detect</option>' + opts;
  $('#lCrop').innerHTML = opts; $('#aCrop').innerHTML = opts;
}

/* ---------- online / offline ---------- */
let simulateOffline = false;
const isOnline = () => navigator.onLine && !simulateOffline;
function updateNet() {
  $('#offlineBanner').classList.toggle('hidden', isOnline());
  if (isOnline()) {
    const pend = state.listings.filter(l => l.pending);
    if (pend.length) { pend.forEach(l => l.pending = false); save(); log(`${pend.length} offline listing(s) synced`); toast(`✅ ${pend.length} offline listing(s) synced`); renderAll(); }
  }
}
window.addEventListener('online', updateNet); window.addEventListener('offline', updateNet);
$('#offlineToggle').addEventListener('change', e => { simulateOffline = e.target.checked; updateNet(); renderEngineNote(); });

/* =========================================================
   AI QUALITY SCAN
   ========================================================= */
let scan = { file: null, img: null, result: null };

$('#photoInput').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  scan.file = f; scan.result = null;
  const url = URL.createObjectURL(f);
  const img = $('#preview'); img.src = url; img.classList.remove('hidden'); $('#dropHint').classList.add('hidden');
  img.onload = () => { scan.img = img; $('#scanBtn').disabled = false; };
});
$('#scanReset').addEventListener('click', () => {
  scan = { file: null, img: null, result: null };
  $('#photoInput').value = ''; $('#preview').classList.add('hidden'); $('#dropHint').classList.remove('hidden');
  $('#scanBtn').disabled = true; $('#resultBody').classList.add('hidden'); $('#resultEmpty').classList.remove('hidden');
});
function renderEngineNote() {
  const useAI = state.settings.key && isOnline();
  $('#engineNote').textContent = useAI
    ? '🧠 Engine: Gemini Vision (with built-in fallback if the call fails).'
    : '📴 Engine: built-in colour & texture analysis (works offline). Add a Gemini key in Settings for full vision AI.';
}

/* ---- local analysis: colour, dark-spot and texture metrics ---- */
function pixelsFrom(img) {
  const c = $('#work'), S = 160; c.width = S; c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  // centre-crop so background at the edges matters less
  const side = Math.min(img.naturalWidth, img.naturalHeight) * 0.75;
  const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
  return { data: ctx.getImageData(0, 0, S, S).data, S };
}
function rgb2hsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx ? d / mx : 0, mx];
}
function analyseLocal(img, cropChoice) {
  const { data, S } = pixelsFrom(img);
  let n = 0, sumH = 0, sumS = 0, sumV = 0, dark = 0, edges = 0, luma = [];
  const hs = [];
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, v] = rgb2hsv(data[i], data[i + 1], data[i + 2]);
    luma.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    n++; sumH += h; sumS += s; sumV += v; hs.push(h);
    if (v < 0.22) dark++;
  }
  for (let y = 1; y < S; y++) for (let x = 1; x < S; x++) {
    const i = y * S + x, g = Math.abs(luma[i] - luma[i - 1]) + Math.abs(luma[i] - luma[i - S]);
    if (g > 38) edges++;
  }
  const mH = sumH / n, mS = sumS / n, mV = sumV / n;
  const hStd = Math.sqrt(hs.reduce((a, h) => a + (h - mH) ** 2, 0) / n);
  const darkR = dark / n, edgeR = edges / n;

  // crop detection (rough hue/saturation profile match)
  let cropKey = cropChoice, conf = 100;
  if (cropChoice === 'auto') {
    const dist = Object.entries(CROPS).map(([k, c]) => [k, Math.abs(mH - c.hue) / 60 + Math.abs(mS - c.sat) / 0.5]).sort((a, b) => a[1] - b[1]);
    cropKey = dist[0][0]; conf = Math.max(45, Math.round(95 - dist[0][1] * 35));
  }

  const uniform = Math.max(0, 100 - hStd * 1.6);                // colour uniformity
  const clean = Math.max(0, 100 - darkR * 420);                  // few dark spots / rot
  const smooth = Math.max(0, 100 - edgeR * 260);                 // surface smoothness
  const vibrant = Math.min(100, mS * 130);                       // colour vibrancy
  const score = Math.round(Math.max(5, Math.min(99, clean * 0.35 + uniform * 0.25 + smooth * 0.25 + vibrant * 0.15)));
  const grade = score >= 78 ? 'A' : score >= 55 ? 'B' : 'C';
  const days = Math.max(1, Math.round(CROPS[cropKey].shelf * Math.pow(score / 100, 1.3)));

  const notes = [];
  if (darkR > 0.08) notes.push('Dark patches detected – possible bruising or rot.');
  if (edgeR > 0.25) notes.push('Rough or wrinkled surface texture.');
  if (hStd > 35) notes.push('Uneven colour across the produce.');
  if (!notes.length) notes.push('Clean surface, even colour, no visible defects.');
  if (cropChoice === 'auto' && conf < 65) notes.push('Crop match is low-confidence – please confirm the crop manually.');
  notes.push('Local estimate. Use a clear daylight photo for best results.');

  return {
    crop: cropKey, confidence: conf, score, grade, days, notes, engine: 'Local analysis',
    metrics: [['Surface cleanliness', clean], ['Colour uniformity', uniform], ['Smoothness', smooth], ['Vibrancy', vibrant]]
  };
}

/* ---- Gemini vision (optional) ---- */
async function analyseGemini(file, cropChoice) {
  const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(file); });
  const keys = Object.keys(CROPS).join(', ');
  const prompt = `You are a produce quality inspector for farmers in Arunachal Pradesh, India. ` +
    (cropChoice === 'auto' ? `Identify the crop from this list: ${keys}. ` : `The crop is ${cropChoice}. `) +
    `Grade it: A (premium export, no defects), B (processing, minor defects), C (low grade). ` +
    `Reply ONLY with JSON: {"crop":"<key>","confidence":0-100,"score":0-100,"grade":"A|B|C","freshness_days":<integer days it stays fit for transit>,"cleanliness":0-100,"uniformity":0-100,"smoothness":0-100,"notes":["short observation","..."]}`;
  const model = state.settings.model || 'gemini-2.0-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(state.settings.key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type || 'image/jpeg', data: b64 } }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } })
  });
  if (!res.ok) throw new Error('Gemini HTTP ' + res.status);
  const j = await res.json();
  const o = JSON.parse(j.candidates[0].content.parts[0].text);
  const crop = CROPS[o.crop] ? o.crop : (CROPS[cropChoice] ? cropChoice : 'kiwi');
  const grade = ['A', 'B', 'C'].includes(o.grade) ? o.grade : 'B';
  return {
    crop, confidence: Math.round(o.confidence ?? 80), score: Math.round(o.score ?? 70), grade,
    days: Math.max(1, Math.round(o.freshness_days ?? CROPS[crop].shelf)),
    notes: Array.isArray(o.notes) && o.notes.length ? o.notes : ['No notes returned.'], engine: 'Gemini Vision',
    metrics: [['Surface cleanliness', o.cleanliness ?? o.score], ['Colour uniformity', o.uniformity ?? o.score], ['Smoothness', o.smoothness ?? o.score]]
  };
}

/* ---- tamper-evident hash for the certificate ---- */
async function hashFile(file) {
  const buf = await file.arrayBuffer();
  if (window.crypto && crypto.subtle) {
    const d = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261; const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i += 7) { h ^= u[i]; h = Math.imul(h, 16777619); }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(8);
}

$('#scanBtn').addEventListener('click', async () => {
  if (!scan.img) return;
  const btn = $('#scanBtn'); btn.disabled = true; btn.textContent = 'Analysing…';
  const choice = $('#scanCrop').value;
  let r;
  try {
    r = (state.settings.key && isOnline()) ? await analyseGemini(scan.file, choice) : analyseLocal(scan.img, choice);
  } catch (err) {
    console.warn(err); toast('Vision API unavailable – using offline analysis');
    r = analyseLocal(scan.img, choice);
  }
  const hash = await hashFile(scan.file);
  r.hash = hash; r.certId = 'FH-' + hash.slice(0, 8).toUpperCase(); r.time = new Date().toISOString();
  scan.result = r; showResult(r);
  log(`Scanned ${CROPS[r.crop].short}: Grade ${r.grade} (${r.score}/100)`);
  btn.disabled = false; btn.textContent = 'Analyse photo'; renderDashboard();
});

function showResult(r) {
  $('#resultEmpty').classList.add('hidden'); $('#resultBody').classList.remove('hidden');
  const c = CROPS[r.crop];
  $('#resCrop').textContent = `${c.icon} ${c.name}`;
  $('#resCropLabel').textContent = `Detected crop · ${r.confidence}% match`;
  const g = $('#resGrade'); g.textContent = GRADES[r.grade].label; g.className = 'mt-1 ' + BADGE + ' ' + GRADE_CLS[r.grade];
  $('#ring').style.setProperty('--p', r.score); $('#ringVal').textContent = r.score;
  $('#resFresh').textContent = `Best for transit within ${r.days} day${r.days > 1 ? 's' : ''}`;
  $('#metrics').innerHTML = r.metrics.map(([n, v]) => `<div class="text-sm"><div class="mb-1 flex justify-between"><span>${n}</span><span>${Math.round(v)}%</span></div><div class="h-1.5 overflow-hidden rounded-full bg-slate-200"><i class="block h-full bg-brand-600" style="width:${Math.max(0, Math.min(100, v))}%"></i></div></div>`).join('');
  $('#resNotes').innerHTML = r.notes.map(n => `<li>${esc(n)}</li>`).join('');
  $('#certId').textContent = r.certId;
  $('#certMeta').innerHTML = `${esc(r.engine)} · ${new Date(r.time).toLocaleString()}<br>SHA-256 ${r.hash.slice(0, 32)}…`;
}
$('#useScan').addEventListener('click', () => {
  const r = scan.result; if (!r) return;
  go('listings');
  $('#lCrop').value = r.crop; $('#lGrade').value = r.grade; $('#lCert').value = r.certId;
  $('#lPrice').value = suggestPrice(r.crop, r.grade);
  $('#lVillage').value = state.settings.village; $('#lHarvest').value = today();
  $('#lNotes').value = `Certified ${r.certId}, freshness window ${r.days} days`;
  updatePriceHint(); $('#lQty').focus();
});

/* =========================================================
   LISTINGS
   ========================================================= */
const suggestPrice = (crop, grade) => Math.round(CROPS[crop].price * GRADES[grade].mult);
function updatePriceHint() {
  const crop = $('#lCrop').value, grade = $('#lGrade').value, p = suggestPrice(crop, grade);
  const h = $('#priceHint'); h.classList.remove('hidden');
  h.innerHTML = `💡 Fair price for ${CROPS[crop].short} Grade ${grade}: <b>${inr(p * 0.9)} – ${inr(p * 1.1)} /kg</b>. ` + (+$('#lPrice').value ? '' : 'Leave your price empty to use the fair price.');
}
['lCrop', 'lGrade', 'lPrice'].forEach(id => $('#' + id).addEventListener('input', updatePriceHint));

function addListing(l) {
  const item = Object.assign({ id: uid(), status: 'open', source: 'app', pending: !isOnline(), created: Date.now(), notes: '', cert: '' }, l);
  state.listings.unshift(item);
  log(`${item.source === 'sms' ? 'SMS ' : ''}Listed ${item.qty} kg ${CROPS[item.crop].short} (Grade ${item.grade})`);
  save(); renderAll(); return item;
}
$('#listingForm').addEventListener('submit', e => {
  e.preventDefault();
  const crop = $('#lCrop').value, grade = $('#lGrade').value;
  const item = addListing({
    crop, grade, qty: +$('#lQty').value, price: +$('#lPrice').value || suggestPrice(crop, grade),
    village: $('#lVillage').value.trim(), harvest: $('#lHarvest').value, notes: $('#lNotes').value.trim(), cert: $('#lCert').value
  });
  toast(item.pending ? '📵 Saved offline – will sync when network returns' : '✅ Listing published to buyers');
  e.target.reset(); $('#lCert').value = ''; $('#lVillage').value = state.settings.village; $('#lHarvest').value = today(); $('#priceHint').classList.add('hidden');
});
$('#lClear').addEventListener('click', () => { $('#listingForm').reset(); $('#lCert').value = ''; $('#priceHint').classList.add('hidden'); });
$('#filterStatus').addEventListener('change', renderListings);

function renderListings() {
  const f = $('#filterStatus').value;
  const list = state.listings.filter(l => f === 'all' || l.status === f);
  $('#listingGrid').innerHTML = list.length ? list.map(l => {
    const c = CROPS[l.crop];
    return `<div class="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div class="flex items-start justify-between gap-2"><div><h4 class="font-bold">${c.icon} ${c.short} · ${l.qty} kg</h4><div class="text-xs text-slate-500">${esc(l.village)} · harvested ${esc(l.harvest || '—')}</div></div>
        <span class="${TAG} ${STATUS_CLS[l.status]}">${l.status === 'pooled' ? 'In truck' : l.status}</span></div>
      <div class="text-lg font-bold text-brand-800">${inr(l.price)}/kg <small class="text-xs font-normal text-slate-500">= ${inr(l.price * l.qty)}</small></div>
      <div class="flex flex-wrap gap-1.5"><span class="${BADGE} !py-0.5 ${GRADE_CLS[l.grade]}">Grade ${l.grade}</span>
        ${l.cert ? `<span class="${TAG}">✔ ${esc(l.cert)}</span>` : `<span class="${TAG}">Not certified</span>`}
        ${l.source === 'sms' ? `<span class="${TAG}">SMS</span>` : ''}${l.pending ? `<span class="${TAG} !bg-amber-100 !text-amber-800">Pending sync</span>` : ''}</div>
      ${l.notes ? `<div class="text-xs text-slate-500">${esc(l.notes)}</div>` : ''}
      <div class="flex flex-wrap gap-1.5">
        ${l.status === 'open' ? `<button class="btn btn-sm" data-act="pool" data-id="${l.id}">🚚 Add to truck</button>` : ''}
        ${l.status === 'pooled' ? `<button class="btn btn-sm" data-act="unpool" data-id="${l.id}">Remove from truck</button>` : ''}
        ${l.status !== 'sold' ? `<button class="btn btn-sm" data-act="sold" data-id="${l.id}">✅ Mark sold</button>` : ''}
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${l.id}">Delete</button>
      </div></div>`;
  }).join('') : '<div class="card col-span-full py-10 text-center text-slate-500">No listings here yet.</div>';
}
$('#listingGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const l = state.listings.find(x => x.id === b.dataset.id); if (!l) return;
  const act = b.dataset.act;
  if (act === 'pool') { l.status = 'pooled'; log(`${CROPS[l.crop].short} ${l.qty} kg added to truck`); }
  if (act === 'unpool') { l.status = 'open'; }
  if (act === 'sold') { l.status = 'sold'; log(`Sold ${l.qty} kg ${CROPS[l.crop].short} for ${inr(l.qty * l.price)}`); toast('🎉 Marked as sold'); }
  if (act === 'del') { if (!confirm('Delete this listing?')) return; state.listings = state.listings.filter(x => x !== l); }
  save(); renderAll();
});

/* =========================================================
   TRUCK POOL + CALCULATOR
   ========================================================= */
let departAt = Number(localStorage.getItem('fhDepart')) || 0;
if (departAt < Date.now()) { departAt = Date.now() + 2 * 86400000 + 5 * 3600000; localStorage.setItem('fhDepart', departAt); }

function renderPool() {
  const mine = state.listings.filter(l => l.status === 'pooled').reduce((a, l) => a + l.qty, 0);
  const others = OTHER_FARMERS.reduce((a, f) => a + f.kg, 0);
  const total = Math.min(TRUCK.capacity, mine + others);
  $('#truckRoute').textContent = TRUCK.route;
  $('#truckFill').style.width = (total / TRUCK.capacity * 100) + '%';
  $('#truckKg').textContent = `${total} kg loaded`; $('#truckCap').textContent = `of ${TRUCK.capacity} kg`;
  $('#farmers').innerHTML = `<li class="${LI} !bg-brand-50 font-semibold"><span>You (${esc(state.settings.name)})</span><span>${mine} kg</span></li>` +
    OTHER_FARMERS.map(f => `<li class="${LI}"><span>${esc(f.name)}</span><span>${f.kg} kg</span></li>`).join('');
  $('#soloCost').textContent = inr(TRUCK.soloCost / TRUCK.soloKg);
  $('#poolCost').textContent = inr(TRUCK.cost / TRUCK.capacity);
  renderCalc();
}
function tickCountdown() {
  const ms = Math.max(0, departAt - Date.now()), h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000);
  const el = $('#countdown'); if (el) el.textContent = `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
}
setInterval(tickCountdown, 30000);

function renderCalc() {
  const q = +$('#cQty').value || 0, p = +$('#cPrice').value || 0, mid = +$('#cMid').value || 0;
  const gross = q * p, fee = gross * TRUCK.fee, ship = q * (TRUCK.cost / TRUCK.capacity), net = gross - fee - ship, midTotal = q * mid;
  const R = 'flex justify-between border-b border-slate-200 py-2';
  $('#calcOut').innerHTML = `
    <div class="${R}"><span>Sale value (${q} kg × ${inr(p)})</span><span>${inr(gross)}</span></div>
    <div class="${R}"><span>Pool fee (3%)</span><span>− ${inr(fee)}</span></div>
    <div class="${R}"><span>Your share of truck</span><span>− ${inr(ship)}</span></div>
    <div class="${R}"><span>You receive</span><b>${inr(net)}</b></div>
    <div class="${R}"><span>Middleman would pay</span><span>${inr(midTotal)}</span></div>
    <div class="flex justify-between rounded-xl px-3 py-2.5 font-bold ${net >= midTotal ? 'bg-brand-50 text-brand-800' : 'bg-red-100 text-red-700'}"><span>${net >= midTotal ? 'You earn extra' : 'Difference'}</span><span>${net >= midTotal ? '+' : '−'} ${inr(Math.abs(net - midTotal))}</span></div>`;
}
['cQty', 'cPrice', 'cMid'].forEach(id => $('#' + id).addEventListener('input', renderCalc));

/* =========================================================
   SMS BRIDGE
   ========================================================= */
function renderThread() {
  const t = $('#thread');
  t.innerHTML = state.sms.length ? state.sms.map(m => `<div class="max-w-[82%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm shadow-sm ${BUB[m.dir]}">${esc(m.text)}</div>`).join('') : `<div class="max-w-[82%] rounded-xl px-3 py-2 shadow-sm ${BUB.sys}">Send an SMS like “GINGER 100 ZIRO” to list without internet.</div>`;
  t.scrollTop = t.scrollHeight;
}
function reply(text) { state.sms.push({ dir: 'in', text }); save(); renderThread(); }

function handleSms(raw) {
  const body = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  state.sms.push({ dir: 'out', text: raw.trim() });
  const parts = body.split(' ');
  const payload = { From: state.settings.phone || '+91XXXXXXXXXX', Body: body, parsed: null, receivedAt: new Date().toISOString() };
  const cropOf = w => Object.keys(CROPS).find(k => CROPS[k].short.toUpperCase() === w || k.toUpperCase() === w);

  setTimeout(() => {
    if (parts[0] === 'STATUS') {
      const open = state.listings.filter(l => l.status !== 'sold');
      reply(open.length ? 'Your listings:\n' + open.map(l => `${CROPS[l.crop].short} ${l.qty}kg @${l.price} [${l.status}]`).join('\n') : 'No active listings.');
      payload.parsed = { command: 'STATUS' };
    } else if (parts[0] === 'PRICE') {
      const k = cropOf(parts[1]);
      if (k) { reply(`${CROPS[k].short} fair price today: A ₹${suggestPrice(k, 'A')}, B ₹${suggestPrice(k, 'B')}, C ₹${suggestPrice(k, 'C')} per kg.`); payload.parsed = { command: 'PRICE', crop: k }; }
      else reply('Unknown crop. Try: PRICE KIWI');
    } else {
      const k = cropOf(parts[0]), qty = parseInt(parts[1], 10), village = parts[2];
      if (!k || !qty || !village) {
        reply('Sorry, format not understood.\nSend: CROP KG VILLAGE [PRICE] [GRADE]\nExample: GINGER 100 ZIRO');
        payload.parsed = { error: 'FORMAT' };
      } else {
        const price = parseInt(parts[3], 10) || null;
        const grade = ['A', 'B', 'C'].includes(parts[4]) ? parts[4] : (['A', 'B', 'C'].includes(parts[3]) ? parts[3] : 'B');
        const item = addListing({ crop: k, qty, village: village[0] + village.slice(1).toLowerCase(), price: price || suggestPrice(k, grade), grade, source: 'sms', pending: false, notes: 'Listed by SMS – grade unverified' });
        payload.parsed = { crop: k, kg: qty, village, price: item.price, grade, listing_id: item.id };
        reply(`OK ✔ ${CROPS[k].short} ${qty}kg from ${item.village} listed at ₹${item.price}/kg.\nID ${item.id}\nTruck pickup: ${TRUCK.route}.\nFor a certified grade, scan a photo when you have network.`);
        toast('📩 SMS received – listing created');
      }
    }
    $('#payload').textContent = JSON.stringify(payload, null, 2);
    save();
  }, 600);
  save(); renderThread();
}
$('#smsForm').addEventListener('submit', e => { e.preventDefault(); const v = $('#smsInput').value; if (!v.trim()) return; $('#smsInput').value = ''; handleSms(v); });
$('.chips').addEventListener('click', e => { const b = e.target.closest('[data-sms]'); if (b) handleSms(b.dataset.sms); });
$('#missedCall').addEventListener('click', () => {
  state.sms.push({ dir: 'sys', text: '📞 Missed call to toll-free 1800-XXX-XXXX' }); renderThread();
  setTimeout(() => reply('Fair Harvest: we got your missed call.\nReply with CROP KG VILLAGE to list. Example: KIWI 60 TAWANG'), 700);
  $('#payload').textContent = JSON.stringify({ event: 'MISSED_CALL', From: state.settings.phone || '+91XXXXXXXXXX', action: 'SEND_FORMAT_SMS' }, null, 2);
});

/* =========================================================
   HARVEST ALERTS
   ========================================================= */
$('#alertForm').addEventListener('submit', e => {
  e.preventDefault();
  const a = { crop: $('#aCrop').value, qty: +$('#aQty').value, date: $('#aDate').value, price: +$('#aPrice').value || null, created: Date.now() };
  state.alerts.unshift(a); log(`Announced ${a.qty} kg ${CROPS[a.crop].short} harvest to VIP buyers`); save();
  toast('🔔 VIP buyers notified'); e.target.reset(); renderAlerts(); renderDashboard();
});
function renderAlerts() {
  $('#alertList').innerHTML = state.alerts.length ? state.alerts.map(a =>
    `<li class="${LI}"><span>${CROPS[a.crop].icon} ${a.qty} kg ${CROPS[a.crop].short} · ready ${esc(a.date)}${a.price ? ' · ' + inr(a.price) + '/kg' : ''}</span><small class="whitespace-nowrap text-slate-500">VIP early access</small></li>`).join('')
    : `<li class="${LI}">No announcements yet.</li>`;
}

/* =========================================================
   SETTINGS + DASHBOARD
   ========================================================= */
function renderSettings() {
  const s = state.settings;
  $('#sName').value = s.name; $('#sVillage').value = s.village; $('#sPhone').value = s.phone; $('#sKey').value = s.key; $('#sModel').value = s.model;
  $('#sellerName').textContent = s.name; $('#sellerVillage').textContent = s.village; $('#dashName').textContent = s.name.split(' ')[0];
}
$('#settingsForm').addEventListener('submit', e => {
  e.preventDefault();
  state.settings = { name: $('#sName').value.trim() || 'Seller', village: $('#sVillage').value.trim(), phone: $('#sPhone').value.trim(), key: $('#sKey').value.trim(), model: $('#sModel').value.trim() || 'gemini-2.0-flash' };
  save(); renderSettings(); renderEngineNote(); $('#lVillage').value = state.settings.village; toast('Settings saved');
});
$('#resetData').addEventListener('click', () => { if (confirm('Reset all demo data?')) { localStorage.removeItem(KEY); state = defaults(); renderAll(); toast('Demo data reset'); } });

function renderDashboard() {
  const active = state.listings.filter(l => l.status !== 'sold'), sold = state.listings.filter(l => l.status === 'sold');
  $('#stActive').textContent = active.length;
  $('#stKg').textContent = active.reduce((a, l) => a + l.qty, 0).toLocaleString('en-IN');
  $('#stMoney').textContent = inr(active.reduce((a, l) => a + l.qty * l.price, 0));
  $('#stSold').textContent = inr(sold.reduce((a, l) => a + l.qty * l.price, 0));
  $('#activity').innerHTML = state.activity.length ? state.activity.slice(0, 8).map(a => `<li class="${LI}"><span>${esc(a.text)}</span><small class="whitespace-nowrap text-slate-500">${timeAgo(a.t)}</small></li>`).join('') : `<li class="${LI}">No activity yet. Try scanning produce!</li>`;
}

function renderAll() { renderDashboard(); renderListings(); renderPool(); renderThread(); renderAlerts(); }

/* ---------- init ---------- */
fillCropSelects(); renderSettings(); renderEngineNote(); renderAll(); tickCountdown(); updateNet();
$('#lVillage').value = state.settings.village; $('#lHarvest').value = today();