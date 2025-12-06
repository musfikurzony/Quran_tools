/* =============================
   LOAD SURAH JSON
============================= */

let surahData = null;

fetch('data/surah_101.json')
  .then(r => {
    if(!r.ok) throw new Error('Failed to load JSON');
    return r.json();
  })
  .then(data => {
    surahData = data;
    renderSurah();
  })
  .catch(err => {
    console.error(err);
    document.getElementById('surahWrap').innerHTML =
      `<div style="color:red;padding:20px">JSON লোড সমস্যা — কনসোলে দেখুন</div>`;
  });


/* =============================
   RENDER SURAH
============================= */

function renderSurah(){
  const wrap = document.getElementById('surahWrap');
  wrap.innerHTML = '';

  if(!surahData || !Array.isArray(surahData.ayaat)) return;

  surahData.ayaat.forEach(ayah => {
    const card = document.createElement('div');
    card.className = 'ayah';

    /* --- Arabic line --- */
    const ar = document.createElement('div');
    ar.className = 'arabic-line';
    (ayah.words || []).forEach(w => {
      const s = document.createElement('span');
      s.className = 'word';
      s.textContent = w.word;
      s.onclick = ev => { ev.stopPropagation(); showWordModal(w); };
      ar.appendChild(s);
    });
    card.appendChild(ar);

    /* --- Translation --- */
    const tr = document.createElement('div');
    tr.className = 'translations';
    if(ayah.translation){
      if(ayah.translation.osmani)
        tr.innerHTML += `<div><strong>অর্থ (Osmani):</strong> ${ayah.translation.osmani}</div>`;
      if(ayah.translation.tawzih)
        tr.innerHTML += `<div><strong>অর্থ (Tawzih):</strong> ${ayah.translation.tawzih}</div>`;
    }
    card.appendChild(tr);

    /* --- Grammar Notes Button --- */
    const act = document.createElement('div');
    act.className = 'actions';
    const b = document.createElement('button');
    b.className = 'action-btn';
    b.textContent = 'Full Grammar Notes';
    b.onclick = ev => { ev.stopPropagation(); openGrammarModal(ayah); };
    act.appendChild(b);

    card.appendChild(act);
    wrap.appendChild(card);
  });
}


/* =============================
   GRAMMAR MODAL
============================= */

const grammarModal = document.getElementById('grammarModal');
const grammarBody  = document.getElementById('grammarBody');
const grammarTitle = document.getElementById('grammarTitle');
document.getElementById('closeGrammar').onclick = () => {
  grammarModal.style.display = 'none';
};

function openGrammarModal(ayah){
  grammarTitle.textContent =
    `সূরা ${surahData.number} — আয়াত ${ayah.number} — পূর্ণ ব্যাকরণ`;

  grammarBody.innerHTML = '';

  // Your full_grammar_note — EXACTLY AS YOU GIVE
  if(ayah.full_grammar_note){
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontSize = '16px';
    pre.style.textAlign = 'left';
    pre.textContent = ayah.full_grammar_note;
    grammarBody.appendChild(pre);
  } else {
    grammarBody.textContent = 'কোনো ব্যাকরণ নোট নেই।';
  }

  grammarModal.style.display = 'flex';
}


/* =============================
   WORD MODAL
============================= */

const wordModal  = document.getElementById('wordModal');
const wordAr     = document.getElementById('wordAr');
const wordBn     = document.getElementById('wordBn');
const morphBadges = document.getElementById('morphBadges');
const formsGrid   = document.getElementById('formsGrid');
const gramMap     = document.getElementById('gramMap');

document.getElementById('closeWord').onclick = () => {
  wordModal.style.display = 'none';
};

function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }

function showWordModal(w){
  wordAr.textContent = w.word || '';
  wordBn.textContent = w.meaning_bn || w.meaning || '';

  /* Morphology badges */
  clear(morphBadges);
  [
    w.pos_bn,
    w.pos_detail,
    w.form ? `ফর্ম-${w.form}`:'',
    w.person,
    w.number,
    w.gender
  ].forEach(b=>{
    if(b){
      const d = document.createElement('div');
      d.className = 'badge';
      d.textContent = b;
      morphBadges.appendChild(d);
    }
  });

  /* Verb forms */
  clear(formsGrid);
  [
    {t:'অতীত (Past)',        v: w.tense_forms?.past || w.past || '-'},
    {t:'বর্তমান (Present)',  v: w.tense_forms?.present || w.present || '-'},
    {t:'আদেশ (Imperative)',  v: w.tense_forms?.imperative || w.imperative || '-'},
    {t:'Root',               v: w.root || '-'},
    {t:'Noun / Masdar',      v: w.noun || '-'},
    {t:'Form',               v: w.form || '-'},
  ].forEach(o=>{
    const p = document.createElement('div');
    p.className = 'pill';
    p.innerHTML = `<div class="p-title">${o.t}</div><div class="p-val">${o.v}</div>`;
    formsGrid.appendChild(p);
  });

  /* Grammar mapping */
  clear(gramMap);
  [
    {k:'Subject (فاعل):', v: w.subject || '-'},
    {k:'Object (مفعول):', v: w.object || '-'},
    {k:'Case (إعراب):',   v: w.case || '-'},
    {k:'Definite (ال):',   v: w.definite ? 'হ্যাঁ (ال)' : 'না'},
    {k:'Notes:',           v: w.notes_bn || w.notes || '-'}
  ].forEach(r=>{
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="gram-key">${r.k}</div><div class="gram-val">${r.v}</div>`;
    gramMap.appendChild(row);
  });

  wordModal.style.display = 'flex';
}
