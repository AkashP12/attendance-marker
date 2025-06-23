
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHtml5Qrcode } from '@/hooks/useQRCodeScanner';

interface CameraDevice {
  id: string;
  label: string;
}

const sessionOptions = [
  'Day 1 First Session',
  'Day 1 Post Lunch',
  'Day 1 Post Tea',
  'Day 2 First Session',
  'Day 2 Post Lunch',
  'Day 2 Post Tea',
  'Day 3 First Session',
  'Day 3 Post Lunch',
];

export default function QRScannerPage() {
  const [selectedSession, setSelectedSession] = useState('Day 1 First Session');
  //const [scanResult, setScanResult] = useState<string | null>(null);
  const [, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const {
    listCameras,
    startCameraScan,
    stopCameraScan,
    //scanFile,
    isScanning,
  } = useHtml5Qrcode({
    elementId: 'qr-reader',
    fps: 10,
    qrbox: { width: 250, height: 250 },
    event: selectedSession, // ✅ dynamically updated
    // onScanSuccess: (decodedText) => {
    //   setScanResult(`Welcome Rtr. ${decodedText} for ${selectedSession}`);
    // },
  });

  // useEffect(() => {
  //   async function fetchDevicesAndStart() {
  //     try {
  //       const cams = await listCameras();
  //       setDevices(cams.map((c) => ({ id: c.deviceId, label: c.label || c.deviceId })));

  //       if (cams.length > 0) {
  //         setSelectedDeviceId(cams[0].deviceId);
  //         await startCameraScan(cams[0].deviceId);
  //       }
  //     } catch (err) {
  //       console.error('Failed to init camera', err);
  //     }
  //   }

  //   fetchDevicesAndStart();
  //   return () => {
  //     stopCameraScan();
  //   };
  // }, []);
  useEffect(() => {
    async function fetchDevices() {
      try {
        const cams = await listCameras();
        setDevices(cams.map((c) => ({ id: c.deviceId, label: c.label || c.deviceId })));
  
        if (cams.length > 0) {
          setSelectedDeviceId(cams[0].deviceId);
          // ⛔ Don't auto-start scanning here anymore
        }
      } catch (err) {
        console.error('Failed to list cameras', err);
      }
    }
  
    fetchDevices();
  
    // ⛔ Only clean up on unmount
    return () => {
      stopCameraScan();
    };
  }, [listCameras, stopCameraScan]);
  
  

//   const handleStart = async () => {
//   if (selectedDeviceId) {
//     await startCameraScan(selectedDeviceId);
//   }
// };

    // const handleStart = async () => {
    //   if (selectedDeviceId) {
    //     await startCameraScan(selectedDeviceId);
    //   }
    // };

    const handleStop = async () => {
      try {
        if (isScanning) {
          await stopCameraScan();
        }
      } catch (err) {
        console.error("Failed to stop camera scan:", err);
      }
    };
    
    const handleStart = async () => {
      try {
        if (selectedDeviceId && !isScanning) {
          await startCameraScan(selectedDeviceId);
        }
      } catch (err) {
        console.error("Failed to start camera scan again:", err);
      }
    };
    



  // const handleUploadQR = () => {
  //   const fileInput = document.createElement('input');
  //   fileInput.type = 'file';
  //   fileInput.accept = 'image/*';
  //   fileInput.onchange = async () => {
  //     if (fileInput.files?.[0]) {
  //       try {
  //         const result = await scanFile(fileInput.files[0]);
  //         // setScanResult(`Welcome Rtr. ${result} for ${selectedSession}`);
  //       } catch (err) {
  //         alert('QR scan failed: ' + err);
  //       }
  //     }
  //   };
  //   fileInput.click();
  // };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      <header className="bg-blue-600 text-white p-4 text-center shadow">
        <h1 className="text-2xl font-semibold">Welcome to Lead Summit 25</h1>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md space-y-4">
          {/* Dropdown */}
          <div>
            <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
              Select Session
            </label>
            <select
              id="session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {sessionOptions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          {/* QR Scanner */}
          <Card className="w-full p-4 space-y-4 text-center">
            <div className="relative w-[320px] h-[320px] rounded-lg overflow-hidden bg-black mx-auto">
              <div id="qr-reader" className="w-full h-full" />
              {/* Scan box overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[250px] h-[250px] border-4 border-green-500 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Controls */}
            {/* <div className="flex justify-center gap-2 mt-2">
              <Button onClick={handleStop} disabled={!isScanning}>
                Stop Scan
              </Button>
              
            </div> */}
            {/* Controls */}
            {/* Controls */}
            <div className="flex justify-center gap-2 mt-2">
              {isScanning ? (
                <Button onClick={handleStop}>
                  Stop Scan
                </Button>
              ) : (
                <Button onClick={handleStart}>
                  Start Scan
                </Button>
              )}
            </div>




            {scanResult && (
              <Card className="bg-green-50 text-center p-3 border border-green-500 mt-4">
                <p className="text-green-800 font-semibold">{scanResult}</p>
              </Card>
            )}
          </Card>
        </div>
      </main>

      <footer className="bg-gray-100 text-center py-3 text-xs text-gray-500">
        © Initiative by Team Information Technology 2025-26
      </footer>
    </div>
  );
}

