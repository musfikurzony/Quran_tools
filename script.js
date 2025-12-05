let surahData = null;

// fetch JSON with error logging
fetch('data/surah_101.json')
  .then(resp => {
    if(!resp.ok) throw new Error('পাঠাতে ব্যর্থ হলো: ' + resp.statusText);
    return resp.json();
  })
  .then(data => {
    surahData = data;
    renderSurah();
  })
  .catch(err => {
    console.error(err);
    const container = document.getElementById('surahContainer');
    container.innerHTML = `<div style="color:red">JSON লোড করতে সমস্যা হয়েছে — কনসোলে দেখুন।</div>`;
  });

// render surah (uses words[] and grammar_notes array)
function renderSurah(){
  const container = document.getElementById('surahContainer');
  container.innerHTML = '';
  if(!surahData || !surahData.ayaat) return;

  surahData.ayaat.forEach(ayah => {
    const card = document.createElement('article');
    card.className = 'ayah';

    // Arabic line — words as spans (grouped according to JSON words array)
    const arDiv = document.createElement('div');
    arDiv.className = 'arabic-line';
    // words array is an ordered list of word objects; we show them in that order
    ayah.words.forEach(w => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w.word;
      span.title = 'Click করে বিস্তারিত দেখুন';
      span.onclick = (ev) => { ev.stopPropagation(); openWordModal(w); };
      arDiv.appendChild(span);
      // add small space handled by css margin
    });
    card.appendChild(arDiv);

    // translations (checkbox controlled)
    const transDiv = document.createElement('div');
    transDiv.className = 'translations';
    const os = document.getElementById('osmaniCheckbox');
    const tw = document.getElementById('tawzihCheckbox');
    if(os && os.checked) transDiv.innerHTML += `<div><strong>Osmani:</strong> ${ayah.translation.osmani}</div>`;
    if(tw && tw.checked) transDiv.innerHTML += `<div><strong>Tawzih:</strong> ${ayah.translation.tawzih}</div>`;
    card.appendChild(transDiv);

    // actions: grammar full-screen
    const actions = document.createElement('div');
    actions.className = 'actions';
    const gbtn = document.createElement('button');
    gbtn.className = 'action-btn';
    gbtn.textContent = 'Full Grammar Notes (পড়া)';
    gbtn.onclick = (ev) => { ev.stopPropagation(); openGrammarModal(ayah); };
    actions.appendChild(gbtn);

    card.appendChild(actions);
    container.appendChild(card);
  });
}

/* ---------- Grammar modal (full-screen, vertical) ---------- */

const grammarModal = document.getElementById('grammarModal');
const grammarBody = document.getElementById('grammarBody');
const grammarTitle = document.getElementById('grammarTitle');
document.getElementById('closeGrammar').onclick = () => { grammarModal.style.display = 'none'; };

function openGrammarModal(ayah){
  grammarTitle.textContent = `সূরা ${surahData.number} — আয়াত ${ayah.number} — বিস্তারিত ব্যাকরণ`;
  grammarBody.innerHTML = ''; // clear

  // Grammar_notes is expected as an array of objects { group: "ARABIC GROUP", note_bn: "Bangla note" }
  if(Array.isArray(ayah.grammar_notes_lines)){
    ayah.grammar_notes_lines.forEach(entry => {
      const block = document.createElement('div');
      block.className = 'grammar-entry';

      // Arabic group line (one group per line)
      const gAr = document.createElement('div');
      gAr.className = 'group-ar';
      gAr.textContent = entry.group; // Arabic group exactly as provided
      block.appendChild(gAr);

      // Bangla note below
      const gNote = document.createElement('div');
      gNote.className = 'group-note';
      gNote.innerHTML = entry.note_bn;
      block.appendChild(gNote);

      grammarBody.appendChild(block);
    });
  } else {
    // fallback: if single string provided
    const fallback = document.createElement('div');
    fallback.className = 'grammar-entry';
    fallback.innerHTML = `<div class="group-note">${ayah.grammar_notes || 'কোনো ব্যাখ্যা নেই।'}</div>`;
    grammarBody.appendChild(fallback);
  }

  // show modal (full-screen)
  grammarModal.style.display = 'flex';
}

/* ---------- Word modal (compact, structured, no raw JSON) ---------- */

const wordModal = document.getElementById('wordModal');
const wordBody = document.getElementById('wordBody');
const wordTitle = document.getElementById('wordTitle');
document.getElementById('closeWord').onclick = () => { wordModal.style.display = 'none'; };

function openWordModal(wordObj){
  // wordObj expected with many fields (see sample JSON)
  wordTitle.textContent = wordObj.word || 'শব্দ';

  // Build a clear Bangla structured view
  wordBody.innerHTML = '';

  const addRow = (label, value) => {
    const lab = document.createElement('div');
    lab.className = 'word-label';
    lab.textContent = label;
    wordBody.appendChild(lab);

    const val = document.createElement('div');
    val.className = 'word-value';
    val.textContent = (value === null || value === undefined || value === '') ? '-' : value;
    wordBody.appendChild(val);
  };

  addRow('মূল (Root):', wordObj.root || '-');
  addRow('বাংলা অর্থ:', wordObj.meaning_bn || wordObj.meaning || '-');
  addRow('ধরণ (POS):', wordObj.pos_bn || wordObj.type_bn || wordObj.type || '-');
  addRow('বর্ণনা (সংকেত):', wordObj.notes_bn || '-');

  // Morphology
  addRow('ব্যাকরণিক শ্রেণি:', wordObj.pos_detail || '-'); // اسم/فعل/حرف ইত্যাদি
  addRow('ব্যক্তি:', wordObj.person || '-'); // ৩য় পুরুষ ইত্যাদি
  addRow('বচন:', wordObj.number || '-'); // একবচন/বহুবচন
  addRow('লিঙ্গ:', wordObj.gender || '-'); // পুং/স্ত্রীলিঙ্গ
  addRow('আকর/ওস্তি (Case):', wordObj.case || '-'); // مرفوع/منصوب ইত্যাদি
  addRow('নির্দিষ্ট (ال):', wordObj.definite ? 'হ্যাঁ (ال)' : 'না');

  // Verb extra forms
  if(wordObj.pos_detail && wordObj.pos_detail.toLowerCase().includes('فعل') ){
    addRow('মূল ধরণ (Form):', wordObj.form || '-');
    addRow('অতীত (past):', wordObj.tense_forms ? (wordObj.tense_forms.past || '-') : (wordObj.past || '-'));
    addRow('বর্তমান (present):', wordObj.tense_forms ? (wordObj.tense_forms.present || '-') : (wordObj.present || '-'));
    addRow('আদেশ (imperative):', wordObj.tense_forms ? (wordObj.tense_forms.imperative || '-') : (wordObj.imperative || '-'));
    addRow('বিষয়/কার্য (subject/object):', wordObj.subject || (wordObj.object ? `Object: ${wordObj.object}` : '-') );
  }

  wordModal.style.display = 'flex';
}

/* Update translations on checkbox change */
document.getElementById('osmaniCheckbox').addEventListener('change', renderSurah);
document.getElementById('tawzihCheckbox').addEventListener('change', renderSurah);
