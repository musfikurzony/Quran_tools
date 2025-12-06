/* script.js
   Version-A: rendering, modals, translation toggles, word modal, grammar modal
*/

let surahData = null;

/* --------- Helpers --------- */
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }

/* --------- Load JSON --------- */
fetch('data/surah_101.json')
  .then(r => {
    if(!r.ok) throw new Error('Failed to load JSON ' + r.status);
    return r.json();
  })
  .then(data => {
    surahData = data;
    initUI();
    renderSurah();
  })
  .catch(err => {
    console.error(err);
    const wrap = qs('#surahWrap');
    wrap.innerHTML = `<div style="color:red;padding:20px">JSON লোড সমস্যা — কনসোলে দেখুন</div>`;
  });

/* --------- Init UI: add translation toggles, top controls --------- */
function initUI(){
  const wrap = qs('#surahWrap');
  // top controls (translations toggles)
  const top = document.createElement('div');
  top.className = 'top-controls';

  const checkOs = document.createElement('label');
  checkOs.className = 'toggle-label';
  checkOs.innerHTML = `<input type="checkbox" id="toggleOsmani" checked> তাফসীরে Osmani দেখাও`;
  top.appendChild(checkOs);

  const checkTaw = document.createElement('label');
  checkTaw.className = 'toggle-label';
  checkTaw.innerHTML = `<input type="checkbox" id="toggleTawzih" checked> তাওযীহুল কুরআন দেখাও`;
  top.appendChild(checkTaw);

  wrap.parentNode.insertBefore(top, wrap);

  qsa('.modal .close').forEach(btn=>{
    btn.addEventListener('click', () => {
      btn.closest('.modal').style.display = 'none';
    });
  });

  // Close modal when clicking outside content
  qsa('.modal').forEach(m=>{
    m.addEventListener('click', e=>{
      if(e.target === m) m.style.display = 'none';
    });
  });
}

/* --------- Render Surah --------- */
function renderSurah(){
  const wrap = qs('#surahWrap');
  wrap.innerHTML = '';

  if(!surahData || !Array.isArray(surahData.ayaat)){
    wrap.textContent = 'কোনো আয়াত পাওয়া যায়নি।';
    return;
  }

  // Show surah header and meta
  const headerCard = document.createElement('div');
  headerCard.className = 'surah-card';
  headerCard.innerHTML = `<div class="surah-title">সূরা ${surahData.number} — ${surahData.name_bn || surahData.name}</div>
    <div class="surah-meta">আয়াত: ${surahData.ayaat.length} · ${surahData.info || ''}</div>`;
  wrap.appendChild(headerCard);

  // For each ayah
  surahData.ayaat.forEach(ayah => {
    const card = document.createElement('div');
    card.className = 'ayah';

    // ayah number displayed on top left
    const num = document.createElement('div');
    num.className = 'ayah-number';
    num.textContent = `আয়াত ${ayah.number}`;
    card.appendChild(num);

    // Arabic line — each word on separate line (bold), to help matching grammar lines
    const ar = document.createElement('div');
    ar.className = 'arabic-line';
    (ayah.words || []).forEach(wordObj => {
      const wspan = document.createElement('div');
      wspan.className = 'word';
      wspan.innerHTML = `<strong>${wordObj.word}</strong>`;
      // store word object for modal
      wspan.dataset.word = JSON.stringify(wordObj);
      wspan.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        const w = JSON.parse(wspan.dataset.word);
        showWordModal(w);
      });
      ar.appendChild(wspan);
    });
    card.appendChild(ar);

    // Translations area (two writers) — shown depending on toggles
    const trans = document.createElement('div');
    trans.className = 'translations';
    trans.innerHTML = `
      <div class="tr-osmani" data-ayah="${ayah.number}" style="display:none;">
        <strong>Osmani:</strong> ${ayah.translation?.osmani || ''}
      </div>
      <div class="tr-tawzih" data-ayah="${ayah.number}" style="display:none;">
        <strong>Tawzih:</strong> ${ayah.translation?.tawzih || ''}
      </div>
    `;
    card.appendChild(trans);

    // Actions: grammar button
    const actions = document.createElement('div');
    actions.className = 'actions';
    const gbtn = document.createElement('button');
    gbtn.className = 'action-btn';
    gbtn.textContent = 'Full Grammar Notes';
    gbtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      openGrammarModal(ayah);
    });
    actions.appendChild(gbtn);
    card.appendChild(actions);

    wrap.appendChild(card);
  });

  // initialize translation toggles behavior
  const osChk = qs('#toggleOsmani');
  const taChk = qs('#toggleTawzih');
  function refreshTranslations(){
    qsa('.tr-osmani').forEach(d => d.style.display = osChk.checked ? 'block' : 'none');
    qsa('.tr-tawzih').forEach(d => d.style.display = taChk.checked ? 'block' : 'none');
  }
  osChk.addEventListener('change', refreshTranslations);
  taChk.addEventListener('change', refreshTranslations);
  refreshTranslations();
}

