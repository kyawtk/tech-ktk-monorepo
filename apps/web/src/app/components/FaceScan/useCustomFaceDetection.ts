import { Camera } from "@mediapipe/camera_utils";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export const useCustomFaceDetection = (props: any) => {
  const {
    mirrored,
    handleOnResults,
    faceDetection: faceDetectionInitializer,
  } = props || {};

  const [boundingBox, setBoundingBox] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const webcamRef = useRef<Webcam | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const faceDetection = useRef(faceDetectionInitializer).current;

  const onResults = useCallback(
    (results: any) => {
      if (handleOnResults) handleOnResults(results);

      const { detections } = results;

      const boundingBoxes = detections.map((detection: any) => {
        const xCenter =
          detection.boundingBox.xCenter - detection.boundingBox.width / 2;
        return {
          ...detection.boundingBox,
          yCenter:
            detection.boundingBox.yCenter - detection.boundingBox.height / 2,
          xCenter: mirrored ? 1 - xCenter : xCenter,
        };
      });

      setBoundingBox(boundingBoxes);
    },
    [handleOnResults, mirrored]
  );

  const handleFaceDetection = useCallback(async () => {
    faceDetection.setOptions({ model: "short" });
    faceDetection.onResults(onResults);

    if (webcamRef.current && webcamRef.current.video) {
      let mediaSrc = webcamRef.current.video;
      if (mediaSrc instanceof HTMLVideoElement) {
        let camera = new Camera(mediaSrc, {
          onFrame: async () => {
            await faceDetection.send({ image: mediaSrc });
            if (isLoading) setIsLoading(false);
          },
          width: 500,
          height: 500,
        });
        cameraRef.current = camera;
        cameraRef.current.start();
      }
    }
  }, [faceDetection, isLoading, onResults]);

  useEffect(() => {
    handleFaceDetection();
  }, []);

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  };
  return {
    boundingBox,
    isLoading,
    detected: boundingBox.length > 0,
    facesDetected: boundingBox.length,
    webcamRef,
    stopCamera,
    // imgRef,
  };
};

export default useCustomFaceDetection;
