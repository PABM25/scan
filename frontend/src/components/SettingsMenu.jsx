import React, { useState } from 'react';
import { MdClose, MdSettings, MdStorage, MdPictureAsPdf, MdTextSnippet } from 'react-icons/md';

function SettingsMenu({ onClose, pdfQuality, setPdfQuality, isPdfA, setIsPdfA }) {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-end justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-sm rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl h-[80vh] flex flex-col transform transition-transform duration-300">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="font-bold text-xl flex items-center gap-2"><MdSettings className="text-gray-600" /> Settings & Export Options</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><MdClose size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-8">

            <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><MdStorage /> Storage Optimization</h3>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">PDF Compression Quality</span>
                            <span className="text-gray-500 text-sm">{Math.round(pdfQuality * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={pdfQuality}
                            onChange={(e) => setPdfQuality(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lower quality reduces file size drastically for email/messaging.</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium">Smart Local Offloading</p>
                            <p className="text-xs text-gray-500">Auto-delete local files after cloud sync</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600 cursor-pointer">
                            <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform transform translate-x-6"></span>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><MdPictureAsPdf /> Advanced Export</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-800">Export as PDF/A</p>
                            <p className="text-xs text-gray-500">Long-term archival standard</p>
                        </div>
                        <input type="checkbox" checked={isPdfA} onChange={(e) => setIsPdfA(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </div>

                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded text-blue-600"><MdTextSnippet size={20} /></div>
                            <div className="text-left">
                                <p className="font-medium text-gray-800">Export to MS Word</p>
                                <p className="text-xs text-gray-500">Requires Cloud Processing</p>
                            </div>
                        </div>
                        <span className="text-blue-600 font-medium text-sm">PRO</span>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded text-green-600"><MdTextSnippet size={20} /></div>
                            <div className="text-left">
                                <p className="font-medium text-gray-800">Export to MS Excel</p>
                                <p className="text-xs text-gray-500">Requires Cloud Processing</p>
                            </div>
                        </div>
                        <span className="text-blue-600 font-medium text-sm">PRO</span>
                    </button>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
