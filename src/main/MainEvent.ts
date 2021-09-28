import { ipcMain } from 'electron';
import macadam from '@byslin/macadam';
import DisplayWorker from './DisplayWorker';

const devicesInfos: any[] = macadam.getDeviceInfo() as any;

const displayWorkers: Map<number, DisplayWorker> = new Map();

ipcMain.on('openWorker', (_, options: DisplayWorkerOptions) => {
  if (displayWorkers.has(options.outputDeviceIndex)) {
    displayWorkers.get(options.outputDeviceIndex)?.close();
  }
  displayWorkers.set(options.outputDeviceIndex, new DisplayWorker(options));
});

ipcMain.on('closeWorker', (_, outputDeviceIndex: number) => {
  if (displayWorkers.has(outputDeviceIndex)) {
    displayWorkers.get(outputDeviceIndex)?.close();
    displayWorkers.delete(outputDeviceIndex);
  }
});

ipcMain.handle('getPlaybackDevices', async (): Promise<any[]> => {
  return devicesInfos.filter((d) =>
    (d.deviceSupports as Array<string>).includes('Playback'),
  );
});

export const closeDisplayWorkers = () => {
  for (var [_, value] of displayWorkers.entries()) {
    value.close();
  }
};
