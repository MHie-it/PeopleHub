const Position = require("../schemas/positions");
const Department = require("../schemas/department");
const Employee = require("../schemas/employees");


async function getPositions(req, res) {
    try {
        const positions = await Position.find({ isDeleted: false }).populate("department");
        return res.status(200).send(positions);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi lấy danh sách chức vụ" });
    }
}

async function createPosition(req, res) {
    try {
        const { code, title, department, level, description } = req.body;

        if (!code || !title || !department) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu bắt buộc: code, title, department",
            });
        }

        let dept;
        try {
            dept = await Department.findOne({ _id: department, isDeleted: false });
        } catch (e) {
            if (isCastError(e)) {
                return res.status(400).json({ success: false, message: "department không hợp lệ" });
            }
            throw e;
        }
        if (!dept) {
            return res.status(400).json({ success: false, message: "Không tìm thấy phòng ban" });
        }

        const newPosition = await Position.create({
            code,
            title,
            department,
            level,
            description,
        });

        return res.status(201).send(newPosition);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Mã chức vụ đã tồn tại" });
        }
        return res.status(500).json({ success: false, message: "Lỗi tạo chức vụ" });
    }
}

async function updatePosition(req, res) {
    try {
        const { id } = req.params;

        let existing;
        try {
            existing = await Position.findOne({ _id: id, isDeleted: false });
        } catch (e) {
            if (isCastError(e)) {
                return res.status(400).json({ success: false, message: "ID không hợp lệ" });
            }
            throw e;
        }
        if (!existing) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
        }

        const { code, title, department, level, description } = req.body;

        if (department !== undefined) {
            let dept;
            try {
                dept = await Department.findOne({ _id: department, isDeleted: false });
            } catch (e) {
                if (isCastError(e)) {
                    return res.status(400).json({ success: false, message: "department không hợp lệ" });
                }
                throw e;
            }
            if (!dept) {
                return res.status(400).json({ success: false, message: "Không tìm thấy phòng ban" });
            }
            existing.department = department;
        }
        if (code !== undefined) existing.code = code;
        if (title !== undefined) existing.title = title;
        if (level !== undefined) existing.level = level;
        if (description !== undefined) existing.description = description;

        await existing.save();
        const populated = await Position.findById(existing._id).populate("department");
        return res.status(200).json({
            success: true,
            message: "Cập nhật thành công",
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Mã chức vụ đã tồn tại" });
        }
        return res.status(500).json({ success: false, message: "Lỗi cập nhật chức vụ" });
    }
}

async function deletePosition(req, res) {
    try {
        const { id } = req.params;

        let existing;
        try {
            existing = await Position.findOne({ _id: id, isDeleted: false });
        } catch (e) {
            if (isCastError(e)) {
                return res.status(400).json({ success: false, message: "ID không hợp lệ" });
            }
            throw e;
        }
        if (!existing) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chức vụ" });
        }

        const empCount = await Employee.countDocuments({
            position: id,
            isDeleted: false,
        });
        if (empCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa: còn ${empCount} nhân viên đang giữ chức vụ này`,
            });
        }

        existing.isDeleted = true;
        await existing.save();
        return res.status(200).json({ success: true, message: "Đã xóa chức vụ (soft delete)" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi xóa chức vụ" });
    }
}

module.exports = {
    getPositions,
    createPosition,
    updatePosition,
    deletePosition,
};