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

contextBridge.exposeInMainWorld('audioDuckingAPI', {
  setActive: (active) => ipcRenderer.send('audio-ducking:set-active', Boolean(active)),
});

contextBridge.exposeInMainWorld('settingsAPI', {
  getInitialSettings: () => ipcRenderer.invoke('settings:get-initial'),
});
