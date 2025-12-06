// sujas.js (plain)
(function(window){
  window.initAppUI = function(onToggleChange){
    // create a small top controls bar inside header (if not exists)
    const header = document.querySelector('.topbar') || document.body;
    // remove existing controls if any
    const existing = document.getElementById('appControls');
    if(existing) existing.remove();

    const ctrl = document.createElement('div');
    ctrl.id = 'appControls';
    ctrl.style.display = 'flex';
    ctrl.style.gap = '12px';
    ctrl.style.alignItems = 'center';
    ctrl.style.margin = '10px';
    ctrl.style.flexWrap = 'wrap';

    // translations toggles
    const osmaniLabel = document.createElement('label');
    osmaniLabel.style.fontSize = '14px';
    osmaniLabel.style.display = 'flex';
    osmaniLabel.style.alignItems = 'center';
    osmaniLabel.innerHTML = `<input type="checkbox" id="chkOsmani" style="margin-right:6px"> তাফসীরে Osmani`;

    const tawzihLabel = document.createElement('label');
    tawzihLabel.style.fontSize = '14px';
    tawzihLabel.style.display = 'flex';
    tawzihLabel.style.alignItems = 'center';
    tawzihLabel.innerHTML = `<input type="checkbox" id="chkTawzih" style="margin-right:6px"> তাওযীহুল কুরআন`;

    ctrl.appendChild(osmaniLabel);
    ctrl.appendChild(tawzihLabel);

    header.appendChild(ctrl);

    // load saved states
    const os = window.AppStorage.load('showOsmani', true);
    const tw = window.AppStorage.load('showTawzih', true);
    document.getElementById('chkOsmani').checked = !!os;
    document.getElementById('chkTawzih').checked = !!tw;

    function changeHandler(){
      const v1 = document.getElementById('chkOsmani').checked;
      const v2 = document.getElementById('chkTawzih').checked;
      window.AppStorage.save('showOsmani', v1);
      window.AppStorage.save('showTawzih', v2);
      if(typeof onToggleChange === 'function') onToggleChange(v1, v2);
    }

    document.getElementById('chkOsmani').addEventListener('change', changeHandler);
    document.getElementById('chkTawzih').addEventListener('change', changeHandler);
  };
})(window);
