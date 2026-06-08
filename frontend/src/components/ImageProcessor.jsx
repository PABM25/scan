import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MdCheck, MdClose, MdCrop, MdColorLens } from 'react-icons/md';

function ImageProcessor({ imageSrc, onCancel, onSave }) {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [filter, setFilter] = useState('none');
  const [activeTab, setActiveTab] = useState('crop'); // crop, filter
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const onImageLoad = (e) => {
    const initialCrop = {
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    // Safety check for empty crop
    if (crop.width === 0 || crop.height === 0) return;

    const cropWidthInPixels = (crop.width / 100) * image.naturalWidth;
    const cropHeightInPixels = (crop.height / 100) * image.naturalHeight;
    const cropXInPixels = (crop.x / 100) * image.naturalWidth;
    const cropYInPixels = (crop.y / 100) * image.naturalHeight;

    canvas.width = cropWidthInPixels * pixelRatio;
    canvas.height = cropHeightInPixels * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      cropXInPixels,
      cropYInPixels,
      cropWidthInPixels,
      cropHeightInPixels,
      0,
      0,
      cropWidthInPixels,
      cropHeightInPixels
    );

    // Apply filters
    if (filter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (filter === 'grayscale') {
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        } else if (filter === 'bw') {
          // enhance contrast for document scan
          const factor = (259 * (128 + 255)) / (255 * (259 - 128));
          let val = factor * (avg - 128) + 128;
          val = val > 150 ? 255 : (val < 100 ? 0 : val);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [completedCrop, filter]);

  const handleSave = () => {
    if (!previewCanvasRef.current) return;
    const base64Image = previewCanvasRef.current.toDataURL('image/jpeg', 0.85);
    onSave(base64Image);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-[#2d2d2d] shadow-md z-10">
        <button onClick={onCancel} className="text-white opacity-80 hover:opacity-100 p-1">
          <span className="text-lg">Cancel</span>
        </button>
        <button onClick={handleSave} className="text-blue-400 font-semibold text-lg p-1">
          Keep Scan
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-grow overflow-hidden flex justify-center items-center p-4 relative">
        <div className={`transition-opacity duration-300 ${activeTab === 'crop' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute pointer-events-none'}`}>
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            className="max-h-[70vh]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Captured"
              onLoad={onImageLoad}
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </ReactCrop>
        </div>

        {/* Filter Preview */}
        <div className={`transition-opacity duration-300 w-full h-full flex items-center justify-center ${activeTab === 'filter' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute pointer-events-none'}`}>
             <img src={previewCanvasRef.current ? previewCanvasRef.current.toDataURL() : imageSrc} alt="Preview" style={{ maxHeight: '70vh', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="hidden">
        <canvas ref={previewCanvasRef} />
      </div>

      {/* Filter Options (shows when activeTab is filter) */}
      {activeTab === 'filter' && (
        <div className="bg-[#2d2d2d] p-4 flex justify-center space-x-6 overflow-x-auto border-b border-gray-700">
           {['none', 'grayscale', 'bw'].map((f) => (
             <div
               key={f}
               onClick={() => setFilter(f)}
               className="flex flex-col items-center cursor-pointer"
             >
               <div className={`w-12 h-12 rounded-full border-2 mb-1 flex items-center justify-center bg-gray-600 overflow-hidden ${filter === f ? 'border-blue-500' : 'border-transparent'}`}>
                  <span className="text-xs uppercase">{f === 'none' ? 'Orig' : f === 'grayscale' ? 'Gray' : 'B&W'}</span>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* Bottom Tool Bar */}
      <div className="bg-[#1e1e1e] py-4 px-6 flex justify-around items-center border-t border-gray-800 pb-safe-bottom">
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex flex-col items-center ${activeTab === 'crop' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          <MdCrop size={24} />
          <span className="text-[10px] mt-1 uppercase tracking-wide">Crop</span>
        </button>
        <button
          onClick={() => setActiveTab('filter')}
          className={`flex flex-col items-center ${activeTab === 'filter' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
          <MdColorLens size={24} />
          <span className="text-[10px] mt-1 uppercase tracking-wide">Color</span>
        </button>
      </div>
    </div>
  );
}

export default ImageProcessor;