/* --------- Grammar Modal (full-screen) --------- */
const grammarModal = qs('#grammarModal');
const grammarTitle = qs('#grammarTitle');
const grammarBody = qs('#grammarBody');

function openGrammarModal(ayah){
  grammarTitle.textContent = `সূরা ${surahData.number} — আয়াত ${ayah.number} — বিস্তারিত ব্যাকরণ`;
  grammarBody.innerHTML = '';

  if(ayah.full_grammar_note && ayah.full_grammar_note.trim() !== ''){
    const pre = document.createElement('pre');
    pre.className = 'full-grammar-pre';
    pre.textContent = ayah.full_grammar_note;
    grammarBody.appendChild(pre);
  } else {
    grammarBody.textContent = 'কোনো ব্যাকরণ নোট নেই।';
  }

  grammarModal.style.display = 'flex';
}

/* --------- Word Modal (rich morphology) --------- */
const wordModal = qs('#wordModal');
const wordAr = qs('#wordAr');
const wordBn = qs('#wordBn');
const morphBadges = qs('#morphBadges');
const formsGrid = qs('#formsGrid');
const gramMap = qs('#gramMap');

function showWordModal(w){
  wordAr.innerHTML = `<span class="word-ar-inner">${w.word || ''}</span>`;
  wordBn.textContent = w.meaning_bn || w.meaning || '';

  // badges
  clear(morphBadges);
  const badges = [
    w.pos_bn || w.pos || '',
    w.pos_detail || '',
    w.form ? `ফর্ম-${w.form}` : '',
    w.person || '',
    w.number || '',
    w.gender || ''
  ].filter(x => x && x !== '');
  badges.forEach(b=>{
    const d = document.createElement('div');
    d.className = 'badge';
    d.textContent = b;
    morphBadges.appendChild(d);
  });

  // forms grid
  clear(formsGrid);
  const forms = [
    {t:'অতীত (Past)', v: (w.tense_forms && w.tense_forms.past) ? w.tense_forms.past : (w.past || '-')},
    {t:'বর্তমান (Present)', v: (w.tense_forms && w.tense_forms.present) ? w.tense_forms.present : (w.present || '-')},
    {t:'আদেশ (Imperative)', v: (w.tense_forms && w.tense_forms.imperative) ? w.tense_forms.imperative : (w.imperative || '-')},
    {t:'Root (মূল)', v: w.root || '-'},
    {t:'Noun / Masdar', v: w.noun || '-'},
    {t:'Form', v: w.form || '-'}
  ];
  forms.forEach(f=>{
    const p = document.createElement('div');
    p.className = 'pill';
    p.innerHTML = `<div class="p-title">${f.t}</div><div class="p-val">${f.v}</div>`;
    formsGrid.appendChild(p);
  });

  // grammar mapping
  clear(gramMap);
  const rows = [
    {k:'Subject (فاعل):', v: w.subject || '-'},
    {k:'Object (مفعول):', v: w.object || '-'},
    {k:'Case (إعراب):', v: w.case || '-'},
    {k:'Definite (ال):', v: w.definite ? 'হ্যাঁ (ال)' : 'না'},
    {k:'Notes:', v: w.notes_bn || w.grammar || '-'}
  ];
  rows.forEach(r=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="gram-key">${r.k}</div><div class="gram-val">${r.v}</div>`;
    gramMap.appendChild(row);
  });

  wordModal.style.display = 'flex';
}
