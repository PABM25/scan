import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ImageProcessor from './components/ImageProcessor';
import AIAssistant from './components/AIAssistant';
import { jsPDF } from "jspdf";
import { MdCameraAlt, MdCloudUpload, MdPictureAsPdf, MdHome, MdLockOutline, MdLockOpen, MdSmartToy } from 'react-icons/md';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [pages, setPages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // home, camera, processor, ai
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setCurrentView('processor');
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setCurrentView('camera');
  };

  const handleSavePage = (processedData) => {
    setPages([...pages, processedData]);
    setCapturedImage(null);
    setCurrentView('camera');
  };

  const getCombinedText = () => {
      return pages.map(p => p.text).filter(t => t).join('\n\n');
  };

  const generatePDF = () => {
    if (pages.length === 0) return null;

    const docOptions = {
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    };

    if (pdfPassword) {
        docOptions.encryption = {
            userPassword: pdfPassword,
            ownerPassword: pdfPassword,
            userPermissions: ["print", "modify", "copy", "annot-forms"]
        };
    }

    const doc = new jsPDF(docOptions);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    pages.forEach((pageData, index) => {
      if (index > 0) doc.addPage();
      doc.addImage(pageData.image, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
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

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/upload';

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Uploaded to cloud! URL: ${data.url}`);
        setPages([]);
        setPdfPassword('');
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

  const hasOcrText = pages.some(p => p.text && p.text.trim().length > 0);

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
                    <img src={pages[0].image} alt="Thumbnail" className="w-full h-full object-cover" />
                    {pages.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        {pages.length}
                      </div>
                    )}
                 </div>

                 <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-800">Unsaved Document</h2>
                    <button
                       onClick={() => setShowPasswordDialog(true)}
                       className={`p-1 rounded-full ${pdfPassword ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                       title={pdfPassword ? "Protected" : "Add Password"}
                    >
                       {pdfPassword ? <MdLockOutline size={18} /> : <MdLockOpen size={18} />}
                    </button>
                 </div>

                 <p className="text-sm text-gray-500 mb-4">{new Date().toLocaleDateString()}</p>

                 <div className="flex space-x-2 w-full mb-2">
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
                 <div className="flex space-x-2 w-full">
                     <button
                        onClick={() => setCurrentView('ai')}
                        disabled={!hasOcrText}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition ${hasOcrText ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400'}`}
                     >
                        <MdSmartToy /> Ask AI
                     </button>
                     <button
                        onClick={handleCloudUpload}
                        disabled={isUploading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1 disabled:opacity-50"
                     >
                       <MdCloudUpload /> {isUploading ? 'Uploading...' : 'Cloud'}
                     </button>
                 </div>
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

          {/* Password Dialog */}
          {showPasswordDialog && (
            <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
                  <h3 className="text-lg font-bold mb-2">Protect PDF</h3>
                  <p className="text-sm text-gray-600 mb-4">Add a password to encrypt this document before exporting or uploading.</p>
                  <input
                    type="text"
                    placeholder="Enter password..."
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                     <button onClick={() => {setPdfPassword(''); setShowPasswordDialog(false);}} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Remove</button>
                     <button onClick={() => setShowPasswordDialog(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Done</button>
                  </div>
               </div>
            </div>
          )}
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

      {/* AI View */}
      {currentView === 'ai' && (
          <AIAssistant
             documentText={getCombinedText()}
             onClose={() => setCurrentView('home')}
          />
      )}

    </div>
  );
}

export default App;
