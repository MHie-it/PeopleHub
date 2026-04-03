var express = require("express");
var router = express.Router();
let positionModel = require("../schemas/positions");
let departmentModel = require("../schemas/department");
let { CheckLogin, CheckRole } = require("../utils/authHandler");

router.get("/", CheckLogin, async function (req, res, next) {
  try {
    let positions = await positionModel
      .find({ isDeleted: false })
      .populate("department");
    res.send(positions);
  } catch (error) {
    res.status(500).send({ message: "loi lay danh sach position", error: error.message });
  }
});

router.post("/", CheckLogin, CheckRole(["admin", "HR", "Manager"]), async function (req, res, next) {
  try {
    let { code, title, department, level, description } = req.body;

    if (!code || !title || !department) {
      return res.status(400).send({ message: "thieu du lieu bat buoc: code, title, department" });
    }

    let checkDepartment = await departmentModel.findOne({ _id: department, isDeleted: false });
    if (!checkDepartment) {
      return res.status(400).send({ message: "khong tim thay phong ban" });
    }

    let newPosition = await positionModel.create({
      code,
      title,
      department,
      level,
      description
    });

    res.status(201).send(newPosition);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send({ message: "ma position da ton tai" });
    }
    res.status(500).send({ message: "loi tao position", error: error.message });
  }
});

module.exports = router;