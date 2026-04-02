const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },

        contractNo: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        contractType: {
            type: String,
            enum: ["PROBATION", "FIXED_TERM", "INDEFINITE", "PART_TIME", "INTERN"],
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            default: null
        },

        baseSalary: {
            type: Number,
            required: true,
            min: 0
        },

        signedDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "TERMINATED"],
            default: "ACTIVE"
        },

        notes: {
            type: String,
            default: ""
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("contracts", contractSchema);
