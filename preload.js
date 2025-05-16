const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', 
  {
    // TV show tracking
    loadProgress: () => ipcRenderer.invoke('load-progress'),
    saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
    trackShow: (show) => ipcRenderer.invoke('track-show', show),
    deleteShow: (showName) => ipcRenderer.invoke('delete-show', showName),
    
    // Backup management
    createBackup: () => ipcRenderer.invoke('create-backup'),
    importBackup: (filePath) => ipcRenderer.invoke('import-backup', filePath),
    selectBackupFile: () => ipcRenderer.invoke('select-backup-file'),
    
    // URL handling
    openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url)
  }
);
