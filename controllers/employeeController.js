const User = require('../schemas/users');
const Role = require('../schemas/roles');
const Employee = require('../schemas/employees');
const mongoose = require('mongoose');

// ==========================================
// CHO EMPLOYEE TỰ XEM THÔNG TIN CỦA MÌNH
// ==========================================
module.exports.getMyProfile = async (req, res) => {
    try {
        // req.user được gán từ middleware CheckLogin
        const currentUserId = req.user[0]._id;
        
        // Tìm hồ sơ Employee liên kết với User ID
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

// ==========================================
// DÀNH CHO HR / ADMIN
// ==========================================

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
    // Để giữ tính nhất quán, dùng Session/Transaction nếu có ReplicaSet. 
    // Ở đây đơn giản tạo lần lượt.
    try {
        const { 
            // Của User
            username, password, email, roleId, 
            // Của Employee
            employeeCode, fullName, dateOfBirth, gender, phone, address, 
            department, position, manager, joinDate 
        } = req.body;

        if (!username || !password || !email || !roleId || !employeeCode || !fullName || !department || !position || !joinDate) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
        }

        // 1. Kiểm tra tồn tại Role, User, Mã NV
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

        // 2. Tạo Tài khoản User tương tự code của hrController
        const newUser = new User({
            username,
            password,
            email,
            fullName,
            role: roleId
        });
        await newUser.save();

        // 3. Tạo Hồ sơ Nhân sự (Employee) kết nối với User ID vừa lưu
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

        // Xóa trường không cho phép tự sửa qua đường này
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

        // Soft Delete: Đánh dấu nghỉ việc thay vì xóa thật khỏi DB
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
