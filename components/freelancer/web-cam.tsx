'use client';

import {forwardRef, useCallback, useImperativeHandle, useRef} from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export type WebCamHandle = {
  capture: () => void;
};

const WebCamComponent = forwardRef<WebCamHandle, {onCapture: (img: string) => void}>(
  ({onCapture}, ref) => {
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(() => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }, [onCapture]);

    useImperativeHandle(ref, () => ({
      capture,
    }));

    return (
      <>
        <Webcam
          audio={false}
          height={720}
          ref={webcamRef}
          screenshotFormat="image/webp"
          width={720}
          videoConstraints={videoConstraints}
        />
      </>
    );
  }
);

export default WebCamComponent;
