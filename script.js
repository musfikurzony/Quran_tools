/* script.js - main app logic (plain) */

/* helper to create element with class */
function el(tag, cls){ const d = document.createElement(tag); if(cls) d.className = cls; return d; }

/* app state */
let surahData = null;

/* initialize UI controls (from sujas.js) */
if(window.initAppUI){
  window.initAppUI((osmani, tawzih) => {
    // re-render translations when toggles change
    renderSurah();
  });
} else {
  console.warn('initAppUI not found; ensure sujas.js is loaded before script.js');
}

/* fetch JSON */
fetch('data/surah_101.json')
  .then(r => {
    if(!r.ok) throw new Error('Failed to fetch JSON: ' + r.status);
    return r.json();
  })
  .then(data => {
    // Normalize structure: accept ayahs or aayaat naming differences
    if(data.ayaat && Array.isArray(data.ayaat)) {
      // some earlier versions used "ayaat"
      data.ayaat = data.ayaat;
    }
    if(!Array.isArray(data.ayaat) && Array.isArray(data.aya)) {
      data.ayaat = data.aya;
    }
    // set internal
    surahData = data;
    // if surah has number property else use id
    surahData.number = surahData.number || surahData.id || 101;
    renderSurah();
  })
  .catch(err => {
    console.error(err);
    const wrap = document.getElementById('surahWrap');
    if(wrap) wrap.innerHTML = `<div style="color:red;padding:20px">JSON লোড সমস্যা — কনসোলে দেখুন</div>`;
  });


/* RENDER SURAH */
function renderSurah(){
  const wrap = document.getElementById('surahWrap');
  if(!wrap) return;
  wrap.innerHTML = '';

  if(!surahData || !Array.isArray(surahData.ayaat)) {
    wrap.innerHTML = '<div style="padding:20px">কোনো আয়াত লোড হয়নি।</div>';
    return;
  }

  // show header summary
  const headCard = el('div','ayah');
  headCard.style.textAlign = 'center';
  headCard.innerHTML = `<div style="font-weight:700;font-size:18px">${surahData.name_bn || surahData.name || 'Surah' } — সূরা ${surahData.number}</div>`;
  wrap.appendChild(headCard);

  // translation toggles states
  const showOs = window.AppStorage ? window.AppStorage.load('showOsmani', true) : true;
  const showTw = window.AppStorage ? window.AppStorage.load('showTawzih', true) : true;

  surahData.ayaat.forEach(ayah => {
    const card = el('div','ayah');

    // Arabic line (words clickable)
    const arLine = el('div','arabic-line');
    arLine.style.direction = 'rtl';
    arLine.style.fontSize = '28px';
    arLine.style.marginBottom = '8px';

    // If ayah has words array, render them; otherwise render raw text
    if(Array.isArray(ayah.words) && ayah.words.length){
      ayah.words.forEach(w=>{
        const span = el('span','word');
        span.textContent = w.word || w.arabic || '';
        span.style.padding = '4px 8px';
        span.style.margin = '0 6px';
        span.style.borderRadius = '8px';
        span.style.background = 'transparent';
        span.style.color = '#0b3d91';
        span.style.cursor = 'pointer';

        // store word data on element
        span._wordData = w;
        span.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          showWordModal(w);
        });

        arLine.appendChild(span);
      });
    } else {
      // fallback to plain arabic text
      const raw = ayah.arabic || ayah.text || '';
      arLine.textContent = raw;
    }
    card.appendChild(arLine);

    // translations area (two writers) - show if present and toggled
    const tr = el('div','translations');
    tr.style.marginTop = '6px';
    if(ayah.translation){
      if(showOs && ayah.translation.osmani){
        const d = el('div');
        d.innerHTML = `<strong>তাফসীরে Osmani:</strong> ${escapeHtml(ayah.translation.osmani)}`;
        tr.appendChild(d);
      }
      if(showTw && ayah.translation.tawzih){
        const d2 = el('div');
        d2.innerHTML = `<strong>তাওযীহুল কুরআন:</strong> ${escapeHtml(ayah.translation.tawzih)}`;
        tr.appendChild(d2);
      }
    }
    card.appendChild(tr);

    // Actions: Full Grammar Notes
    const actions = el('div','actions');
    actions.style.marginTop = '10px';
    const gbtn = el('button','action-btn');
    gbtn.textContent = 'Full Grammar Notes';
    gbtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      openGrammarModal(ayah);
    });
    actions.appendChild(gbtn);
    card.appendChild(actions);

    wrap.appendChild(card);
  });
}


