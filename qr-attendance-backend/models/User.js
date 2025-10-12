const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // email: {
  //   type: String,
  //   // required: true
  // },
  // mobile: {
  //   type: String,
  // },
  // clubName: {
  //   type: String,
  //   required: true
  // },
  uniqueKey: {
    type: String,
    required: true,
    unique: true
  },
  attendedNEXT: {
    type: Boolean,
    default: false
  },
}, {
  versionKey: false,
  timestamps: true
});

userSchema.index({ uniqueKey: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema, 'next'); 