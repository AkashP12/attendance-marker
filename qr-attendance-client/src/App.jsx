import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import './App.css';

function App() {
  const [scanResult, setScanResult] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async (data) => {
    if (data?.text) {
      setScanning(false);
      setScanResult(`✅ Scanned: ${data.text}`);
      setTimeout(() => setScanResult(''), 5000); // auto-clear in 5 seconds

      try {
        const res = await axios.post('https://attendance-marker-vwvg.onrender.com/api/scan', {
          rawData: data.text,
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
      <h1>🎯 QR Attendance Marker</h1>

      <div className="card">
        <h2>📷 Camera Scanner</h2>

        {scanning ? (
          <QrScanner
            delay={300}
            onScan={handleScan}
            onError={handleError}
            style={{ width: '100%' }}
          />
        ) : (
          <div className="camera-placeholder">Camera Off</div>
        )}

        <div className="button-group">
          <button onClick={() => setScanning(true)} disabled
