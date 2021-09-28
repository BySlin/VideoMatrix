declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

type PlaybackDevice = {
  subDeviceIndex: number;
  displayName: string;
  modelName: string;
};

type DisplayWorkerOptions = {
  outputDeviceIndex: number;
  frameRate?: number;
  width: number;
  height: number;
  videoInputDeviceId: string;
  audioInputDeviceId?: string;
  audioOutputDeviceId?: string;
};

type Matrix = {
  versions: any;
  getPlaybackDevices: () => Promise<PlaybackDevice[]>;
  openWorker: (options: DisplayWorkerOptions) => void;
  closeWorker: (outputDeviceIndex: number) => void;
};

interface Window {
  matrix: Matrix;
}
