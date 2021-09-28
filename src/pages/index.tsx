import { useEffect, useMemo, useRef, useState } from 'react';
import { ControlledMenu, MenuItem, SubMenu } from '@szhsin/react-menu';
import styles from './index.less';
import { Col, Row } from 'antd';
import { useLocalStorageState } from 'ahooks';

const defaultDeviceId = ['communications', 'default'];
export default function IndexPage() {
  const videoRef = useRef<HTMLVideoElement[]>([]);
  const [audioInputList, setAudioInputList] = useState<MediaDeviceInfo[]>([]);
  const [videoInputList, setVideoInputList] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputList, setAudioOutputList] = useState<MediaDeviceInfo[]>([]);
  const [playbackDeviceList, setPlaybackDeviceList] = useState<
    PlaybackDevice[]
  >([]);
  const [isOpen, setOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [column, setColumn] = useLocalStorageState<number>('matrixColumn', 2);
  const [row, setRow] = useLocalStorageState<number>('matrixRow', 2);
  const [videoOutputOptionsMap, setVideoOutputOptionsMap] = useState<{
    [name: number]: DisplayWorkerOptions & {
      playing: boolean;
      videoIndex: number;
    };
  }>([]);
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const [streams, setStreams] = useState<MediaStream[]>([]);

  const videoArray = useMemo(() => {
    const array = [];
    const length = column * row;
    for (let i = 0; i < length; i++) {
      array.push(
        <Col
          key={`video${i}`}
          span={24 / column}
          style={{ height: `${100 / row}%` }}
          onContextMenu={(e) => {
            e.preventDefault();
            setVideoIndex(i);
            setAnchorPoint({ x: e.clientX, y: e.clientY });
            setOpen(true);
          }}
        >
          <video
            className={styles.preview}
            ref={(r) => {
              videoRef.current[i] = r!;
            }}
            loop
            autoPlay
            muted
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload"
          />
        </Col>,
      );
    }
    return array;
  }, [column, row]);

  useEffect(() => {
    Object.keys(videoOutputOptionsMap).forEach((key: any) => {
      const options = videoOutputOptionsMap[key];
      openStream(options);
      if (options.playing) {
        window.matrix.openWorker(options);
      }
    });
  }, []);

  useEffect(() => {
    const length = column * row;
    for (let i = 0; i < length; i++) {
      const stream = streams[i];
      if (stream) {
        videoRef.current[i].srcObject = stream;
        videoRef.current[i].controls = true;
        videoRef.current[i].play();
      } else {
        videoRef.current[i].controls = false;
        videoRef.current[i].pause();
      }
    }
    if (streams.length > length) {
      for (let i = length; i < streams.length; i++) {
        const stream = streams[i];
        if (stream) {
          const tracks = streams[videoIndex].getTracks();
          tracks.forEach((t) => t.stop());
        }
      }
    }
  }, [streams, column, row]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setAudioInputList(
        devices.filter(
          (d) =>
            d.kind === 'audioinput' && !defaultDeviceId.includes(d.deviceId),
        ),
      );
      setVideoInputList(
        devices.filter(
          (d) =>
            d.kind === 'videoinput' && !defaultDeviceId.includes(d.deviceId),
        ),
      );
      setAudioOutputList(
        devices.filter(
          (d) =>
            d.kind === 'audiooutput' && !defaultDeviceId.includes(d.deviceId),
        ),
      );
    });
    window.matrix.getPlaybackDevices().then(setPlaybackDeviceList);
  }, []);

  const openPort = (deviceGroupId: string, width: number, height: number) => {
    const videoInputDeviceId = videoInputList.filter(
      (d) => d.groupId === deviceGroupId,
    )[0].deviceId;
    const audioInputDeviceId = audioInputList.filter(
      (d) => d.groupId === deviceGroupId,
    )[0]?.deviceId;
    if (streams[videoIndex]) {
      const tracks = streams[videoIndex].getTracks();
      tracks.forEach((t) => t.stop());
    }

    //输出到上屏卡配置
    videoOutputOptionsMap[videoIndex] = {
      videoIndex,
      width,
      height,
      audioInputDeviceId,
      videoInputDeviceId,
      outputDeviceIndex: 0,
      frameRate: 30,
      playing: false,
    };

    setVideoOutputOptionsMap(() => ({ ...videoOutputOptionsMap }));

    openStream(videoOutputOptionsMap[videoIndex]);
  };

  const openStream = (
    options: DisplayWorkerOptions & { playing: boolean; videoIndex: number },
  ) => {
    //获取视频流
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: options.width,
          height: options.height,
          deviceId: options.videoInputDeviceId,
        },
        audio: options.audioInputDeviceId
          ? {
              deviceId: options.audioInputDeviceId,
            }
          : false,
      })
      .then((stream) => {
        streams[options.videoIndex] = stream;
        setStreams(() => [...streams]);
      });
  };

  const playback = ({ subDeviceIndex, displayName }: PlaybackDevice) => {
    const audioOutputDeviceId = audioOutputList.filter((d) =>
      d.label.includes(displayName),
    )[0]?.deviceId;

    Object.keys(videoOutputOptionsMap).forEach((key: any) => {
      const options = videoOutputOptionsMap[key];
      if (options.playing && options.outputDeviceIndex === subDeviceIndex) {
        videoOutputOptionsMap[key].playing = false;
      }
    });

    videoOutputOptionsMap[videoIndex] = {
      ...videoOutputOptionsMap[videoIndex],
      outputDeviceIndex: subDeviceIndex,
      playing: true,
      audioOutputDeviceId,
    };
    setVideoOutputOptionsMap({ ...videoOutputOptionsMap });
    window.matrix.openWorker(videoOutputOptionsMap[videoIndex]);
  };

  const closeWorker = () => {
    videoOutputOptionsMap[videoIndex].playing = false;
    setVideoOutputOptionsMap({ ...videoOutputOptionsMap });
    window.matrix.closeWorker(
      videoOutputOptionsMap[videoIndex].outputDeviceIndex,
    );
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        width: document.body.offsetWidth,
        height: document.body.offsetHeight,
      }}
    >
      <Row
        gutter={[1, 1]}
        style={{
          width: document.body.offsetWidth,
          height: document.body.offsetHeight,
        }}
      >
        {videoArray}
      </Row>
      <ControlledMenu
        anchorPoint={anchorPoint}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      >
        <SubMenu label="视频输入">
          {videoInputList.map((d) => (
            <SubMenu label={d.label} key={d.deviceId}>
              <MenuItem onClick={() => openPort(d.groupId, 3840, 2160)}>
                3840*2160
              </MenuItem>
              <MenuItem onClick={() => openPort(d.groupId, 1920, 1080)}>
                1920*1080
              </MenuItem>
              <MenuItem onClick={() => openPort(d.groupId, 1280, 720)}>
                1280*720
              </MenuItem>
              <MenuItem onClick={() => openPort(d.groupId, 960, 540)}>
                960*540
              </MenuItem>
              <MenuItem onClick={() => openPort(d.groupId, 640, 360)}>
                640*360
              </MenuItem>
            </SubMenu>
          ))}
        </SubMenu>
        {streams[videoIndex]?.active &&
          !videoOutputOptionsMap[videoIndex]?.playing && (
            <SubMenu label="输出到">
              {playbackDeviceList.map((d) => (
                <MenuItem key={d.subDeviceIndex} onClick={() => playback(d)}>
                  {d.displayName}
                </MenuItem>
              ))}
            </SubMenu>
          )}
        {videoOutputOptionsMap[videoIndex]?.playing && (
          <MenuItem onClick={closeWorker}>停止输出</MenuItem>
        )}
        <SubMenu label="画面排布">
          <MenuItem
            onClick={() => {
              setColumn(2);
              setRow(2);
            }}
          >
            2X2
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColumn(3);
              setRow(3);
            }}
          >
            3X3
          </MenuItem>
          <MenuItem
            onClick={() => {
              setColumn(4);
              setRow(3);
            }}
          >
            4X3
          </MenuItem>
        </SubMenu>
      </ControlledMenu>
    </div>
  );
}
