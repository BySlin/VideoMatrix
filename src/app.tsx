import { initSystem } from 'byslin-boot-view-utils';
import '@szhsin/react-menu/dist/index.css';

initSystem({
  checkUpdateInterval: 0,
  autoResolution: false,
  initWebPlugin: false,
});

if (window.matrix == undefined) {
  window.matrix = {
    versions: {},
    getPlaybackDevices: () => Promise.resolve([]),
    openWorker: () => {},
    closeWorker: () => {},
  };
}
