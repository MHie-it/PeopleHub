const Notifi = require("../schemas/notifi");
const User = require("../schemas/users");
const { getIO } = require("../utils/socket");

const notifiController = {

    getAll: async (req, res) => {
        try {
            const receiverId = req.params.userId;
            const notifications = await Notifi.find({ receiver: receiverId }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    create: async (req, res) => {
        try {
            const { receiver, type, title, message, data } = req.body;
            const notifi = new Notifi({
                receiver,
                title,
                message,
                type: type || "SYSTEM",
                data: data || {}
            });
            await notifi.save();

            try {
                const io = getIO();
                io.to(`user:${receiver}`).emit('notification', notifi);
            } catch (_) { }

            res.status(201).json({ success: true, data: notifi });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    createGlobal: async (req, res) => {
        try {
            const { type, title, message, data } = req.body;
            const users = await User.find({ isDeleted: { $ne: true } }).select('_id');
            const notifiDocs = users.map((user) => ({
                receiver: user._id,
                title,
                message,
                type: type || "SYSTEM",
                data: data || {},
                actor: req.user ? req.user[0]._id : null
            }));

            if (notifiDocs.length > 0) {
                await Notifi.insertMany(notifiDocs);
            }

            try {
                const io = getIO();
                const broadcastPayload = { title, message, type: type || "SYSTEM", data: data || {} };
                users.forEach((user) => {
                    io.to(`user:${user._id}`).emit('notification', {
                        ...broadcastPayload,
                        receiver: user._id,
                    });
                });
            } catch (_) { }

            res.status(201).json({ success: true, count: notifiDocs.length, message: "Notifications broadcasted" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const notifiId = req.params.id;
            const notifi = await Notifi.findByIdAndUpdate(notifiId, {
                isRead: true,
                readAt: new Date()
            }, { new: true });

            if (!notifi) return res.status(404).json({ success: false, message: "Notification not found" });

            res.status(200).json({ success: true, data: notifi });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = notifiController;
