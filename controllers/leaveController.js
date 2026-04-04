const LeaveRequest = require('../schemas/leave_request');
const Employee = require('../schemas/employees');

module.exports = {
    createLeave: async (req, res) => {
        try {
            const userId = req.user[0]._id;
            const employee = await Employee.findOne({ user: userId });
            if (!employee) return res.status(404).json({ message: "Không tìm thấy hồ sơ nhân viên" });

            const { leaveType, fromDate, toDate, reason } = req.body;
            if (!leaveType || !fromDate || !toDate) {
                return res.status(400).json({ message: "Thiếu dữ liệu: leaveType, fromDate, toDate" });
            }

            const t1 = new Date(fromDate).getTime();
            const t2 = new Date(toDate).getTime();
            const totalDays = Math.max(1, Math.ceil((t2 - t1) / (1000 * 3600 * 24)) + 1);

            const newLeave = await LeaveRequest.create({
                employee: employee._id,
                leaveType,
                fromDate,
                toDate,
                totalDays,
                reason: reason || "",
                status: "PENDING"
            });

            res.status(201).json({ success: true, data: newLeave });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    
    leaderAction: async (req, res) => {
        try {
            const { id } = req.params;
            const { action, note } = req.body;
            const leaderId = req.user[0]._id;

            const leaveReq = await LeaveRequest.findById(id);
            if (!leaveReq) return res.status(404).json({ message: "Không tìm thấy đơn xin nghỉ phép" });

            if (leaveReq.status !== "PENDING") {
                return res.status(400).json({ message: "Đơn này không ở trạng thái chờ Leader duyệt (PENDING)" });
            }

            leaveReq.managerActionBy = leaderId;
            leaveReq.managerNote = note || "";
            leaveReq.managerActionAt = new Date();

            if (action === 'APPROVE') {
                leaveReq.status = "PENDING_HR";
            } else {
                leaveReq.status = "REJECTED_MANAGER";
            }

            await leaveReq.save();
            res.status(200).json({ success: true, data: leaveReq });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    bossAction: async (req, res) => {
        try {
            const { id } = req.params;
            const { action, note } = req.body;
            const bossId = req.user[0]._id;

            const leaveReq = await LeaveRequest.findById(id);
            if (!leaveReq) return res.status(404).json({ message: "Không tìm thấy đơn xin nghỉ phép" });

            if (leaveReq.status !== "PENDING_HR") {
                return res.status(400).json({ message: "Đơn này không ở trạng thái chờ Sếp duyệt (PENDING_HR)" });
            }

            leaveReq.hrActionBy = bossId;
            leaveReq.hrNote = note || "";
            leaveReq.hrActionAt = new Date();

            if (action === 'APPROVE') {
                leaveReq.status = "APPROVED";
            } else {
                leaveReq.status = "REJECTED_HR";
            }

            await leaveReq.save();
            res.status(200).json({ success: true, data: leaveReq });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const data = await LeaveRequest.find().populate("employee").sort({ createdAt: -1 });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
