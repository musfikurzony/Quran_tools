/* sujas.js - small helpers for tooltip/popup positioning and initialization */

function initGrammarPopups(){
  // currently not used for word-modal (we use modal), but keep available
  document.body.addEventListener('click', function(e){
    // placeholder if later glyph popups needed
  });
}

// call init on load
window.addEventListener('load', function(){ try{ initGrammarPopups(); }catch(e){} });
