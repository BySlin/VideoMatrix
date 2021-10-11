import '@szhsin/react-menu/dist/index.css';

if (window.matrix == undefined) {
  window.matrix = {
    versions: {},
    getPlaybackDevices: () => Promise.resolve([]),
    openWorker: () => {},
    closeWorker: () => {},
  };
}
