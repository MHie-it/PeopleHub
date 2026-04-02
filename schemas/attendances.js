const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        // In phase này: employeeId = userId
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        // YYYY-MM-DD theo giờ máy (server local)
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

// 1 user chỉ 1 record/ngày (để chống double check-in cùng lúc)
attendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('attendance', attendanceSchema);