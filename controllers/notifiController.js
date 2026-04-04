const Notifi = require("../schemas/notifi");

const notifiController = {
    // Lấy thông báo theo User ID
    getAll: async (req, res) => {
        try {
            const receiverId = req.params.userId;
            const notifications = await Notifi.find({ receiver: receiverId }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Tạo thông báo mới
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
            res.status(201).json({ success: true, data: notifi });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Đánh dấu đã đọc
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
