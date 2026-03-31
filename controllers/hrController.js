const User = require('../schemas/users');
const Role = require('../schemas/roles');

const createEmployee = async (req, res) => {
    try {
        const { username, password, email, fullName, roleId } = req.body;

        // Cơ bản: Kiểm tra xem các trường quan trọng đã được gửi lên chưa
        if (!username || !password || !email || !roleId) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cung cấp đầy đủ thông tin: username, password, email, roleId" 
            });
        }

        // Kiểm tra xem Role truyền lên có tồn tại không
        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(404).json({ success: false, message: "Quyền (Role) không tồn tại" });
        }

        // Kiểm tra xem User đã tồn tại chưa (email hoặc username)
        const userExists = await User.findOne({ 
            $or: [{ email: email.toLowerCase() }, { username: username }]
        });
        
        if (userExists) {
            return res.status(400).json({ success: false, message: "Tài khoản hoặc email đã tồn tại" });
        }

        // Tạo nhân viên mới
        const newEmployee = new User({
            username,
            password, // Mật khẩu sẽ tự động được băm (hash) nhờ middleware `pre('save')` trong schema users.js
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

module.exports = {
    createEmployee
};
