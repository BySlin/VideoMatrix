import { contextBridge, ipcRenderer } from 'electron';
const apiKey = 'matrix';

const api: Matrix = {
  versions: process.versions,
  getPlaybackDevices: async () => {
    return await ipcRenderer.invoke('getPlaybackDevices');
  },
  openWorker: (options) => {
    ipcRenderer.send('openWorker', options);
  },
  closeWorker: (outputDeviceIndex) => {
    ipcRenderer.send('closeWorker', outputDeviceIndex);
  },
};

contextBridge.exposeInMainWorld(apiKey, api);
