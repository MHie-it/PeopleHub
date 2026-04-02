const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
            required: true,
            min: 2000
        },

        workingDays: {
            type: Number,
            default: 0,
            min: 0
        },

        leaveDays: {
            type: Number,
            default: 0,
            min: 0
        },

        lateCount: {
            type: Number,
            default: 0,
            min: 0
        },

        baseSalary: {
            type: Number,
            default: 0,
            min: 0
        },

        bonus: {
            type: Number,
            default: 0,
            min: 0
        },

        penalty: {
            type: Number,
            default: 0,
            min: 0
        },

        totalSalary: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: ["DRAFT", "CONFIRMED", "PAID"],
            default: "DRAFT"
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        note: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("payrolls", payrollSchema);
