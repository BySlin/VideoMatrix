import { useEffect, useRef } from 'react';
import styles from './index.less';
import queryString from 'query-string';

export default function IndexPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const options = queryString.parse(
      location.search,
    ) as unknown as DisplayWorkerOptions;

    document.body.style.overflow = 'hidden';
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: parseInt(options.width as any),
          height: parseInt(options.height as any),
          frameRate: parseInt(options.frameRate as any),
          deviceId: options.videoInputDeviceId,
        },
        audio: options.audioInputDeviceId
          ? {
              deviceId: options.audioOutputDeviceId,
            }
          : false,
      })
      .then((stream) => {
        videoRef.current!.srcObject = stream;
        videoRef.current!.play();
      });
    videoRef.current!.setSinkId(options.audioOutputDeviceId);
  }, []);

  return (
    <video
      className={styles.palybackVideo}
      controls={false}
      ref={videoRef}
      loop
      autoPlay
      // src="http://127.0.0.1:8080/2.mp4"
    />
  );
}
