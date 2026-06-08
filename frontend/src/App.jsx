import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ImageProcessor from './components/ImageProcessor';
import { jsPDF } from "jspdf";
import { MdCameraAlt, MdCloudUpload, MdPictureAsPdf, MdHome } from 'react-icons/md';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [pages, setPages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // home, camera, processor

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setCurrentView('processor');
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setCurrentView('camera');
  };

  const handleSavePage = (processedImage) => {
    setPages([...pages, processedImage]);
    setCapturedImage(null);
    setCurrentView('camera'); // Return to camera to scan next page like Adobe Scan
  };

  const generatePDF = () => {
    if (pages.length === 0) return null;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    pages.forEach((pageData, index) => {
      if (index > 0) doc.addPage();
      doc.addImage(pageData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
    });

    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();
    if (doc) doc.save('document.pdf');
  };

  const handleCloudUpload = async () => {
    const doc = generatePDF();
    if (!doc) return;

    setIsUploading(true);
    try {
      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append('document', pdfBlob, `scan-${Date.now()}.pdf`);

      // Using relative URL or env var to support access from mobile devices on local network
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/upload';

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Uploaded to cloud! URL: ${data.url}`);
        setPages([]);
        setCurrentView('home');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error connecting to cloud.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full mx-auto md:max-w-md shadow-lg overflow-hidden relative">

      {/* Home View */}
      {currentView === 'home' && (
        <div className="flex flex-col h-full absolute inset-0 bg-gray-50">
          <header className="bg-white text-gray-800 p-4 shadow-sm flex justify-between items-center z-10 sticky top-0">
            <h1 className="text-xl font-bold tracking-tight">Recent Scans</h1>
          </header>

          <main className="flex-grow overflow-auto p-4 flex flex-col">
            {pages.length > 0 ? (
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col items-center">
                 <div className="relative w-32 h-40 mb-3 shadow-md rounded overflow-hidden">
                    <img src={pages[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                    {pages.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        {pages.length}
                      </div>
                    )}
                 </div>
                 <h2 className="font-semibold text-gray-800">Unsaved Document</h2>
                 <p className="text-sm text-gray-500 mb-4">{new Date().toLocaleDateString()}</p>
                 <div className="flex space-x-2 w-full">
                   <button
                      onClick={() => setCurrentView('camera')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                   >
                     Add Pages
                   </button>
                   <button
                      onClick={handleExportPDF}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                   >
                     <MdPictureAsPdf /> PDF
                   </button>
                 </div>
                 <button
                    onClick={handleCloudUpload}
                    disabled={isUploading}
                    className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1"
                 >
                   <MdCloudUpload /> {isUploading ? 'Uploading...' : 'Save to Cloud'}
                 </button>
               </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                <MdPictureAsPdf size={48} className="mb-4 opacity-50" />
                <p>No scans yet.</p>
                <p className="text-sm">Tap the camera button to start.</p>
              </div>
            )}
          </main>

          {/* Floating Action Button */}
          <button
            onClick={() => setCurrentView('camera')}
            className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-105"
          >
            <MdCameraAlt size={28} />
          </button>
        </div>
      )}

      {/* Camera View */}
      {currentView === 'camera' && (
        <div className="flex flex-col h-full absolute inset-0 bg-black z-20">
           {pages.length > 0 && (
             <div className="absolute top-safe left-0 right-0 p-4 flex justify-between items-center z-30 text-white">
               <button onClick={() => setCurrentView('home')} className="p-2 bg-black bg-opacity-50 rounded-full">
                 <MdHome size={24} />
               </button>
               <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                 {pages.length} page{pages.length !== 1 ? 's' : ''}
               </span>
             </div>
           )}
           <div className="flex-grow">
              <CameraCapture onCapture={handleCapture} />
           </div>
        </div>
      )}

      {/* Processor View */}
      {currentView === 'processor' && (
        <div className="absolute inset-0 z-30 bg-black flex flex-col h-full w-full">
          <ImageProcessor
            imageSrc={capturedImage}
            onCancel={handleCancel}
            onSave={handleSavePage}
          />
        </div>
      )}

    </div>
  );
}

export default App;
