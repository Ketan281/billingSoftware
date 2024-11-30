const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process'); // Add this for running backend script

let mainWindow;
let backendProcess; // To hold the backend process reference

app.on('ready', () => {
  // Start the backend process
  backendProcess = exec('node backend/index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting backend: ${error.message}`);
      return;
    }
    console.log(`Backend stdout: ${stdout}`);
  });

  // Create the Electron window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
    },
  });

  // Load the frontend
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Suppress specific console errors
  mainWindow.webContents.on('console-message', (event, level, message, line, source) => {
    if (message.includes("Autofill.enable") || message.includes("Autofill.setAddresses")) {
      return;
    }
    console.log(`[${level}] ${message}`);
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Ensure backend process is killed when the app closes
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Handle all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
