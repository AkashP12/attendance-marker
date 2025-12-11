const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');

dotenv.config();
console.log('🔐 MONGO_URI:', process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb+srv://ayushjain1141:rECmappD1r9YYyjG@cluster0.szyqg71.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  dbName: 'rotaract' // Specify the database name
})
  .then(() => console.log('✅ MongoDB connected to rotaract database'))
  .catch((err) => console.error('❌ MongoDB error:', err));

app.post('/api/scan', async (req, res) => {
  const { uniqueKey } = req.body;

  if (!uniqueKey) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid QR. Please check the QR or register manually.' 
    });
  }

  const trimmedKey = uniqueKey.trim();

  if (!trimmedKey) {
    return res.status(500).json({ 
      success: false,
      message: 'Invalid QR. Please check the QR or register manually.' 
    });
  }

  try {
    // Get current date in IST (Indian Standard Time - UTC+5:30)
    const now = new Date();
    // Convert to IST timezone using Asia/Kolkata
    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric'
    });
    const dayOfMonth = parseInt(istFormatter.format(now), 10);
    const is13th = dayOfMonth === 13;
    
    // Determine which field to check and update based on date
    const attendanceField = is13th ? 'attendedRiseDay1' : 'attendedRiseDay2';
    const dayLabel = is13th ? 'RISE Day 1' : 'RISE Day 2';
    
    // Use projection to fetch only needed fields for attendance check
    const user = await User.findOne(
      { uniqueKey: trimmedKey },
      `name ${attendanceField}` // Dynamically select the correct field
    );
    
    if (!user) {
      return res.status(500).json({ 
        success: false,
        message: 'No matching user found. Please register manually as user is not registered.',
      });
    }

    // Check if user has already attended for the current day
    if (user[attendanceField]) {
      return res.status(400).json({ 
        success: false,
        message: `Attendance for ${dayLabel} is already marked for ${user.name}`,        
      });
    }

    // Mark attendance for the appropriate day
    await User.findOneAndUpdate(
      { uniqueKey: trimmedKey },
      { 
        $set: {
          [attendanceField]: true,
        }
      }
    );

    return res.status(200).json({ 
      success: true,
      message: `${dayLabel} attendance marked for ${user.name}`,        
    });

  } catch (error) {
    console.error('Error processing attendance:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error occurred while processing attendance. Please contact Team IT.' 
    });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
