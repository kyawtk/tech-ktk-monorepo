import FaceDetection from "@mediapipe/face_detection";
import { useEffect, useRef } from "react";

import Image from "next/image";
import Webcam from "react-webcam";
import useCustomFaceDetection from "./useCustomFaceDetection";

const FaceScanWebCam = ({
  capturedImg,
  setCapturedImg,
  handleCapture,
}: {
  capturedImg: string;
  setCapturedImg: (img: string) => void;
  handleCapture: (img: string) => void;
}) => {
  const playSound = () => {
    const audio = new Audio("/assets/facescan-beep.mp3");
    audio.play();
  };

  useEffect(() => {
    if (capturedImg) {
      playSound();
    }
  }, [capturedImg]);

  const capture = () => {
    if (webcamRef.current) {
      const img = webcamRef.current.getScreenshot();
      if (img) {
        handleCapture(img);
      }
    }
  };

  //For face Detection

  const { webcamRef, detected, stopCamera, boundingBox } =
    useCustomFaceDetection({
      faceDetectionOptions: {
        model: "short",
      },
      faceDetection: new FaceDetection.FaceDetection({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      }),
    });

  //used for accessing state in the timeout scope
  const detectedRef = useRef(detected);
  detectedRef.current = detected;

  //for auto capturing image
  useEffect(() => {
    if (detected && capturedImg == "") {
      var timeOut = setTimeout(() => {
        if (detectedRef.current == true) {
          capture();
        }
      }, 3000);
    }
    return () => {
      clearTimeout(timeOut);
    };
  }, [detected, capturedImg]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden">
        <Webcam
          ref={webcamRef}
          forceScreenshotSourceSize
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        {capturedImg && (
          <button
            className="absolute  rounded-full flex items-center justify-center p-2 outline-none border-none top-5 right-5 z-40"
            onClick={() => setCapturedImg("")}
          >
            Remove
          </button>
        )}

        {capturedImg && (
          <Image
            fill={true}
            alt="img"
            src={capturedImg}
            className="absolute w-full aspect-square z-20"
          />
        )}

        {capturedImg && (
          <p className="absolute text-white flex items-center justify-center gap-2 bottom-3 z-40 p-3 m-0 box-border left-[50%] -translate-x-[50%] bg-[rgba(0,0,0,0.2)] text-base sm:text-base   rounded-full border">
            Captured
          </p>
        )}
        {boundingBox.map((box: any, index: number) => (
          <div
            key={`${index + 1}`}
            style={{
              border: "4px solid red",
              position: "absolute",
              top: `${box.yCenter * 100}%`,
              left: `${box.xCenter * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
              zIndex: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FaceScanWebCam;
