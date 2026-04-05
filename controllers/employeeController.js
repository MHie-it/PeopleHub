const User = require('../schemas/users');
const Role = require('../schemas/roles');
const Employee = require('../schemas/employees');
const mongoose = require('mongoose');

async function getDepartmentIdForUser(userId) {
    const emp = await Employee.findOne({ user: userId, isDeleted: false }).select('department');
    return emp?.department || null;
}

function pickLeaderEmployeeFields(body) {
    const allowed = ['fullName', 'dateOfBirth', 'gender', 'phone', 'address', 'employmentStatus'];
    const out = {};
    for (const key of allowed) {
        if (body[key] !== undefined) {
            out[key] = body[key];
        }
    }
    return out;
}

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
        const roleName = req.user[0].role?.name;
        const filter = { isDeleted: false };

        if (roleName === 'Leader') {
            const deptId = await getDepartmentIdForUser(req.user[0]._id);
            if (!deptId) {
                return res.status(200).json({ success: true, data: [] });
            }
            filter.department = deptId;
        }

        const employees = await Employee.find(filter)
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID nhân viên không hợp lệ" });
        }

        const employee = await Employee.findOne({ _id: id, isDeleted: false })
            .populate('user', '-password')
            .populate('department')
            .populate('position')
            .populate('manager', 'fullName employeeCode');

        if (!employee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
        }

        if (req.user[0].role?.name === 'Leader') {
            const myDept = await getDepartmentIdForUser(req.user[0]._id);
            if (!myDept || String(employee.department?._id || employee.department) !== String(myDept)) {
                return res.status(403).json({ success: false, message: "Không có quyền xem nhân viên ngoài phòng ban" });
            }
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user[0]._id;
        const body = req.body || {};

        const employee = await Employee.findOne({ user: userId, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ nhân sự" });
        }

        const userUpdate = {};
        if (body.email !== undefined && body.email !== '') {
            userUpdate.email = String(body.email).toLowerCase().trim();
        }
        if (body.fullName !== undefined && body.fullName !== '') {
            userUpdate.fullName = body.fullName;
        }

        if (Object.keys(userUpdate).length > 0) {
            try {
                await User.findByIdAndUpdate(userId, userUpdate, { new: true, runValidators: true });
            } catch (err) {
                if (err.code === 11000) {
                    return res.status(400).json({ success: false, message: "Email đã được sử dụng" });
                }
                throw err;
            }
        }

        const empUpdate = {};
        if (body.fullName !== undefined) {
            empUpdate.fullName = body.fullName;
        }
        if (body.phone !== undefined) {
            empUpdate.phone = body.phone;
        }
        if (body.address !== undefined) {
            empUpdate.address = body.address;
        }
        if (body.gender !== undefined) {
            empUpdate.gender = body.gender;
        }
        if (body.dateOfBirth !== undefined) {
            empUpdate.dateOfBirth = body.dateOfBirth || null;
        }

        let updatedEmployee;
        if (Object.keys(empUpdate).length > 0) {
            updatedEmployee = await Employee.findOneAndUpdate(
                { _id: employee._id, isDeleted: false },
                empUpdate,
                { new: true, runValidators: true },
            )
                .populate('user', '-password')
                .populate('department', 'name code')
                .populate('position', 'title level');
        } else {
            updatedEmployee = await Employee.findOne({ _id: employee._id, isDeleted: false })
                .populate('user', '-password')
                .populate('department', 'name code')
                .populate('position', 'title level');
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ thành công",
            data: updatedEmployee,
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

        if (!username || !password || !email || !employeeCode || !fullName || !department || !position || !joinDate) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
        }

        let finalRoleId = roleId;
        if (!finalRoleId) {
            const employeeRole = await Role.findOne({ name: 'Employee' });
            if (!employeeRole) {
                return res.status(500).json({ success: false, message: "Không tìm thấy quyền 'Employee' mặc định trong CSDL" });
            }
            finalRoleId = employeeRole._id;
        }

        if (!mongoose.Types.ObjectId.isValid(finalRoleId) ||
            !mongoose.Types.ObjectId.isValid(department) ||
            !mongoose.Types.ObjectId.isValid(position) ||
            (manager && !mongoose.Types.ObjectId.isValid(manager))) {
            return res.status(400).json({ success: false, message: "ID tham chiếu không hợp lệ (role, department, position hoặc manager)" });
        }

        const roleExists = await Role.findById(finalRoleId);
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

        const session = await mongoose.startSession();
        let newEmployee;

        try {
            await session.withTransaction(async () => {
                const newUser = new User({
                    username,
                    password,
                    email,
                    fullName,
                    role: finalRoleId
                });
                await newUser.save({ session });

                newEmployee = new Employee({
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
                await newEmployee.save({ session });
            });
        } finally {
            await session.endSession();
        }

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
        let updateData = { ...req.body };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID nhân viên không hợp lệ" });
        }

        delete updateData.user;
        delete updateData.employeeCode;
        delete updateData.isDeleted;

        const roleName = req.user[0].role?.name;
        if (roleName === 'Leader') {
            const myDept = await getDepartmentIdForUser(req.user[0]._id);
            const target = await Employee.findOne({ _id: id, isDeleted: false }).select('department user');
            if (!target || !myDept || String(target.department) !== String(myDept)) {
                return res.status(403).json({ success: false, message: "Chỉ được cập nhật nhân viên cùng phòng ban" });
            }
            updateData = pickLeaderEmployeeFields(updateData);
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ success: false, message: "Không có trường hợp lệ để cập nhật" });
            }
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', '-password')
            .populate('department', 'name code')
            .populate('position', 'title level');

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
        }

        if (updateData.fullName && updatedEmployee.user) {
            const uid = updatedEmployee.user._id || updatedEmployee.user;
            await User.findByIdAndUpdate(uid, { fullName: updateData.fullName });
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID nhân viên không hợp lệ" });
        }

        const deletedEmployee = await Employee.findOneAndUpdate(
            { _id: id, isDeleted: false },
            {
                isDeleted: true,
                employmentStatus: "RESIGNED"
            },
            { new: true }
        );

        if (!deletedEmployee) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên với ID đã cung cấp" });
        }

        if (deletedEmployee.user) {
            await User.findByIdAndUpdate(deletedEmployee.user, { isDeleted: true });
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
