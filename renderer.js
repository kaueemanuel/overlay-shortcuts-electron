// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS ---
  const buttonContainer = document.getElementById('button-container');
  const dragBar = document.getElementById('drag-bar');
  const closeButton = document.getElementById('close-button');

  // --- ATALHOS ---
  const shortcuts = [
    { label: 'Pincel (Brush)', key: 'b', modifiers: [] },
    { label: 'Borracha (Eraser)', key: 'e', modifiers: [] },
    { label: 'Zoom In', key: '+', modifiers: ['control'] },
    { label: 'Zoom Out', key: '-', modifiers: ['control'] },
    { label: 'Desfazer (Undo)', key: 'z', modifiers: ['control'] },
    { label: 'Refazer (Redo)', key: 'z', modifiers: ['control', 'shift'] },
    { label: 'Salvar para Web', key: 's', modifiers: ['control', 'alt', 'shift'] },
    { label: 'Nova Camada', key: 'n', modifiers: ['control', 'shift'] },
    { label: 'Aumentar Pincel', key: ']', modifiers: [] },
    { label: 'Diminuir Pincel', key: '[', modifiers: [] },
  ];

  // --- CRIAÇÃO DOS BOTÕES ---
  shortcuts.forEach(shortcut => {
    const btn = document.createElement('button');
    btn.textContent = shortcut.label;
    btn.className = 'shortcut-btn';
    btn.addEventListener('click', () => {
      window.electronAPI.sendShortcut({ key: shortcut.key, modifiers: shortcut.modifiers });
    });
    buttonContainer.appendChild(btn);
  });

  // --- LÓGICA DO BOTÃO FECHAR ---
  closeButton.addEventListener('click', () => {
    window.electronAPI.closeApp();
  });

  // --- LÓGICA DE INTERATIVIDADE E ARRASTAR (MANUAL E EXCLUSIVA) ---
  let isDragging = false;
  let clickThroughTimeout = null;

  // Lógica para arrastar
  dragBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    window.electronAPI.startDrag({ x: e.screenX, y: e.screenY });
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Lógica principal de movimento
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      window.electronAPI.performDrag({ x: e.screenX, y: e.screenY });
      return;
    }

    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
    const isOverInteractiveElement = elementUnderMouse && elementUnderMouse.closest('.container');

    if (isOverInteractiveElement) {
      if (clickThroughTimeout) {
        clearTimeout(clickThroughTimeout);
        clickThroughTimeout = null;
      }
      window.electronAPI.setIgnoreMouseEvents(false);
    } else {
      if (!clickThroughTimeout) {
        clickThroughTimeout = setTimeout(() => {
          window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
          clickThroughTimeout = null;
        }, 50);
      }
    }
  });
});