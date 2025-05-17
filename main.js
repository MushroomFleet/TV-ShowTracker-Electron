const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// File to store TV show progress
const PROGRESS_FILE = path.join(app.getPath('userData'), 'tv_show_progress.json');
// File to store app settings
const SETTINGS_FILE = path.join(app.getPath('userData'), 'app_settings.json');

let mainWindow;
let appSettings = {
  minimalMode: false
};

// Load application settings
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      appSettings = JSON.parse(data);
    } else {
      saveSettings(); // Create default settings file
    }
  } catch (error) {
    console.error('Error loading app settings:', error);
  }
}

// Save application settings
function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(appSettings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving app settings:', error);
  }
}

function createWindow() {
  // Set window size based on minimal mode
  const windowWidth = appSettings.minimalMode ? 800 : 1000;
  const windowHeight = appSettings.minimalMode ? 700 : 800;
  
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: appSettings.minimalMode ? 600 : 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
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
  // Load settings before creating the window
  loadSettings();
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
  
  // Set default mediaType to tv-show for backward compatibility
  const mediaType = show.mediaType || 'tv-show';
  
  progress[show.name] = {
    Season: show.season,
    Episode: show.episode,
    Notes: show.notes || '',
    MediaType: mediaType // Store the media type
  };
  
  const result = saveTVShowProgress(progress);
  
  let progressEmoji = '🆕 ';
  
  // Define labels based on media type
  const seasonLabel = {
    'tv-show': 'Season',
    'comic': 'Issue',
    'book': 'Volume'
  }[mediaType] || 'Season';
  
  const episodeLabel = {
    'tv-show': 'Episode',
    'comic': 'Page',
    'book': 'Page'
  }[mediaType] || 'Episode';
  
  if (prevProgress) {
    if (show.season > prevProgress.Season || (show.season === prevProgress.Season && show.episode > prevProgress.Episode)) {
      progressEmoji = mediaType === 'tv-show' ? '⏩ ' : 
                      mediaType === 'comic' ? '📖 ' : 
                      mediaType === 'book' ? '📚 ' : '⏩ ';  // Forward progress
    } else if (show.season < prevProgress.Season || (show.season === prevProgress.Season && show.episode < prevProgress.Episode)) {
      progressEmoji = mediaType === 'tv-show' ? '⏪ ' : 
                      mediaType === 'comic' ? '📑 ' : 
                      mediaType === 'book' ? '📕 ' : '⏪ ';  // Backward progress
    } else {
      progressEmoji = mediaType === 'tv-show' ? '📺 ' : 
                      mediaType === 'comic' ? '🔖 ' : 
                      mediaType === 'book' ? '📓 ' : '📺 ';  // Same position
    }
  }
  
  return {
    success: result,
    message: `${progressEmoji}Updated progress for '${show.name}' - ${seasonLabel} ${show.season}, ${episodeLabel} ${show.episode}`
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

// Set minimal mode
ipcMain.handle('set-minimal-mode', async (event, enabled) => {
  try {
    // Update app settings
    appSettings.minimalMode = enabled;
    saveSettings();
    
    // Update window size if window exists
    if (mainWindow) {
      const newWidth = enabled ? 800 : 1000;
      const newHeight = enabled ? 700 : 800;
      const newMinWidth = enabled ? 600 : 800;
      
      mainWindow.setMinimumSize(newMinWidth, 600);
      
      // Get current position
      const bounds = mainWindow.getBounds();
      
      // Update size while keeping position
      mainWindow.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: newWidth,
        height: newHeight
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting minimal mode:', error);
    return { success: false, error: error.message };
  }
});

// Get app settings
ipcMain.handle('get-app-settings', async () => {
  return appSettings;
});
