import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { MdPhotoLibrary, MdClose } from 'react-icons/md';

const videoConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  facingMode: "environment"
};

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-grow relative overflow-hidden bg-black flex items-center justify-center">
        {/* Semi-transparent overlay to hint at document shape */}
        <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black border-opacity-30 flex items-center justify-center">
            <div className="w-full h-full border-2 border-white border-opacity-50 rounded"></div>
        </div>

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="bg-black py-6 px-8 flex justify-between items-center pb-safe-bottom">
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-white flex flex-col items-center opacity-80 hover:opacity-100"
        >
          <MdPhotoLibrary size={28} />
          <span className="text-xs mt-1">Photos</span>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          onClick={capture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:bg-gray-800 transition"
        >
          <div className="w-16 h-16 bg-white rounded-full transition-transform transform hover:scale-95"></div>
        </button>

        <div className="w-12 h-12 flex flex-col items-center justify-center opacity-0 pointer-events-none">
          {/* Spacer */}
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;
