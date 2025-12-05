let surahData;

// Fetch Surah 101 JSON
fetch('data/surah_101.json')
  .then(res => {
    if(!res.ok) throw new Error('Failed to fetch JSON');
    return res.json();
  })
  .then(data => {
    surahData = data;
    renderSurah();
  })
  .catch(err => console.error(err));

function renderSurah() {
  const container = document.getElementById('surahContainer');
  container.innerHTML = '';

  surahData.ayaat.forEach(ayah => {
    const ayahDiv = document.createElement('div');
    ayahDiv.className = 'ayah';

    // Arabic with word clickable
    const arabicDiv = document.createElement('div');
    arabicDiv.className = 'arabic';
    ayah.words.forEach(word => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.textContent = word.word;
      wordSpan.onclick = () => showWordModal(word);
      arabicDiv.appendChild(wordSpan);
      arabicDiv.appendChild(document.createTextNode(' '));
    });
    ayahDiv.appendChild(arabicDiv);

    // Translations
    const transDiv = document.createElement('div');
    transDiv.className = 'translation';
    const osmaniChk = document.getElementById('osmaniCheckbox');
    const tawzihChk = document.getElementById('tawzihCheckbox');
    if(osmaniChk.checked) transDiv.innerHTML += `<div><strong>Osmani:</strong> ${ayah.translation.osmani}</div>`;
    if(tawzihChk.checked) transDiv.innerHTML += `<div><strong>Tawzih:</strong> ${ayah.translation.tawzih}</div>`;
    ayahDiv.appendChild(transDiv);

    // Grammar Notes Button
    const grammarBtn = document.createElement('button');
    grammarBtn.className = 'grammarBtn';
    grammarBtn.textContent = 'Grammar Notes';
    grammarBtn.onclick = () => showGrammarModal(ayah);
    ayahDiv.appendChild(grammarBtn);

    container.appendChild(ayahDiv);
  });
}

// Grammar Modal
const grammarModal = document.getElementById('grammarModal');
const grammarContent = document.getElementById('grammarContent');
function showGrammarModal(ayah) {
  grammarContent.textContent = ayah.grammar_notes;
  grammarModal.style.display = 'block';
}

// Word Modal
const wordModal = document.getElementById('wordModal');
const wordContent = document.getElementById('wordContent');
function showWordModal(word) {
  wordContent.textContent = JSON.stringify(word, null, 2);
  wordModal.style.display = 'block';
}

// Close Modals
document.querySelectorAll('.close').forEach(span => {
  span.onclick = () => { span.parentElement.parentElement.style.display = 'none'; }
});

// Update translations on checkbox change
document.getElementById('osmaniCheckbox').addEventListener('change', renderSurah);
document.getElementById('tawzihCheckbox').addEventListener('change', renderSurah);
