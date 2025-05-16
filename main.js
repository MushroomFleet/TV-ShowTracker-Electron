const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// File to store TV show progress
const PROGRESS_FILE = path.join(app.getPath('userData'), 'tv_show_progress.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
    // Icon path commented out until we have an icon
    // icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ensure the progress file exists
function ensureProgressFile() {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}), 'utf8');
    }
  } catch (error) {
    console.error('Error creating progress file:', error);
  }
}

// Load TV show progress
function loadTVShowProgress() {
  try {
    ensureProgressFile();
    const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading TV show progress:', error);
    return {};
  }
}

// Save TV show progress
function saveTVShowProgress(data) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving TV show progress:', error);
    return false;
  }
}

// Create backup
function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupFile = path.join(app.getPath('userData'), `tv_show_progress_backup_${timestamp}.json`);
    const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
    fs.writeFileSync(backupFile, data, 'utf8');
    return { success: true, file: backupFile };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { success: false, error: error.message };
  }
}

// IPC communication setup
ipcMain.handle('load-progress', async () => {
  return loadTVShowProgress();
});

ipcMain.handle('save-progress', async (event, data) => {
  return saveTVShowProgress(data);
});

ipcMain.handle('track-show', async (event, show) => {
  const progress = loadTVShowProgress();
  const prevProgress = progress[show.name] || null;
  
  progress[show.name] = {
    Season: show.season,
    Episode: show.episode,
    Notes: show.notes || ''
  };
  
  const result = saveTVShowProgress(progress);
  
  let progressEmoji = '🆕 ';
  if (prevProgress) {
    if (show.season > prevProgress.Season || (show.season === prevProgress.Season && show.episode > prevProgress.Episode)) {
      progressEmoji = '⏩ ';  // Forward progress
    } else if (show.season < prevProgress.Season || (show.season === prevProgress.Season && show.episode < prevProgress.Episode)) {
      progressEmoji = '⏪ ';  // Backward progress
    } else {
      progressEmoji = '📺 ';  // Same position
    }
  }
  
  return {
    success: result,
    message: `${progressEmoji}Updated progress for '${show.name}' - Season ${show.season}, Episode ${show.episode}`
  };
});

ipcMain.handle('delete-show', async (event, showName) => {
  const progress = loadTVShowProgress();
  
  if (!progress[showName]) {
    return { success: false, message: `Show '${showName}' not found in your watch list!` };
  }
  
  delete progress[showName];
  const result = saveTVShowProgress(progress);
  
  return {
    success: result,
    message: result ? `Successfully removed '${showName}' from your watch list!` : `Error removing '${showName}'.`
  };
});

ipcMain.handle('create-backup', async () => {
  return createBackup();
});

ipcMain.handle('import-backup', async (event, filePath) => {
  try {
    // Create a backup of current data before import
    const backupResult = createBackup();
    if (!backupResult.success) {
      return { success: false, message: 'Failed to create safety backup before import.' };
    }
    
    // Read and validate the import file
    const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (typeof importData !== 'object') {
      return { success: false, message: 'Invalid backup file format!' };
    }
    
    // Save the imported data
    const saveResult = saveTVShowProgress(importData);
    
    if (saveResult) {
      return { 
        success: true, 
        message: `Backup imported successfully! Previous data backed up to ${path.basename(backupResult.file)}` 
      };
    } else {
      return { success: false, message: 'Error saving imported data.' };
    }
  } catch (error) {
    console.error('Error importing backup:', error);
    return { success: false, message: `Error importing backup: ${error.message}` };
  }
});

ipcMain.handle('select-backup-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    defaultPath: app.getPath('userData')
  });
  
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  
  return { canceled: false, filePath: result.filePaths[0] };
});

// Open URL in external browser
ipcMain.handle('open-external-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});
