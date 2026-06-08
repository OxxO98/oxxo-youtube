const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('loadingAPI', {
  onStatus: (callback) => {
    const listener = (_event, payload) => {
      callback(payload);
    };

    ipcRenderer.on('loading:status', listener);

    return () => {
      ipcRenderer.removeListener('loading:status', listener);
    };
  },
});