/* ================ grammar modal ================ */
const grammarModal = document.getElementById('grammarModal');
const grammarTitle = document.getElementById('grammarTitle');
const grammarBody  = document.getElementById('grammarBody');
const closeGrammar  = document.getElementById('closeGrammar');
if(closeGrammar) closeGrammar.addEventListener('click', ()=> grammarModal.style.display = 'none');

function openGrammarModal(ayah){
  grammarTitle.textContent = `সূরা ${surahData.number} — আয়াত ${ayah.ayah || ayah.number || ayah.ayahNo || '?' } — পূর্ণ ব্যাকরণ`;
  grammarBody.innerHTML = '';

  // Prefer exact full grammar note field (full_grammar_note or fullGrammar or notes)
  const full = ayah.full_grammar_note || ayah.fullGrammar || ayah.notes || ayah.grammar || ayah.full_note;
  if(full && String(full).trim() !== ''){
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontSize = '16px';
    pre.style.textAlign = 'left';
    pre.style.lineHeight = '1.7';
    pre.textContent = full;
    grammarBody.appendChild(pre);
  } else {
    grammarBody.textContent = 'কোনো ব্যাকরণ নোট পাওয়া যায়নি।';
  }

  grammarModal.style.display = 'flex';
}

/* ================ word modal (popup) ================ */
const wordModal = document.getElementById('wordModal');
const wordAr = document.getElementById('wordAr');
const wordBn = document.getElementById('wordBn');
const morphBadges = document.getElementById('morphBadges');
const formsGrid = document.getElementById('formsGrid');
const gramMap = document.getElementById('gramMap');
const closeWord = document.getElementById('closeWord');
if(closeWord) closeWord.addEventListener('click', ()=> wordModal.style.display = 'none');

function clearNode(node){ while(node && node.firstChild) node.removeChild(node.firstChild); }

function showWordModal(w){
  // w is the word object from JSON
  wordAr.textContent = w.arabic || w.word || '';
  wordBn.textContent = w.bangla || w.meaning_bn || w.meaning || '';

  // badges
  clearNode(morphBadges);
  const badges = [w.pos || w.pos_bn, w.pos_detail, w.form ? ('ফর্ম-' + w.form) : null, w.person, w.number, w.gender];
  badges.forEach(b=>{
    if(b){
      const d = document.createElement('div');
      d.className = 'badge';
      d.textContent = b;
      morphBadges.appendChild(d);
    }
  });

  // verb forms as pills
  clearNode(formsGrid);
  const items = [
    {t: 'অতীত (Past)', v: w.tense_forms ? w.tense_forms.past : (w.past || '-')},
    {t: 'বর্তমান (Present)', v: w.tense_forms ? w.tense_forms.present : (w.present || '-')},
    {t: 'আদেশ (Imperative)', v: w.tense_forms ? w.tense_forms.imperative : (w.imperative || '-')},
    {t: 'Root', v: w.root || '-'},
    {t: 'Noun/Masdar', v: w.noun || w.masdar || '-'},
    {t: 'Form', v: w.form || '-'}
  ];
  items.forEach(it=>{
    const p = document.createElement('div');
    p.className = 'pill';
    p.innerHTML = `<div class="p-title">${it.t}</div><div class="p-val">${it.v}</div>`;
    formsGrid.appendChild(p);
  });

  // gram map
  clearNode(gramMap);
  const rows = [
    {k:'Subject (فاعل):', v: w.subject || '-'},
    {k:'Object (مفعول):', v: w.object || '-'},
    {k:'Case (إعراب):', v: w.case || '-'},
    {k:'Definite (ال):', v: (w.definite ? 'হ্যাঁ (ال)' : 'না')},
    {k:'Notes:', v: w.notes_bn || w.grammar || w.grammar_bn || '-'}
  ];
  rows.forEach(r=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="gram-key">${r.k}</div><div class="gram-val">${r.v}</div>`;
    gramMap.appendChild(row);
  });

  wordModal.style.display = 'flex';
}

/* Utility: safe html */
function escapeHtml(s){
  if(s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
