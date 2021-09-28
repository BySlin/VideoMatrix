import macadam, { PlaybackChannel } from '@byslin/macadam';
import { BrowserWindow } from 'electron';
import queryString from 'query-string';

const isDevelopment = process.env.NODE_ENV === 'development';

export default class DisplayWorker {
  win: BrowserWindow;
  playback?: PlaybackChannel;

  constructor(options: DisplayWorkerOptions) {
    options.frameRate = options.frameRate ?? 60;
    options.width = options.width ?? 3840;
    options.height = options.height ?? 3840;

    const queryParams = queryString.stringify(options);
    console.log(queryParams);

    this.win = new BrowserWindow({
      fullscreen: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: true,
      },
    });
    if (isDevelopment) {
      this.win.loadURL(`http://localhost:8000/worker.html?${queryParams}`);
    } else {
      this.win.loadURL(`app://./worker.html?${queryParams}`);
    }
    this.win.webContents.setFrameRate(options.frameRate);
    this.win.webContents.on('paint', async (_, dirty, image) => {
      if (this.playback) {
        await this.playback.displayFrame(image.toBitmap());
      } else {
        await this.createPlayback(options.outputDeviceIndex, dirty.width);
      }
    });
  }

  close() {
    this.playback?.stop();
    this.playback = undefined;
    this.win.close();
  }

  /**
   * 创建输出设备
   * @param deviceIndex 输出设备序号
   * @param width
   */
  private async createPlayback(deviceIndex: number, width: number) {
    if (this.playback == undefined) {
      let displayMode = macadam.bmdMode4K2160p30;
      if (width === 3840) {
        displayMode = macadam.bmdMode4K2160p30;
      } else if (width === 1920) {
        displayMode = macadam.bmdModeHD1080p6000;
      } else if (width === 1280) {
        displayMode = macadam.bmdModeHD720p60;
      } else if (width === 960) {
        displayMode = macadam.bmdModeHD720p60;
      } else {
        displayMode = macadam.bmdModePAL;
      }
      this.playback = await macadam.playback({
        deviceIndex,
        displayMode,
        pixelFormat: macadam.bmdFormat8BitBGRA,
      });
    }
  }
}
