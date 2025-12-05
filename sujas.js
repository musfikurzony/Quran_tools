const surahFiles = [
  { number: 101, file: 'data/surah_101.json' }
];

function loadSurahList() {
  const container = document.getElementById('surah-list');
  container.innerHTML = '';
  surahFiles.forEach(surah => {
    const div = document.createElement('div');
    div.className = 'surah';
    div.textContent = `Surah ${surah.number} - ${surah.number===101?'আল-ক্বারিয়াহ্':''}`;
    div.onclick = () => loadSurah(surah.file);
    container.appendChild(div);
  });
}

async function loadSurah(file) {
  const res = await fetch(file);
  const surah = await res.json();
  displayAyat(surah);
}
