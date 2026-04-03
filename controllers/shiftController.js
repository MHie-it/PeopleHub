const shifts = require("../schemas/shifts");
const shift = require("../schemas/shifts");

async function createShift(req, res) {
  try {
    const { code, name, startTime, endTime, isNight } = req.body;
    if (!code || !name || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    const newShift = new shifts({
      code: code.toUpperCase(),
      name,
      startTime,
      endTime,
      isNight: !!isNight,
    });

    await newShift.save();
    res
      .status(201)
      .json({ success: true, data: newShift, message: "tạo mã ca thành công" });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Mã ca đã tồn tại" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
async function listShifts(req, res) {
  try {
    const shifts = await shift.find({ isDeleted: false });
    res.status(200).json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
module.exports = { createShift, listShifts };
