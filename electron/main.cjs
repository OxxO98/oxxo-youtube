// main.js
const { app, nativeTheme, BrowserWindow, utilityProcess } = require('electron');
const path = require('path');
const http = require('http');

let backendProcess;

function waitForServer(url, timeout = 500000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tryConnect = () => {
      http
        .get(url, (res) => {
          res.resume();

          if (res.statusCode && res.statusCode < 500) {
            resolve();
            return;
          }

          retry();
        })
        .on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startedAt > timeout) {
        reject(new Error('Backend server start timeout'));
        return;
      }
      setTimeout(tryConnect, 3000);
    };

    tryConnect();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: true,
    backgroundColor: '#111111',
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.maximize();
  
  win.setMenu(null);

  win.webContents.on('did-finish-load', () => {
    console.timeLog('startup', 'did-finish-load');
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('did-fail-load', { errorCode, errorDescription, validatedURL });
  });

  // win.webContents.openDevTools({ mode: 'detach' });

  return win;
}
console.time('startup');

function loadingWindow() {
  const loadingWin = new BrowserWindow({
    width : 512,
    height : 512,
    show : true,
    frame : false,
    backgroundColor: '#111111',
    resizable : false,
    webPreferences: {
      contextIsolation: true,
    },
  });

  loadingWin.setMenu(null);

  loadingWin.webContents.on('did-finish-load', () => {
    console.timeLog('startup', 'did-finish-load');
  });

  loadingWin.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('did-fail-load', { errorCode, errorDescription, validatedURL });
  });

  return loadingWin;
}

app.whenReady().then(async () => {
  nativeTheme.themeSource = 'dark';

  console.timeLog('startup', 'whenReady');

  const assetRoot = path.join(app.getPath('userData'), 'Asset');

  backendProcess = utilityProcess.fork(
    path.join(__dirname, '..', 'server', 'server.js'),
    [],
    { 
      env: {
        ...process.env,
        APP_ASSET_ROOT: assetRoot,
      },
      stdio: 'pipe' 
    }
  );

  console.timeLog('startup', 'window-created');

  backendProcess.stdout?.on('data', (data) => {
    console.log(`[backend] ${data}`);
  });

  backendProcess.stderr?.on('data', (data) => {
    console.error(`[backend] ${data}`);
  });

  backendProcess.on('exit', (code) => {
    console.log(`backend exited: ${code}`);
  });

  let loadingWin = loadingWindow();

  await loadingWin.loadFile(path.join(__dirname, 'loading.html'));
  
  await waitForServer('http://localhost:5000/api/health');

  loadingWin.close();

  let win = createWindow();

  // server/server.js가 CRA build까지 서빙하는 경우
  win.loadURL('http://localhost:5000');
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});