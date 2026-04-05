const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },

        year: {
            type: Number,
            required: true,
            min: 2000
        },

        leaveType: {
            type: String,
            enum: ["ANNUAL", "SICK", "UNPAID", "OTHER"],
            default: "ANNUAL"
        },

        allocated: {
            type: Number,
            required: true,
            min: 0,
            default: 12
        },

        used: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        remaining: {
            type: Number,
            required: true,
            min: 0,
            default: 12
        }

    },
    { timestamps: true }
);

leaveBalanceSchema.index({ employee: 1, year: 1, leaveType: 1 }, { unique: true });

module.exports = mongoose.model("leave_balances", leaveBalanceSchema);
