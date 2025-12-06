// script.js — Version A
// Load surah JSON, render ayahs, handle word taps and grammar modal
// Works with GitHub Pages (no modules)

const Storage = {
  save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  load(k, fallback) { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : fallback; } catch(e){ return fallback; } }
};

let SURAH = null;

// DOM helpers
function el(tag, cls, html){ const d = document.createElement(tag); if(cls) d.className = cls; if(html !== undefined) d.innerHTML = html; return d; }

// create translation toggles bar (if not present)
function ensureToggles(){
  if(document.getElementById('translationToggles')) return;
  const bar = el('div','translation-toggles');
  bar.id = 'translationToggles';
  bar.innerHTML = `
    <label><input type="checkbox" id="toggleOsmani"> ওসমানী</label>
    <label><input type="checkbox" id="toggleTawzih"> তাওজীহ</label>
  `;
  document.body.insertBefore(bar, document.getElementById('surahWrap'));
  // init from storage
  const os = Storage.load('show_osmani', true);
  const tw = Storage.load('show_tawzih', true);
  document.getElementById('toggleOsmani').checked = os;
  document.getElementById('toggleTawzih').checked = tw;
  document.getElementById('toggleOsmani').addEventListener('change', (e)=>{
    Storage.save('show_osmani', e.target.checked); renderSurah();
  });
  document.getElementById('toggleTawzih').addEventListener('change', (e)=>{
    Storage.save('show_tawzih', e.target.checked); renderSurah();
  });
}

function fetchSurah(){
  fetch('data/surah_101.json')
    .then(r=>{
      if(!r.ok) throw new Error('Failed to fetch JSON: ' + r.status);
      return r.json();
    })
    .then(j=>{
      SURAH = j;
      ensureToggles();
      renderSurah();
    })
    .catch(err=>{
      console.error(err);
      document.getElementById('surahWrap').innerHTML = `<div style="padding:20px;color:salmon">JSON লোড সমস্যা — কনসোলে দেখুন</div>`;
    });
}

function renderSurah(){
  if(!SURAH) return;
  const wrap = document.getElementById('surahWrap');
  wrap.innerHTML = '';
  const showOs = Storage.load('show_osmani', true);
  const showTw = Storage.load('show_tawzih', true);

  SURAH.ayahs.forEach((ayah, idx)=>{
    const box = el('div','ayahBox');
    // header with ayah number
    const h = el('div','ayahHeader', `<strong>আয়াত ${ayah.ayah_no}</strong>`);
    box.appendChild(h);

    // Arabic line as single line (not stacked) — user wanted وَمَا أَدْرَكَ مَا الْقَارِعَةُ style
    const arabicLine = el('div','arabicLine');
    // Build combined line by joining words with a space so it appears as natural quran line
    // But we will render words as separate spans to allow tapping
    ayah.words.forEach((w, wi)=>{
      const sp = el('span','word', w.arabic);
      sp.dataset.ayah = ayah.ayah_no;
      sp.dataset.wordIndex = wi;
      sp.style.fontWeight = '700'; // bold Arabic
      sp.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        showWordPopup(ayah, wi);
      });
      arabicLine.appendChild(sp);
      // add small space
      arabicLine.appendChild(document.createTextNode(' '));
    });
    box.appendChild(arabicLine);

    // translations
    const transWrap = el('div','transWrap');
    if(showOs && ayah.osmani) transWrap.appendChild(el('div','trans osmani', `<strong>Osmani:</strong> ${ayah.osmani}`));
    if(showTw && ayah.tawzih) transWrap.appendChild(el('div','trans tawzih', `<strong>Tawzih:</strong> ${ayah.tawzih}`));
    box.appendChild(transWrap);

    // actions
    const actions = el('div','actions');
    const gbtn = el('button','action-btn','Full Grammar Notes');
    gbtn.addEventListener('click', ()=> openGrammarModal(ayah));
    actions.appendChild(gbtn);
    box.appendChild(actions);

    wrap.appendChild(box);
  });
}

/* -------- Grammar Modal (bottom full-screen scroll) ---------- */

