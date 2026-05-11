const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
});