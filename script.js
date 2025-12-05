let surahData = null;

fetch('data/surah_101.json')
  .then(r => {
    if(!r.ok) throw new Error('Failed to fetch JSON: ' + r.status);
    return r.json();
  })
  .then(data => {
    surahData = data;
    renderAyatSample(); // only render ayat 3 sample
  })
  .catch(err => {
    console.error(err);
    document.getElementById('surahWrap').innerHTML = '<div style="color:salmon">JSON লোড সমস্যা—কনসোল দেখুন।</div>';
  });

function renderAyatSample(){
  const wrap = document.getElementById('surahWrap');
  wrap.innerHTML = '';
  if(!surahData) return;

  // find ayah 3
  const ayah = surahData.ayaat.find(a => a.number === 3);
  if(!ayah){
    wrap.innerHTML = '<div style="color:salmon">আয়াত ৩ পাওয়া যায়নি।</div>';
    return;
  }

  const card = document.createElement('div');
  card.className = 'ayah';

  // Arabic line: words clickable
  const ar = document.createElement('div');
  ar.className = 'arabic-line';
  ayah.words.forEach(word => {
    const sp = document.createElement('span');
    sp.className = 'word';
    sp.textContent = word.word;
    sp.onclick = (ev) => { ev.stopPropagation(); showWordModal(word); };
    ar.appendChild(sp);
  });
  card.appendChild(ar);

  // translations
  const tr = document.createElement('div');
  tr.className = 'translations';
  tr.innerHTML = `<div><strong>অর্থ (Osmani):</strong> ${ayah.translation.osmani}</div>
                  <div><strong>অর্থ (Tawzih):</strong> ${ayah.translation.tawzih}</div>`;
  card.appendChild(tr);

  // actions (grammar full-screen)
  const actions = document.createElement('div');
  actions.className = 'actions';
  const gbtn = document.createElement('button');
  gbtn.className = 'action-btn';
  gbtn.textContent = 'Full Grammar Notes';
  gbtn.onclick = () => openGrammarModal(ayah);
  actions.appendChild(gbtn);
  card.appendChild(actions);

  wrap.appendChild(card);
}

/* ---------- Grammar modal ---------- */
const grammarModal = document.getElementById('grammarModal');
const grammarBody = document.getElementById('grammarBody');
const grammarTitle = document.getElementById('grammarTitle');
document.getElementById('closeGrammar').onclick = () => { grammarModal.style.display = 'none'; };

function openGrammarModal(ayah){
  grammarTitle.textContent = `সূরা ${surahData.number} — আয়াত ${ayah.number} — বিস্তারিত ব্যাকরণ`;
  grammarBody.innerHTML = '';

  // grammar_notes_lines is array of {group, note_bn}
  if(Array.isArray(ayah.grammar_notes_lines)){
    ayah.grammar_notes_lines.forEach(entry=>{
      const block = document.createElement('div');
      block.className = 'grammar-entry';
      const ar = document.createElement('div'); ar.className='group-ar'; ar.textContent = entry.group;
      const note = document.createElement('div'); note.className='group-note'; note.innerHTML = entry.note_bn;
      block.appendChild(ar); block.appendChild(note);
      grammarBody.appendChild(block);
    });
  } else {
    grammarBody.innerHTML = `<div class="group-note">${ayah.grammar_notes || 'কোনো ব্যাখ্যা নেই'}</div>`;
  }

  grammarModal.style.display = 'flex';
}

/* ---------- Word modal ---------- */
const wordModal = document.getElementById('wordModal');
const wordAr = document.getElementById('wordAr');
const wordBn = document.getElementById('wordBn');
const morphBadges = document.getElementById('morphBadges');
const formsGrid = document.getElementById('formsGrid');
const gramMap = document.getElementById('gramMap');
document.getElementById('closeWord').onclick = () => { wordModal.style.display = 'none'; };

function clearNode(node){ while(node.firstChild) node.removeChild(node.firstChild); }

function showWordModal(word){
  // Title
  wordAr.textContent = word.word || '';
  wordBn.textContent = word.meaning_bn || word.meaning || '';

  // badges row
  clearNode(morphBadges);
  const badges = [
    word.pos_bn || word.pos || '',
    word.pos_detail || '',
    word.form ? `ফর্ম-${word.form}` : (word.form_bn || ''),
    word.tense || word.pos_detail || '',
    word.person ? word.person : '',
    word.number ? word.number : '',
    word.gender ? word.gender : ''
  ];
  badges.forEach(b=>{
    if(b){
      const d = document.createElement('div'); d.className='badge'; d.textContent = b; morphBadges.appendChild(d);
    }
  });

  // forms grid: past/present/imperative/noun-form etc
  clearNode(formsGrid);
  const pillItems = [
    {title:'অতীত (Past)', val: word.tense_forms?.past || word.past || word.past_form || '-'},
    {title:'বর্তমান (Present)', val: word.tense_forms?.present || word.present || '-'},
    {title:'আদেশ (Imperative)', val: word.tense_forms?.imperative || word.imperative || '-'},
    {title:'Root (মূল)', val: word.root || '-'},
    {title:'Noun / Masdar', val: word.noun || word.masdar || '-'},
    {title:'Form', val: word.form || '-'}
  ];
  pillItems.forEach(it=>{
    const p = document.createElement('div'); p.className='pill';
    p.innerHTML = `<div class="p-title">${it.title}</div><div class="p-val">${it.val}</div>`;
    formsGrid.appendChild(p);
  });

  // grammar map (subject/object/notes)
  clearNode(gramMap);
  const rows = [
    {k:'Subject (فاعل):', v: word.subject || '-'},
    {k:'Object (مفعول):', v: word.object || '-'},
    {k:'Case (إعراب):', v: word.case || '-'},
    {k:'Definite (ال):', v: word.definite ? 'হ্যাঁ (ال)' : 'না'},
    {k:'Notes:', v: word.notes_bn || word.notes || '-'}
  ];
  rows.forEach(r=>{
    const rdiv = document.createElement('div'); rdiv.className='row';
    const k = document.createElement('div'); k.className='gram-key'; k.textContent = r.k;
    const v = document.createElement('div'); v.className='gram-val'; v.textContent = r.v;
    rdiv.appendChild(k); rdiv.appendChild(v);
    gramMap.appendChild(rdiv);
  });

  wordModal.style.display = 'flex';
}
