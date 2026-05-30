/* ===== SPMods — Source Protection ===== */

// 1. CSS — Disable text selection (strongest method)
document.head.insertAdjacentHTML('beforeend', `<style>
  *{
    user-select:none !important;
    -webkit-user-select:none !important;
    -moz-user-select:none !important;
    -ms-user-select:none !important;
  }
</style>`);

// 2. Disable right-click
document.addEventListener('contextmenu', e => e.preventDefault());

// 3. Disable text selection via JS
document.addEventListener('selectstart', e => e.preventDefault());

// 4. Disable drag & drop
document.addEventListener('dragstart', e => e.preventDefault());

// 5. Disable copy / cut / paste
document.addEventListener('copy',  e => e.preventDefault());
document.addEventListener('cut',   e => e.preventDefault());
document.addEventListener('paste', e => e.preventDefault());

// 6. Disable print (Ctrl+P)
window.addEventListener('beforeprint', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    return false;
  }
});

// 7. Disable keyboard shortcuts
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (
    e.key    === 'F12'                                           || // DevTools
    (e.ctrlKey && k === 'u')                                    || // View Source
    (e.ctrlKey && k === 's')                                    || // Save page
    (e.ctrlKey && k === 'a')                                    || // Select all
    (e.ctrlKey && k === 'c')                                    || // Copy
    (e.ctrlKey && k === 'x')                                    || // Cut
    (e.ctrlKey && e.shiftKey && ['i','j','c','k'].includes(k))    // DevTools panels
  ) {
    e.preventDefault();
    return false;
  }
});

// 8. Detect DevTools open — blank the page
(function() {
  const threshold = 160;
  setInterval(() => {
    if (
      window.outerWidth  - window.innerWidth  > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      document.body.innerHTML = `
        <div style="
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          height:100vh;font-family:sans-serif;
          background:#f0f4f0;gap:12px;
        ">
          <div style="font-size:48px">🔒</div>
          <div style="font-size:20px;font-weight:800;color:#1a2e1c">Access Denied</div>
          <div style="font-size:13px;color:#6b8f6e;font-weight:600">Developer tools are not allowed on this site.</div>
        </div>`;
    }
  }, 1000);
})();

// 9. Disable image drag & long-press save (mobile)
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.style.webkitUserDrag = 'none';
  img.style.pointerEvents  = 'none';
});
// Also apply to future dynamically added images
const imgObserver = new MutationObserver(mutations => {
  mutations.forEach(m => m.addedNodes.forEach(node => {
    if (node.nodeName === 'IMG') {
      node.setAttribute('draggable', 'false');
      node.style.pointerEvents = 'none';
    }
  }));
});
imgObserver.observe(document.body, { childList: true, subtree: true });

// 10. Disable console access warning
(function() {
  const warn = '%c⛔ SPMods — Unauthorized Access Prohibited';
  const style = 'color:red;font-size:16px;font-weight:bold;';
  setInterval(() => console.clear(), 100);
  console.log(warn, style);
})();
