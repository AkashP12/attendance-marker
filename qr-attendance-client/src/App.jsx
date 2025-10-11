import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import './App.css';

function App() {
  const [scanResult, setScanResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraMode, setCameraMode] = useState('environment'); // 'environment' or 'user'

  const handleScan = async (data) => {
    if (data?.text) {
      setScanning(false);
      setScanResult(`✅ Scanned: ${data.text}`);
      setTimeout(() => setScanResult(''), 5000); // auto-clear in 5 seconds

      try {
        const res = await axios.post('https://attendance-marker-vwvg.onrender.com/api/scan', {
          uniqueKey: data.text,
        });
        alert(res.data.message);
        setScanResult(`✅ ${res.data.message}`);
      } catch (err) {
        const msg = err.response?.data?.message || '❌ Error scanning';
        setScanResult(`❌ ${msg}`);
        alert(msg);
        setTimeout(() => setScanResult(''), 5000); // auto-clear in 5 seconds
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    alert('Camera Error');
  };

  return (
    <div className="container">
      <h1>NEXT The conclave</h1>

      <div className="card">
        <h2>Place the QR in front of the camera</h2>

        {scanning ? (
          <QrScanner
          delay={300}
          onScan={handleScan}
          onError={handleError}
          style={{ width: '100%' }}
          constraints={{
            video: { facingMode: { exact: 'environment' } }
          }}
        />
        
        ) : (
          <div className="camera-placeholder">Camera Off</div>
        )}

        <div className="button-group">
          <button onClick={() => setScanning(true)} disabled={scanning}>Start Scan</button>
          <button onClick={() => setScanning(false)} disabled={!scanning}>Stop Scan</button>
        </div>

        <p className={`scan-status ${scanResult.includes('❌') ? 'error' : ''}`}>{scanResult}</p>
      </div>  

      <footer className="footer">
        <p>An initiative by Team IT 2025-26</p>
      </footer>
    </div>
  );
}

export default App;
