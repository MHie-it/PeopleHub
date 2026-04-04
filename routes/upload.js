var express = require("express");
var router = express.Router();
let upload = require("../controllers/uploads");
let { uploadImage, uploadExcel } = require("../utils/uploadHandler");
let { CheckLogin } = require("../utils/authHandler");

router.post(
  "/avatar",
  CheckLogin,
  uploadImage.single("file"),
  upload.UploadUserAvatar
);

router.post("/excel", uploadExcel.single("file"), upload.UploadExcel);

router.post("/image", uploadImage.single("file"), upload.UploadImage);

router.get("/:filename", upload.GetFile);

module.exports = router;
