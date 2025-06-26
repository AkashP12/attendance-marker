const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Attendance = require('./models/Attendance');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

// API Route to handle QR scans
app.post('/api/scan', async (req, res) => {
  const { rawData } = req.body;

  if (!rawData) return res.status(400).json({ message: 'No QR data provided' });

  const [userId, name] = rawData.split('|').map(x => x.trim());

  if (!userId || !name) {
    return res.status(400).json({ message: 'Invalid QR format. Use "ID|Name"' });
  }

  try {
    // Avoid duplicate entries
    const existing = await Attendance.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: `Attendance already marked for ${existing.name}` });
    }

    const newEntry = new Attendance({ userId, name });
    await newEntry.save();

    return res.json({ message: `✅ Attendance marked for ${name}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
