const User = require('../schemas/users');
const Role = require('../schemas/roles');
const Employee = require('../schemas/employees');
const mongoose = require('mongoose');

module.exports.getMyProfile = async (req, res) => {
    try {
        const currentUserId = req.user[0]._id;

        const employeeProfile = await Employee.findOne({ user: currentUserId, isDeleted: false })
            .populate('user', '-password')
            .populate('department', 'name code')
            .populate('position', 'title level');

        if (!employeeProfile) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ nhân sự của bạn" });
        }

        return res.status(200).json({
            success: true,
            data: employeeProfile
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};


module.exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ isDeleted: false })
            .populate('user', '-password')
            .populate('department', 'name code')
            .populate('position', 'title level')
            .populate('manager', 'fullName employeeCode');

        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id)
            .populate('user', '-password')
            .populate('department')
            .populate('position')
            .populate('manager', 'fullName employeeCode');

        if (!employee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.createEmployee = async (req, res) => {
    try {
        const {
            username, password, email, roleId,
            employeeCode, fullName, dateOfBirth, gender, phone, address,
            department, position, manager, joinDate
        } = req.body;

        if (!username || !password || !email || !roleId || !employeeCode || !fullName || !department || !position || !joinDate) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
        }

        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(404).json({ success: false, message: "Quyền (Role) không tồn tại" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Tài khoản (Username) hoặc Email đã tồn tại" });
        }

        const empCodeExists = await Employee.findOne({ employeeCode });
        if (empCodeExists) {
            return res.status(400).json({ success: false, message: "Mã nhân viên (Employee Code) đã tồn tại" });
        }


        const newUser = new User({
            username,
            password,
            email,
            fullName,
            role: roleId
        });
        await newUser.save();

        const newEmployee = new Employee({
            employeeCode,
            user: newUser._id,
            fullName,
            dateOfBirth: dateOfBirth || null,
            gender: gender || "OTHER",
            phone: phone || "",
            address: address || "",
            department,
            position,
            manager: manager || null,
            joinDate,
            employmentStatus: "ACTIVE"
        });

        await newEmployee.save();

        return res.status(201).json({
            success: true,
            message: "Tạo nhân viên thành công",
            data: newEmployee
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.user;
        delete updateData.employeeCode;
        delete updateData.isDeleted;

        const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ thành công",
            data: updatedEmployee
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEmployee = await Employee.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                employmentStatus: "RESIGNED"
            },
            { new: true }
        );

        if (!deletedEmployee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên với ID đã cung cấp" });
        }

        return res.status(200).json({
            success: true,
            message: "Đã đánh dấu nhân viên nghỉ việc thành công",
            data: { id: deletedEmployee._id, status: deletedEmployee.employmentStatus }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};
