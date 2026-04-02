const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees",
            required: true
        },

        effectiveFrom: {
            type: Date,
            required: true
        },

        baseSalary: {
            type: Number,
            required: true,
            min: 0
        },

        allowance: {
            type: Number,
            default: 0,
            min: 0
        },

        bonus: {
            type: Number,
            default: 0,
            min: 0
        },

        deduction: {
            type: Number,
            default: 0,
            min: 0
        },

        netSalary: {
            type: Number,
            default: 0,
            min: 0
        },

        note: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("salary", salarySchema);
