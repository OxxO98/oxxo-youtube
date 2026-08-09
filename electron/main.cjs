// main.js
const { app, nativeTheme, BrowserWindow, utilityProcess, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

const logger = require("./consoleLogger.cjs");
const { AudioDuckerProcess } = require('./audioDucker.cjs');
const { DEFAULT_SETTINGS, loadInitialSettings } = require('./settingsStore.cjs');

let backendProcess;
let audioDucker;
let initialSettings = DEFAULT_SETTINGS;

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

function requestJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let data = null;

          try {
            data = body.length > 0 ? JSON.parse(body) : null;
          } catch (error) {
            reject(error);
            return;
          }

          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Request failed with status ${res.statusCode}`));
            return;
          }

          resolve(data);
        });
      })
      .on('error', reject);
  });
}

function sendLoadingStatus(win, payload) {
  if (!win || win.isDestroyed()) {
    return;
  }

  win.webContents.send('loading:status', payload);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: true,
    backgroundColor: '#111111',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
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

  win.webContents.on(
    "console-message",
    (_event, details) => {
      const metadata = {
        webContentsId: win.webContents.id,
        level: details.level,
        message: details.message,
        lineNumber: details.lineNumber,
        sourceId: details.sourceId,
      };

      switch (details.level) {
        case "error":
          logger.error("renderer_console", metadata);
          win.webContents.openDevTools({ mode: 'detach' });
          break;

        case "warning":
          logger.warn("renderer_console", metadata);
          break;

        case "debug":
          logger.debug("renderer_console", metadata);
          break;

        default:
          logger.info("renderer_console", metadata);
      }
    },
  );

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
      preload: path.join(__dirname, 'preload.cjs'),
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

  initialSettings = await loadInitialSettings();
  process.env.APP_LANGUAGE = initialSettings.general.language;

  audioDucker = new AudioDuckerProcess({
    enabled: initialSettings.audioDucking.enabled,
    duckLevel: initialSettings.audioDucking.duckLevel,
  });

  const appRoot = path.join(__dirname, '..');
  const assetRoot = path.join(app.getPath('userData'), 'Asset');

  backendProcess = utilityProcess.fork(
    path.join(appRoot, 'server', 'dist', 'server.js'),
    [],
    { 
      env: {
        ...process.env,
        APP_ROOT: appRoot,
        APP_ASSET_ROOT: assetRoot,
        APP_LANGUAGE: initialSettings.general.language,
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

  try {
    let version_info = `ver. ${app.getVersion()}`;

    sendLoadingStatus(loadingWin, {
      title: '앱을 준비 중입니다...',
      status: '서버 시작 대기 중...',
      version: version_info,
    });

    await waitForServer('http://localhost:5000/api/health');

    sendLoadingStatus(loadingWin, {
      title: '앱을 준비 중입니다...',
      status: '데이터 무결성 확인 중...',
      version: version_info,
    });

    const integrity = await requestJson('http://localhost:5000/db/integrity');

    if (integrity?.ok === false || integrity?.message === 'error') {
      throw new Error(integrity?.errorCode || 'DB integrity check failed');
    }

    sendLoadingStatus(loadingWin, {
      title: '앱을 준비 중입니다...',
      status: '앱 화면을 여는 중...',
      version: version_info,
    });
  } catch (error) {
    console.error('startup failed', error);
    sendLoadingStatus(loadingWin, {
      title: '시작 중 오류가 발생했습니다.',
      status: error instanceof Error ? error.message : '알 수 없는 오류입니다.',
      version: version_info,
    });
    return;
  }

  loadingWin.close();

  let win = createWindow();

  // server/dist/server.js serves the CRA build.
  win.loadURL('http://localhost:5000');
});

ipcMain.on('audio-ducking:set-active', (_event, active) => {
  audioDucker?.setActive(active);
});

ipcMain.handle('settings:get-initial', () => {
  return initialSettings;
});

app.on('will-quit', () => {
  audioDucker?.stop();
  if (backendProcess) {
    backendProcess.kill();
  }
});
