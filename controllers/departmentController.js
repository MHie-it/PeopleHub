const mongoose = require("mongoose");
const Department = require("../schemas/department");
const Employee = require("../schemas/employees");
const { create } = require("../schemas/users");

async function createDepartment(req, res, next) {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      return res
        .status(400)
        .json({ success: false, message: "code và name là bắt buộc" });
    }

    const newDepartment = new Department({
      code: code.toUpperCase(),
      name,
      description: description || "",
    });
    await newDepartment.save();
    return res.status(201).json({
      success: true,
      data: newDepartment,
      message: "tạo department thành công",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Code hoặc name đã tồn tại" });
    }
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
async function getDepartment(req, res) {
  try {
    const department = await Department.find({ isDeleted: false }).populate(
      "manager",
      "fullname",
    );
    return res.status(200).json({ success: true, data: department });
  } catch (err) {
    return res.status(500).json({ success: false, message: "lỗi server" });
  }
}

async function updateDepartment(req, res, next) {
  try {
    let id = req.params.id;
    let updateItem = await Department.findByIdAndUpdate(id, req.body,
      { new: true });
    return res.status(200).json({ success: true, data: updateItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: "lỗi update" });
  }
}

async function deleteDepartment(req, res, next) {
  try {
    let id = req.params.id;
    let updateItem = await Department.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return res.status(200).json({ success: true, data: updateItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: "lỗi delete" });
  }
}


module.exports = {
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