function openGrammarModal(ayah){
  // create or reuse modal container
  let modal = document.getElementById('grammarModalCustom');
  if(!modal){
    modal = el('div','modalBottom');
    modal.id = 'grammarModalCustom';
    modal.innerHTML = `
      <div class="modalInner">
        <div class="modalHeader">
          <button id="closeGrammarCustom" class="closeBtn">✖</button>
          <h3 id="grammarModalTitle"></h3>
        </div>
        <div id="grammarModalBody" class="modalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeGrammarCustom').addEventListener('click', ()=> modal.style.display='none');
  }
  document.getElementById('grammarModalTitle').textContent = `সূরা ${SURAH.surah} — আয়াত ${ayah.ayah_no} — বিস্তারিত ব্যাকরণ`;
  const body = document.getElementById('grammarModalBody');
  body.innerHTML = '';
  // Show full_grammar_note EXACTLY as provided (preserve lines)
  if(ayah.full_grammar_note){
    const pre = el('pre','grammarPre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.textAlign = 'left';
    pre.textContent = ayah.full_grammar_note;
    body.appendChild(pre);
  } else {
    body.textContent = 'কোনো ব্যাখ্যা নেই।';
  }
  modal.style.display = 'block';
}

/* ------------ Word popup (bottom) ------------- */

function showWordPopup(ayah, wordIndex){
  const w = ayah.words[wordIndex];
  // create or reuse popup element
  let popup = document.getElementById('wordPopupCustom');
  if(!popup){
    popup = el('div','popupBottom');
    popup.id = 'wordPopupCustom';
    popup.innerHTML = `
      <div class="popupInner">
        <div class="popupHeader">
          <strong id="popupWordAr"></strong>
          <button id="closePopup" class="closeBtn">✖</button>
        </div>
        <div id="popupBody" class="popupBody"></div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('closePopup').addEventListener('click', ()=> popup.style.display='none');
  }

  document.getElementById('popupWordAr').textContent = w.arabic;
  const body = document.getElementById('popupBody');
  body.innerHTML = '';

  // Bangla meaning
  body.appendChild(el('div','pRow', `<strong>বাংলা: </strong> ${w.bangla || '-'}`));

  // AI morphology — show all fields, with Bangla explanation
  const ai = w.ai || {};
  const rows = [
    {k:'বিভাগ', v: ai.pos_bn || ai.pos || '-'},
    {k:'ফর্ম', v: ai.verbForm || ai.form || '-'},
    {k:'মূল (Root)', v: ai.root || '-'},
    {k:'অতীত (Past)', v: ai.tense_past || ai.past || ai.tense || '-'},
    {k:'বর্তমান (Present)', v: ai.tense_present || ai.present || '-'},
    {k:'আদেশ (Imperative)', v: ai.imperative || ai.imper || '-'},
    {k:'Noun / Masdar', v: ai.noun || ai.masdar || '-'},
    {k:'Subject (فاعل)', v: ai.subject || '-'},
    {k:'Object (مفعول)', v: ai.object || '-'},
    {k:'Case (إعراب)', v: ai.case || '-'},
    {k:'Definite (ال)', v: ai.definite || '-'},
    {k:'Gender / Number', v: (ai.gender || '-') + ' / ' + (ai.number || '-')},
    {k:'Notes', v: ai.notes || '-'}
  ];
  rows.forEach(r=>{
    const row = el('div','pRow', `<span class="k">${r.k}</span> <span class="v">${r.v}</span>`);
    body.appendChild(row);
  });

  popup.style.display='block';
}

/* close popups on background click */
document.addEventListener('click', (e)=>{
  const popup = document.getElementById('wordPopupCustom');
  const gm = document.getElementById('grammarModalCustom');
  // If click outside popup -> close
  if(popup && !popup.contains(e.target) && !e.target.classList.contains('word')) popup.style.display='none';
  if(gm && !gm.contains(e.target) && e.target.className !== 'action-btn') {} // do not auto close grammar modal on outside click
});

fetchSurah();
