const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "departments",
            required: true
        },

        level: {
            type: String,
            enum: ["Intern", "Junior", "Middle", "Senior", "Lead", "Manager", "Director"],
            default: "Junior"
        },

        description: {
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

module.exports = mongoose.model("positions", positionSchema);
