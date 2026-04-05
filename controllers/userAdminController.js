const mongoose = require("mongoose");
const User = require("../schemas/users");
const Role = require("../schemas/roles");
const Employee = require("../schemas/employees");

function isCastError(error) {
  return error?.name === "CastError" || error instanceof mongoose.Error.CastError;
}

function currentUserId(req) {
  const u = req.user?.[0];
  return u?._id?.toString();
}

function stripUser(doc) {
  if (!doc) {
    return null;
  }
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  delete plain.password;
  return plain;
}

async function listUsers(req, res) {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .populate("role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi lấy danh sách người dùng" });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    let user;
    try {
      user = await User.findOne({ _id: id, isDeleted: false }).select("-password").populate("role");
    } catch (e) {
      if (isCastError(e)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
      throw e;
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ success: true, data: stripUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    let existing;
    try {
      existing = await User.findOne({ _id: id, isDeleted: false });
    } catch (e) {
      if (isCastError(e)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
      throw e;
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const { email, fullName, avatarUrl, status, role, password } = req.body;
    const update = {};

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ success: false, message: "Email không hợp lệ" });
      }
      update.email = email.trim().toLowerCase();
    }
    if (fullName !== undefined) {
      update.fullName = typeof fullName === "string" ? fullName : "";
    }
    if (avatarUrl !== undefined) {
      update.avatarUrl = typeof avatarUrl === "string" ? avatarUrl : "";
    }
    if (status !== undefined) {
      update.status = Boolean(status);
    }
    if (role !== undefined) {
      let roleDoc;
      try {
        roleDoc = await Role.findOne({ _id: role, isDeleted: false });
      } catch (e) {
        if (isCastError(e)) {
          return res.status(400).json({ success: false, message: "Role không hợp lệ" });
        }
        throw e;
      }
      if (!roleDoc) {
        return res.status(400).json({ success: false, message: "Không tìm thấy vai trò" });
      }
      update.role = role;
    }
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 6 ký tự" });
      }
      update.password = password;
    }

    if (Object.keys(update).length === 0) {
      const populated = await User.findById(existing._id).select("-password").populate("role");
      return res.status(200).json({ success: true, data: stripUser(populated) });
    }

    let updated;
    try {
      updated = await User.findOneAndUpdate({ _id: id, isDeleted: false }, update, {
        new: true,
        runValidators: true,
      })
        .select("-password")
        .populate("role");
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "Username hoặc email đã tồn tại" });
      }
      return res.status(400).json({ success: false, message: error.message || "Cập nhật thất bại" });
    }

    return res.status(200).json({ success: true, data: stripUser(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

async function softDeleteUser(req, res) {
  try {
    const { id } = req.params;
    const me = currentUserId(req);
    if (me && me === id) {
      return res.status(400).json({ success: false, message: "Không thể xóa chính tài khoản đang đăng nhập" });
    }

    let existing;
    try {
      existing = await User.findOne({ _id: id, isDeleted: false });
    } catch (e) {
      if (isCastError(e)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
      throw e;
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const empCount = await Employee.countDocuments({ user: id, isDeleted: false });
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa: còn ${empCount} hồ sơ nhân viên liên kết tài khoản này`,
      });
    }

    await User.updateOne({ _id: id, isDeleted: false }, { isDeleted: true });
    return res.status(200).json({ success: true, message: "Đã vô hiệu hóa tài khoản" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  softDeleteUser,
};
