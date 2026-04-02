const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },

        leaveType: {
            type: String,
            enum: ["ANNUAL", "SICK", "UNPAID", "OTHER"],
            required: true
        },

        fromDate: {
            type: Date,
            required: true
        },

        toDate: {
            type: Date,
            required: true
        },

        totalDays: {
            type: Number,
            min: 0,
            default: 0
        },

        reason: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "REJECTED_MANAGER",
                "APPROVED_MANAGER",
                "PENDING_HR",
                "REJECTED_HR",
                "APPROVED"
            ],
            default: "PENDING"
        },

        managerActionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        },

        managerActionAt: {
            type: Date,
            default: null
        },

        managerNote: {
            type: String,
            default: ""
        },

        hrActionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        },

        hrActionAt: {
            type: Date,
            default: null
        },

        hrNote: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("leave_requests", leaveRequestSchema);
