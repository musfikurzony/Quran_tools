function saveLastRead(surahNum, ayahNum) {
  localStorage.setItem('lastRead', JSON.stringify({ surahNum, ayahNum }));
  updateLastReadUI();
}

function getLastRead() {
  return JSON.parse(localStorage.getItem('lastRead') || 'null');
}

function updateLastReadUI() {
  const last = getLastRead();
  const div = document.getElementById('last-read');
  div.textContent = last ? `Last Read: Surah ${last.surahNum}, Ayah ${last.ayahNum}` : 'Last Read: None';
}

function pinAyah(surahNum, ayahNum) {
  localStorage.setItem('pinnedAyah', JSON.stringify({ surahNum, ayahNum }));
  alert(`Pinned Surah ${surahNum}, Ayah ${ayahNum}`);
}

function getPinnedAyah() {
  return JSON.parse(localStorage.getItem('pinnedAyah') || 'null');
}

function toggleFavorite(surahNum, ayahNum) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favs.findIndex(f => f.surahNum === surahNum && f.ayahNum === ayahNum);
  if (index >= 0) favs.splice(index, 1);
  else favs.push({ surahNum, ayahNum });
  localStorage.setItem('favorites', JSON.stringify(favs));
  alert(`Favorites Updated`);
}
