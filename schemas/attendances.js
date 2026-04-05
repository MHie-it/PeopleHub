const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {

        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },


        attendanceDate: {
            type: String,
            required: true,
        },

        checkInAt: {
            type: Date,
            default: null
        },

        checkOutAt: {
            type: Date,
            default: null
        },

        workedMs: {
            type: Number,
            default: null,
            min: [0, 'workedMs cannot be negative']
        },
        workedHours: {
            type: Number,
            default: null,
            min: [0, 'workedHours cannot be negative']
        },
    },
    { timestamps: true }
);


attendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('attendance', attendanceSchema);