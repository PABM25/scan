import React, { useState } from 'react';
import { MdFingerprint, MdFace } from 'react-icons/md';

function BiometricLogin({ onLogin }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError('');

    try {
        // In a real production app we would use the Web Authentication API (WebAuthn)
        // const credential = await navigator.credentials.get({ publicKey: {...} });

        // For demonstration, we simulate the biometric prompt delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate success
        onLogin();
    } catch (err) {
        setError("Biometric authentication failed or is not supported on this device.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ProScanner</h1>
            <p className="text-gray-400">Secure Document Vault</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-80">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 text-blue-400">
               <MdFingerprint size={56} />
            </div>

            <h2 className="text-xl font-semibold mb-6">Unlock Application</h2>

            <button
               onClick={handleAuthenticate}
               disabled={isLoading}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2"
            >
               {isLoading ? (
                   <span className="animate-pulse">Verifying...</span>
               ) : (
                   <>Use Touch ID / Face ID</>
               )}
            </button>

            {error && (
                <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
            )}
        </div>

        <p className="absolute bottom-8 text-xs text-gray-500">
            Protected by Advanced Biometric Security
        </p>
    </div>
  );
}

export default BiometricLogin;
