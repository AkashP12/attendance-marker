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
mongoose.connect(process.env.MONGO_URI, {
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
    // Use projection to fetch only needed fieldxs for attendance check
    const user = await User.findOne(
      { uniqueKey: trimmedKey },
      'name attendedAARA' // Need name for response message
    );
    
    if (!user) {
      return res.status(500).json({ 
        success: false,
        message: 'No matching user found. Please register manually as user is not registered.',
      });
    }

    // Check if user has already attended
    if (user.attendedAARA) {
      return res.status(400).json({ 
        success: false,
        message: `Attendance is already marked for ${user.name}`,        
      });
    }

    await User.findOneAndUpdate(
      { uniqueKey: trimmedKey },
      { 
        $set: {
          attendedAARA: true,
          attendanceTimestamp: new Date()
        }
      }
    );

    return res.status(200).json({ 
      success: true,
      message: `Attendance marked for ${user.name}`,        
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
