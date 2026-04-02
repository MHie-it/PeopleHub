const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        },

        type: {
            type: String,
            enum: [
                "LEAVE_REQUEST_CREATED",
                "LEAVE_REQUEST_APPROVED",
                "LEAVE_REQUEST_REJECTED",
                "PAYROLL_GENERATED",
                "SYSTEM"
            ],
            default: "SYSTEM"
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true
        },

        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("notifi", notificationSchema);
