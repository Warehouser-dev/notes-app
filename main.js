const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(app.getPath('userData'), 'notes.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    backgroundColor: '#1e1e1e',
    trafficLightPosition: { x: 15, y: 15 }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('load-notes', async () => {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = await fs.promises.readFile(DATA_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    throw new Error('Failed to load notes');
  }
  return [];
});

ipcMain.handle('save-notes', async (_event, notes) => {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(notes, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving notes:', error);
    throw new Error('Failed to save notes');
  }
});
