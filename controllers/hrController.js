const User = require('../schemas/users');
const Role = require('../schemas/roles');

module.exports.createEmployee = async (req, res) => {
    try {
        const { username, password, email, fullName, roleId } = req.body;


        if (!username || !password || !email || !roleId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin: username, password, email, roleId"
            });
        }


        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(404).json({ success: false, message: "Quyền (Role) không tồn tại" });
        }

        const userExists = await User.findOne({
            $or: [{ email: email }, { username: username }]
        });

        if (userExists) {
            return res.status(400).json({ success: false, message: "Tài khoản hoặc email đã tồn tại" });
        }


        const newEmployee = new User({
            username,
            password,
            email,
            fullName,
            role: roleId
        });

        await newEmployee.save();

        return res.status(201).json({
            success: true,
            message: "Tạo nhân viên thành công",
            data: {
                _id: newEmployee._id,
                username: newEmployee.username,
                email: newEmployee.email,
                fullName: newEmployee.fullName,
                role: roleExists.name
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

module.exports.deleteEmployee = async (req, res) => {
    try {
        // Có thể lấy id từ body hoặc query
        const id = req.body.id || req.query.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp id nhân viên cần xóa"
            });
        }

        // Tìm và xóa người dùng
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhân viên với id đã cung cấp"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa nhân viên thành công",
            data: { id: deletedUser._id }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};
