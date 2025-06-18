const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendShortcut: (shortcut) => ipcRenderer.send('send-shortcut', shortcut),

  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },

  startDrag: (pos) => ipcRenderer.send('start-drag', pos),
  performDrag: (pos) => ipcRenderer.send('perform-drag', pos),

  // ADICIONE ESTA FUNÇÃO
  closeApp: () => ipcRenderer.send('close-app'),
});