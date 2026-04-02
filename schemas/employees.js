const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date,
            default: null
        },

        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"],
            default: "OTHER"
        },

        phone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "departments",
            required: true
        },

        position: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "positions",
            required: true
        },

        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            default: null
        },

        joinDate: {
            type: Date,
            required: true
        },

        employmentStatus: {
            type: String,
            enum: ["PROBATION", "ACTIVE", "INACTIVE", "RESIGNED", "TERMINATED"],
            default: "ACTIVE"
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("employees", employeeSchema);
