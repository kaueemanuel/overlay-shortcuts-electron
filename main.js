// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const robot = require('@hurdlegroup/robotjs');

// Adiciona o recarregamento automático em modo de desenvolvimento
try {
  require('electron-reloader')(module);
} catch (_) { }

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 86,
    zoomToPageWidth: false,
    // ===================================
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,         // Janela sem bordas
    transparent: true,    // Fundo transparente
    alwaysOnTop: true,    // Sempre por cima de outras janelas
    focusable: false,     // Essencial para não roubar o foco de outras apps
  });

  // A janela começa ignorando cliques, permitindo clicar "através" dela
  win.setIgnoreMouseEvents(true, { forward: true });

  win.webContents.setZoomFactor(1.0);

  // Carrega o arquivo HTML da interface
  win.loadFile('index.html');

  // Abre o DevTools (Ferramentas de Desenvolvedor) em uma janela separada
  // win.webContents.openDevTools({ mode: 'detach' });


  // Listener para ligar/desligar a interatividade da janela
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    if (browserWindow) {
      browserWindow.setIgnoreMouseEvents(ignore, options);
    }
  });

  // Listener para executar os atalhos de teclado
  ipcMain.on('send-shortcut', (event, shortcut) => {
    try {
      robot.keyTap(shortcut.key, shortcut.modifiers || []);
      console.log(`[Main] Atalho executado: ${shortcut.modifiers.join('+')} + ${shortcut.key}`);
    } catch (e) {
      console.error('[Main] Falha ao executar atalho:', e);
    }
  });

  // --- LÓGICA PARA ARRASTAR A JANELA MANUALMENTE ---
  let initialMousePos = { x: 0, y: 0 };
  let initialWindowPos = { x: 0, y: 0 };

  ipcMain.on('start-drag', (event, pos) => {
    initialMousePos = pos;
    const [winX, winY] = win.getPosition();
    initialWindowPos = { x: winX, y: winY };
  });

  ipcMain.on('perform-drag', (event, pos) => {
    const dx = pos.x - initialMousePos.x;
    const dy = pos.y - initialMousePos.y;
    win.setPosition(initialWindowPos.x + dx, initialWindowPos.y + dy);
  });
  // --- FIM DA LÓGICA DE ARRASTAR ---

  // Listener para fechar a aplicação
  ipcMain.on('close-app', () => {
    console.log('[Main] Mensagem "close-app" recebida. Fechando a janela...');
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(createWindow);

// Encerra a aplicação quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Recria a janela no macOS se o ícone do dock for clicado e não houver outras janelas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});