/* sujas.js — helper utilities (non-module) */

/* Small helper to ensure clicking outside modals closes them */
(function(){
  document.addEventListener('click', function(e){
    // close any element with data-close-on-outside if clicked outside
    const activeModals = document.querySelectorAll('.modal');
    activeModals.forEach(modal=>{
      if(modal.style.display !== 'none'){
        const content = modal.querySelector('.modal-content');
        if(content && !content.contains(e.target) && !e.target.closest('.word')) {
          modal.style.display = 'none';
        }
      }
    });
  });
})();
