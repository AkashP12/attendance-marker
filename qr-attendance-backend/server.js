const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Attendance = require('./models/Attendance');

dotenv.config();
console.log('🔐 MONGO_URI:', process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// API Route to handle QR scans
app.post('/api/scan', async (req, res) => {
  const { rawData } = req.body;

  if (!rawData) return res.status(400).json({ message: 'No QR data provided' });

  const userId = rawData.trim();

  if (!userId) {
    return res.status(400).json({ message: 'Invalid QR data' });
  }

  try {
    // Check if attendance already exists
    const existing = await Attendance.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: `Attendance already marked` });
    }

    const newEntry = new Attendance({ userId, name: userId }); // name = userId as placeholder
    await newEntry.save();

    return res.json({ message: `✅ Attendance marked` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
