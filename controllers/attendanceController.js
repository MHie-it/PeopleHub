const mongoose = require('mongoose');
const Attendance = require('../schemas/attendances');

function getAttendanceDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRoleName(req) {
  const userDoc = req.user && req.user[0];
  return userDoc?.role?.name ?? null;
}

function resolveEmployeeId(req, res) {
  const roleName = getRoleName(req);

  if (roleName === 'Employee') {
    return req.user[0]._id;
  }

  const { employeeId } = req.body;
  if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
    res.status(400).send({ success: false, message: 'employeeId is invalid' });
    return null;
  }
  return employeeId;
}

async function checkIn(req, res) {
  const employeeId = resolveEmployeeId(req, res);
  if (!employeeId) return;

  const attendanceDate = getAttendanceDate(new Date());
  const now = new Date();


  const existed = await Attendance.findOne({ employeeId, attendanceDate });
  if (existed?.checkInAt) {
    return res.status(400).send({ success: false, message: 'Đã check-in hôm nay' });
  }

  try {
    const record = existed || new Attendance({ employeeId, attendanceDate });
    record.checkInAt = now;




    await record.save();
    return res.status(200).send({ success: true, data: record, message: 'Check-in thành công' });
  } catch (err) {

    if (err && err.code === 11000) {
      return res.status(400).send({ success: false, message: 'Đã check-in hôm nay' });
    }
    return res.status(500).send({ success: false, message: 'Lỗi server' });
  }
}

async function checkOut(req, res) {
  const employeeId = resolveEmployeeId(req, res);
  if (!employeeId) return;

  const attendanceDate = getAttendanceDate(new Date());
  const now = new Date();

  const existed = await Attendance.findOne({ employeeId, attendanceDate });
  if (!existed || !existed.checkInAt) {
    return res.status(400).send({ success: false, message: 'Chưa check-in' });
  }

  if (existed.checkOutAt) {
    return res.status(400).send({ success: false, message: 'Đã check-out' });
  }

  const workedMs = now.getTime() - existed.checkInAt.getTime();
  if (workedMs < 0) {
    return res.status(400).send({ success: false, message: 'Check-out không hợp lệ' });
  }

  existed.checkOutAt = now;
  existed.workedMs = workedMs;
  existed.workedHours = workedMs / (1000 * 60 * 60);

  await existed.save();
  return res.status(200).send({ success: true, data: existed, message: 'Check-out thành công' });
}

module.exports = {
  checkIn,
  checkOut,
};