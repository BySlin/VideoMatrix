import { app, BrowserWindow, Menu, protocol, screen } from 'electron';
import { closeDisplayWorkers } from './MainEvent';
import createProtocol from 'umi-plugin-electron-builder/lib/createProtocol';
import path from 'path';

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');

const isDevelopment = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:8000');
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html');
  }

  return mainWindow;
}

app.on('ready', async () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

(async function () {
  await app.whenReady();

  const mainWindow = createWindow();
  const width = screen.getPrimaryDisplay().workAreaSize.width;
  let zoomFactor = 1;
  if (width === 1280) {
    zoomFactor = 0.6666666667;
  } else if (width === 1536) {
    zoomFactor = 0.8;
  } else if (width === 1920) {
    zoomFactor = 1;
  } else if (width === 2560) {
    zoomFactor = 1.3333333333;
  } else if (width === 3840) {
    zoomFactor = 2;
  }
  mainWindow?.webContents.setZoomFactor(zoomFactor);
  mainWindow?.on('close', () => {
    closeDisplayWorkers();
    process.exit(0);
  });

  Menu.setApplicationMenu(null);
})();
