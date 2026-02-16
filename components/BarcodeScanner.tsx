import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, XCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerRegionId = 'html5qr-code-full-region';

  useEffect(() => {
    if (isScanning) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!document.getElementById(scannerRegionId)) return;

        scannerRef.current = new Html5QrcodeScanner(
          scannerRegionId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            // Optionally pause scanning after success to prevent multiple triggers
            if (scannerRef.current) {
              scannerRef.current.pause(true);
              setIsScanning(false);
            }
          },
          (errorMessage) => {
            // ignore errors during scanning
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [isScanning, onScanSuccess]);

  const handleRestart = () => {
    setIsScanning(true);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-md relative">
      {!isScanning && (
        <div className="absolute inset-0 z-10 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center text-white">
          <p className="mb-4 font-medium">Scanner Paused</p>
          <button 
            onClick={handleRestart}
            className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
          >
            <Camera size={20} />
            Scan Lagi
          </button>
        </div>
      )}
      <div id={scannerRegionId} className="w-full"></div>
      <div className="bg-gray-800 text-gray-400 text-xs p-2 text-center">
        Arahkan kamera ke barcode produk
      </div>
    </div>
  );
};

export default BarcodeScanner;
