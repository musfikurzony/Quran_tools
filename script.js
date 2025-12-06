/* script.js - main renderer and UI logic (Version-A) */

/* -----------------------
   Globals
------------------------*/
let surahData = null;

/* -----------------------
   Fetch JSON and render
------------------------*/
fetch('data/surah_101.json')
  .then(r => {
    if(!r.ok) throw new Error('Failed to fetch JSON: ' + r.status);
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

/* -----------------------
   Render surah: one ayah per card
   Arabic is printed as a single inline line.
   Each word is a clickable <span class="word">.
------------------------*/
function renderSurah(){
  const wrap = document.getElementById('surahWrap');
  wrap.innerHTML = '';

  if(!surahData || !Array.isArray(surahData.ayahs)) return;

  surahData.ayahs.forEach(ayah => {
    const card = document.createElement('div');
    card.className = 'ayah';

    // Ayah header with number
    const header = document.createElement('div');
    header.className = 'ayah-header';
    header.innerHTML = `<div class="ayah-no">আয়াত ${ayah.ayah}</div>`;
    card.appendChild(header);

    // Arabic full-line (words inline)
    const ar = document.createElement('div');
    ar.className = 'arabic-line';
    ar.setAttribute('dir','rtl');
    // join words inline but each word clickable
    ayah.words.forEach((w, idx) => {
      const sp = document.createElement('span');
      sp.className = 'word';
      sp.innerHTML = `<span class="word-ar">${w.arabic}</span>`;
      // attach dataset for modal usage
      sp.dataset.wordIndex = idx;
      sp.dataset.ayah = ayah.ayah;
      sp.onclick = (ev) => {
        ev.stopPropagation();
        showWordModal(ayah, w);
      };
      ar.appendChild(sp);
      // small spacing between words
      const gap = document.createElement('span');
      gap.className = 'word-gap';
      gap.textContent = ' ';
      ar.appendChild(gap);
    });
    card.appendChild(ar);

    // Translations toggle area + checkboxes
    const transBar = document.createElement('div');
    transBar.className = 'trans-bar';
    transBar.innerHTML = `
      <label><input type="checkbox" class="trans-toggle" data-type="osmani" checked> Osmani</label>
      <label><input type="checkbox" class="trans-toggle" data-type="tawzih" checked> Tawzih</label>
    `;
    card.appendChild(transBar);

    // Translation area
    const trBox = document.createElement('div');
    trBox.className = 'translations';
    trBox.innerHTML = buildTranslationHtml(ayah);
    card.appendChild(trBox);

    // Full grammar notes button
    const actions = document.createElement('div');
    actions.className = 'actions';
    const gbtn = document.createElement('button');
    gbtn.className = 'action-btn';
    gbtn.textContent = 'Full Grammar Notes';
    gbtn.onclick = (ev) => { ev.stopPropagation(); openGrammarModal(ayah); };
    actions.appendChild(gbtn);
    card.appendChild(actions);

    wrap.appendChild(card);
  });

  // wire translation toggles
  document.querySelectorAll('.trans-toggle').forEach(chk=>{
    chk.addEventListener('change', function(){
      const card = this.closest('.ayah');
      const ayahIndex = Array.from(document.querySelectorAll('.ayah')).indexOf(card);
      const ayah = surahData.ayahs[ayahIndex];
      card.querySelector('.translations').innerHTML = buildTranslationHtml(ayah);
    });
  });
}

function buildTranslationHtml(ayah){
  let html = '';
  if(ayah.translation){
    if(document.querySelector('.trans-toggle[data-type="osmani"]')?.checked && ayah.translation.osmani){
      html += `<div class="trans-osmani"><strong>Osmani:</strong> ${ayah.translation.osmani}</div>`;
    }
    if(document.querySelector('.trans-toggle[data-type="tawzih"]')?.checked && ayah.translation.tawzih){
      html += `<div class="trans-tawzih"><strong>Tawzih:</strong> ${ayah.translation.tawzih}</div>`;
    }
  }
  return html;
}

/* -----------------------
   Grammar Modal (full-screen)
------------------------*/
const grammarModal = document.getElementById('grammarModal');
const grammarTitle = document.getElementById('grammarTitle');
const grammarBody  = document.getElementById('grammarBody');
document.getElementById('closeGrammar').onclick = () => { grammarModal.style.display = 'none'; };

function openGrammarModal(ayah){
  grammarTitle.textContent = `সূরা ${surahData.id} — আয়াত ${ayah.ayah} — বিস্তারিত ব্যাকরণ`;
  grammarBody.innerHTML = '';
  if(ayah.full_grammar_note){
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = ayah.full_grammar_note;
    pre.className = 'full-note-pre';
    grammarBody.appendChild(pre);
  } else {
    grammarBody.textContent = 'কোনো ব্যাখ্যা নেই।';
  }
  grammarModal.style.display = 'flex';
}

/* -----------------------
   Word Modal (show morphology)
------------------------*/
const wordModal  = document.getElementById('wordModal');
const wordArNode = document.getElementById('wordAr');
const wordBnNode = document.getElementById('wordBn');
const morphBadges = document.getElementById('morphBadges');
const formsGrid = document.getElementById('formsGrid');
const gramMap = document.getElementById('gramMap');
document.getElementById('closeWord').onclick = () => { wordModal.style.display = 'none'; };

function clearNode(n){ while(n.firstChild) n.removeChild(n.firstChild); }

function showWordModal(ayah, w){
  // Arabic (bold) and Bangla meaning
  wordArNode.innerHTML = `<strong>${w.arabic}</strong>`;
  wordBnNode.textContent = w.meaning_bn || w.bangla || w.meaning || '';

  // Badges (POS, form, person, number, gender)
  clearNode(morphBadges);
  const badges = [
    w.pos_bn || w.pos || '',
    w.pos_detail || '',
    w.form ? `Form-${w.form}` : '',
    w.person || '',
    w.number || '',
    w.gender || ''
  ];
  badges.forEach(b=>{
    if(b){
      const d = document.createElement('div'); d.className = 'badge';
      d.textContent = b; morphBadges.appendChild(d);
    }
  });

  // Forms grid (Past, Present, Imperative, Root, Noun, Form)
  clearNode(formsGrid);
  const pillItems = [
    {title:'অতীত (Past)', val: w.tense_forms?.past || w.past || '-'},
    {title:'বর্তমান (Present)', val: w.tense_forms?.present || w.present || '-'},
    {title:'আদেশ (Imperative)', val: w.tense_forms?.imperative || w.imperative || '-'},
    {title:'Root (মূল)', val: w.root || '-'},
    {title:'Noun / Masdar', val: w.noun || w.masdar || '-'},
    {title:'Form', val: w.form || '-'}
  ];
  pillItems.forEach(it=>{
    const p = document.createElement('div'); p.className = 'pill';
    p.innerHTML = `<div class="p-title">${it.title}</div><div class="p-val">${it.val}</div>`;
    formsGrid.appendChild(p);
  });

  // Grammar map (subject, object, case, definite, notes)
  clearNode(gramMap);
  const rows = [
    {k:'Subject (فاعل):', v: w.subject || '-'},
    {k:'Object (مفعول):', v: w.object || '-'},
    {k:'Case (إعراب):',   v: w.case || '-'},
    {k:'Definite (ال):',   v: w.definite ? 'হ্যাঁ (ال)' : 'না'},
    {k:'Notes:',           v: w.notes_bn || w.grammar || w.remarks || '-'}
  ];
  rows.forEach(r=>{
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `<div class="gram-key">${r.k}</div><div class="gram-val">${r.v}</div>`;
    gramMap.appendChild(row);
  });

  wordModal.style.display = 'flex';
}

/* -----------------------
   Click outside modal to close
------------------------*/
window.addEventListener('click', (e)=>{
  if(e.target === grammarModal) grammarModal.style.display = 'none';
  if(e.target === wordModal) wordModal.style.display = 'none';
});
