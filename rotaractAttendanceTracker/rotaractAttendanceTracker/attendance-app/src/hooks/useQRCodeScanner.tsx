
import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';

export interface UseHtml5QrcodeOptions extends Html5QrcodeCameraScanConfig {
  elementId: string;
  onScanSuccess?: (decodedText: string) => void;
  event: string;
}

export interface Attendance {
  pranaliId: string;
  name: string;
  designation: string;
  clubName: string;
  event: string;
}

export interface UseHtml5QrcodeReturn {
  startCameraScan: (deviceId?: string) => Promise<void>;
  stopCameraScan: () => Promise<void>;
  scanFile: (file: File) => Promise<string>;
  listCameras: () => Promise<CameraDeviceInfo[]>;
  isScanning: boolean;
}

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export function useHtml5Qrcode(options: UseHtml5QrcodeOptions): UseHtml5QrcodeReturn {
  const { elementId, ...config } = options;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const eventRef = useRef(options.event); // 👈 track event in ref
  const [isScanning, setIsScanning] = useState(false);

  // 👇 update ref when event prop changes
  useEffect(() => {
    eventRef.current = options.event;
  }, [options.event]);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(elementId);
    return () => {
      scannerRef.current
        ?.stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current?.clear();
        });
    };
  }, [elementId]);

  const sendAttendanceData = async (attendanceData: Attendance) => {
    try {
          console.log('Sending attendance data:', attendanceData);

      const response = await fetch('http://localhost:8080/api/markAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Attendance recorded successfully');
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error sending attendance data:', error);
      alert('Network or server error. Please try again.');
    }
  };

  const listCameras = useCallback(async (): Promise<CameraDeviceInfo[]> => {
    const raw = await Html5Qrcode.getCameras();
    return raw.map((c) => ({
      deviceId: c.id,
      label: c.label,
    }));
  }, []);

//   const startCameraScan = useCallback(
//     async (deviceId?: string) => {
//       if (!scannerRef.current) throw new Error('QR Scanner not initialized');
//       if (isScanning) return;

//       setIsScanning(true);

//       const cameraConfig = deviceId
//         ? { deviceId: { exact: deviceId } }
//         : { facingMode: 'environment' };

//       await scannerRef.current.start(
//         cameraConfig,
//         config,
//         (decodedText) => {
//           console.log('QR Code Scanned:', decodedText);
//           options.onScanSuccess?.(decodedText);

//           try {
//             const parsed = JSON.parse(decodedText);
//             const attendanceData: Attendance = {
//               pranaliId: parsed.pranaliId,
//               name: parsed.name,
//               designation: parsed.designation,
//               clubName: parsed.clubName,
//               event: eventRef.current, // 👈 dynamic event value
//             };

//             sendAttendanceData(attendanceData);
//           } catch (err) {
//             console.error('Invalid QR format:', err);
//             alert('Invalid QR code format. Expected JSON.');
//           }
//         },
//         (errorMessage) => {
//           console.warn('QR Code Scan Error:', errorMessage);
//         }
//       );
//     },
//     [config, isScanning, options] // no dependency on event anymore
//   );

// const startCameraScan = useCallback(
//   async (deviceId?: string) => {
//     if (!scannerRef.current) throw new Error('QR Scanner not initialized');
//     if (isScanning) return;

//     setIsScanning(true);

//     const cameraConfig = deviceId
//       ? { deviceId: { exact: deviceId } }
//       : { facingMode: 'environment' };

//     await scannerRef.current.start(
//       cameraConfig,
//       config,
//       (decodedText) => {
//         console.log('QR Code Scanned:', decodedText);
//         options.onScanSuccess?.(decodedText);

//         try {
//           const parsed = JSON.parse(decodedText);

//           // Use exact keys as in your QR code JSON:
//           const pranaliId = parsed.PranaliID;
//           const name = parsed.Name;
//           const designation = parsed.Designation;
//           const clubName = parsed.ClubName;

//           if (!pranaliId || !name || !designation || !clubName) {
//             console.error('Missing fields in QR:', parsed);
//             alert('Invalid QR Code. Missing required fields.');
//             return;
//           }

//           const attendanceData: Attendance = {
//             pranaliId,
//             name,
//             designation,
//             clubName,
//             event: eventRef.current,
//           };

//           console.log('✅ Parsed Attendance:', attendanceData);
//           sendAttendanceData(attendanceData);
//         } catch (err) {
//           console.error('❌ Invalid JSON in QR code:', err);
//           alert('Invalid QR code format. Expected JSON.');
//         }
//       },
//       (errorMessage) => {
//         console.warn('QR Code Scan Error:', errorMessage);
//       }
//     );
//   },
//   [config, isScanning, options]
// );


  // const stopCameraScan = useCallback(async () => {
  //   if (!scannerRef.current || !isScanning) return;
  //   await scannerRef.current.stop();
  //   scannerRef.current.clear();
  //   setIsScanning(false);
  // }, [isScanning]);

  const startCameraScan = useCallback(
    async (deviceId?: string) => {
      if (isScanning) return;
  
      // ✅ Always re-initialize the scanner if it's null (after stop)
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }
  
      setIsScanning(true);
  
      const cameraConfig = deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: 'environment' };
  
      await scannerRef.current.start(
        cameraConfig,
        config,
        (decodedText) => {
          console.log('QR Code Scanned:', decodedText);
          options.onScanSuccess?.(decodedText);
  
          try {
            const parsed = JSON.parse(decodedText);
  
            const pranaliId = parsed.PranaliID;
            const name = parsed.Name;
            const designation = parsed.Designation;
            const clubName = parsed.ClubName;
  
            if (!pranaliId || !name || !designation || !clubName) {
              console.error('Missing fields in QR:', parsed);
              alert('Invalid QR Code. Missing required fields.');
              return;
            }
  
            const attendanceData: Attendance = {
              pranaliId,
              name,
              designation,
              clubName,
              event: eventRef.current,
            };
  
            console.log('✅ Parsed Attendance:', attendanceData);
            sendAttendanceData(attendanceData);
          } catch (err) {
            console.error('❌ Invalid JSON in QR code:', err);
            alert('Invalid QR code format. Expected JSON.');
          }
        },
        (errorMessage) => {
          console.warn('QR Code Scan Error:', errorMessage);
        }
      );
    },
    [config, isScanning, options, elementId]
  );

  const stopCameraScan = useCallback(async () => {
    if (!scannerRef.current || !isScanning) return;
  
    await scannerRef.current.stop();
    await scannerRef.current.clear();
  
    // ✅ Fully reset the scanner reference
    scannerRef.current = null;
  
    setIsScanning(false);
  }, [isScanning]);
  

  const scanFile = useCallback(async (file: File): Promise<string> => {
    if (!scannerRef.current) throw new Error('QR Scanner not initialized');
    const result = await scannerRef.current.scanFile(file, true);
    return result;
  }, []);

  return {
    startCameraScan,
    stopCameraScan,
    scanFile,
    listCameras,
    isScanning,
  };
}