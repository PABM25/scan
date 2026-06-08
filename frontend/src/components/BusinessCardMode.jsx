import React, { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdEmail, MdPhone, MdBusiness } from 'react-icons/md';

function BusinessCardMode({ text, onClose }) {
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    // Very basic mock extraction from OCR text
    if (!text) return;

    const lines = text.split('\n');
    let info = { ...contactInfo };

    // Find email
    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    if (emailMatch) info.email = emailMatch[0];

    // Find phone
    const phoneMatch = text.match(/(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (phoneMatch) info.phone = phoneMatch[0];

    // Assume first non-empty line might be a name or company, let's just pick something for mock
    const validLines = lines.filter(l => l.trim().length > 2);
    if (validLines.length > 0) info.name = validLines[0].trim();
    if (validLines.length > 1) info.company = validLines[1].trim();

    setContactInfo(info);
  }, [text]);

  const handleSaveContact = () => {
    // In a real app, this would use a Web API or native plugin to save to the device's contacts
    alert(`Contact saved!\n\nName: ${contactInfo.name}\nEmail: ${contactInfo.email}\nPhone: ${contactInfo.phone}`);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">Business Card Extracted</h2>
          <button onClick={onClose}><MdClose size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><MdPerson size={20}/></div>
             <input type="text" value={contactInfo.name} onChange={e => setContactInfo({...contactInfo, name: e.target.value})} className="border-b border-gray-300 w-full focus:outline-none focus:border-blue-500 py-1" placeholder="Name" />
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-green-100 text-green-600 p-2 rounded-full"><MdBusiness size={20}/></div>
             <input type="text" value={contactInfo.company} onChange={e => setContactInfo({...contactInfo, company: e.target.value})} className="border-b border-gray-300 w-full focus:outline-none focus:border-blue-500 py-1" placeholder="Company" />
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full"><MdEmail size={20}/></div>
             <input type="email" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} className="border-b border-gray-300 w-full focus:outline-none focus:border-blue-500 py-1" placeholder="Email" />
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-purple-100 text-purple-600 p-2 rounded-full"><MdPhone size={20}/></div>
             <input type="tel" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} className="border-b border-gray-300 w-full focus:outline-none focus:border-blue-500 py-1" placeholder="Phone" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-2">
           <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
           <button onClick={handleSaveContact} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700">Save to Contacts</button>
        </div>
      </div>
    </div>
  );
}

export default BusinessCardMode;
