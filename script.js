function displayAyat(surah) {
  const container = document.getElementById('ayah-list');
  container.innerHTML = `<h3>${surah.name_bn} (${surah.name_ar})</h3>`;

  surah.ayaat.forEach(ayah => {
    const div = document.createElement('div');
    div.className = 'ayah';

    let arabicHTML = '';
    ayah.words.forEach(word => {
      arabicHTML += `<span class="word" onclick="showWordDetails(event, ${surah.number}, ${ayah.number}, '${word.word}')">${word.word}</span> `;
    });

    div.innerHTML = `
      <div class="arabic">${arabicHTML}</div>
      <div class="translations">
        <b>অর্থ:</b> ${ayah.translation.osmani} | ${ayah.translation.tawzih}
        <span class="options-btn" onclick="showOptions(event, ${surah.number}, ${ayah.number})">⚙️</span>
        <span class="pin-btn" onclick="pinAyah(${surah.number}, ${ayah.number})">📌</span>
        <span class="fav-btn" onclick="toggleFavorite(${surah.number}, ${ayah.number})">⭐</span>
      </div>
    `;
    div.onclick = () => saveLastRead(surah.number, ayah.number);
    container.appendChild(div);
  });
}

// Popups
function showOptions(event, surahNum, ayahNum) {
  event.stopPropagation();
  fetch(`data/surah_${surahNum}.json`)
    .then(res => res.json())
    .then(surah => {
      const ayah = surah.ayaat.find(a => a.number === ayahNum);
      openPopup(`<h3>Surah ${surahNum}, Ayah ${ayahNum} Grammar Notes</h3><p>${ayah.grammar_notes}</p>`);
    });
}

function showWordDetails(event, surahNum, ayahNum, word) {
  event.stopPropagation();
  fetch(`data/surah_${surahNum}.json`)
    .then(res => res.json())
    .then(surah => {
      const ayah = surah.ayaat.find(a => a.number === ayahNum);
      const wordData = ayah.words.find(w => w.word === word);
      if (!wordData) return;
      const content = `
        <b>${wordData.word}</b><br>
        Root: ${wordData.root}<br>
        Meaning: ${wordData.meaning}<br>
        Type: ${wordData.type || '-'}<br>
        Gender: ${wordData.gender || '-'}<br>
        Tense: ${wordData.tense || '-'}
      `;
      openPopup(content);
    });
}

function openPopup(content) {
  const popup = document.getElementById('popup');
  document.getElementById('popup-content').innerHTML = content;
  popup.style.display = 'block';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

// Initialize
loadSurahList();
updateLastReadUI();
