const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    code: { 
        type: String, 
        required: true, 
        unique: true, trim: true, 
        uppercase: true },
    name: { 
        type: String, 
        required: true, 
        trim: true },
    startTime: { 
        type: String, 
        equired: true }, 
    endTime: { 
        type: String, 
        required: true },
    isNight: { 
        type: Boolean, 
        default: false },
    isDeleted: { 
        type: Boolean, 
        default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('shifts', shiftSchema);