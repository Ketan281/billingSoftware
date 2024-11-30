const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Suppress specific console errors
  mainWindow.webContents.on('console-message', (event, level, message, line, source) => {
    if (message.includes("Autofill.enable") || message.includes("Autofill.setAddresses")) {
      return;
    }
    console.log(`[${level}] ${message}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
