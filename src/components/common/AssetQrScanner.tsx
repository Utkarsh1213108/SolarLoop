import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ScanLine, X } from 'lucide-react';

interface AssetQrScannerProps {
  onDetected: (value: string) => void;
  onClose: () => void;
}

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export const AssetQrScanner: React.FC<AssetQrScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState('Starting camera...');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.BarcodeDetector) {
        setIsSupported(false);
        setStatus('Camera QR scanning is not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        setStatus('Point the camera at an asset QR code.');
        const scan = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const results = await detector.detect(videoRef.current);
            const value = results[0]?.rawValue?.trim();
            if (value) {
              onDetected(value);
              return;
            }
          } catch {
            setStatus('Unable to read this QR code. Try again.');
          }
          if (!cancelled) window.setTimeout(scan, 250);
        };
        window.setTimeout(scan, 250);
      } catch {
        setStatus('Camera access was denied or unavailable.');
      }
    };

    startScanner();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <ScanLine className="w-4 h-4 text-teal-300" />
            <span className="text-sm font-semibold">Scan Asset QR</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close scanner" className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative aspect-[3/4] max-h-[65vh] bg-black rounded-xl overflow-hidden border border-slate-700">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-8 border-2 border-teal-300/80 rounded-xl pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-teal-300" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-teal-300" />
            </div>
            {!isSupported && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-200"><CameraOff className="w-5 h-5 mr-2" />{status}</div>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Camera className="w-4 h-4 text-teal-300 shrink-0" />
            <span>{status}</span>
          </div>
          <p className="text-[11px] text-slate-500">Use the rear camera in portrait orientation. QR values can contain an asset ID or registered asset URL.</p>
        </div>
      </div>
    </div>
  );
};
