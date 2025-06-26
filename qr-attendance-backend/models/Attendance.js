const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: String,
  name: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

attendanceSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
