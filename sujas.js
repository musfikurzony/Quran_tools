// sujas.js — small utility for rule-based AI-morphology if needed on client
(function(global){
  function detectRoot(word){
    // naive: remove diacritics and take first 3 letters (best-effort)
    return word.replace(/[ًٌٍَُِّْٰ]/g,'').replace(/^ال/, '').slice(0,3);
  }
  function detectGender(word){
    return /ة$|ـة$/.test(word) ? 'স্ত্রীলিঙ্গ' : 'পুংলিঙ্গ';
  }
  function detectNumber(word){
    return /ون$|ين$/.test(word) ? 'বহুবচন' : 'একবচন';
  }
  function detectDefinite(word){ return word.startsWith('ال') ? 'হ্যাঁ' : 'না'; }

  global.sujas = {
    detectRoot, detectGender, detectNumber, detectDefinite
  };
})(window);
