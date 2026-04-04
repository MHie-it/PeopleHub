let path = require("path");
let fs = require("fs");

module.exports = {
    GetFile: function (req, res, next) {
        try {
            let filename = req.params.filename;
            if (!filename || filename !== path.basename(filename) || filename.indexOf("..") !== -1) {
                return res.status(400).json({ success: false, message: "Ten file khong hop le" });
            }

            let uploadsRoot = path.resolve(__dirname, "..", "uploads");
            let pathFile = path.resolve(path.join(uploadsRoot, filename));
            if (!pathFile.startsWith(uploadsRoot)) {
                return res.status(400).json({ success: false, message: "Duong dan khong hop le" });
            }

            if (!fs.existsSync(pathFile)) {
                return res.status(404).json({ success: false, message: "Khong tim thay file" });
            }

            return res.sendFile(pathFile);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Loi server", error: error.message });
        }
    },

    UploadImage: function (req, res, next) {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Khong co file hoac file khong phai dinh dang anh",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                url: "/upload/" + req.file.filename,
            },
        });
    },

    UploadExcel: async function (req, res, next) {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Khong co file hoac file khong phai Excel hop le",
            });
        }

        let pathFile = path.join(__dirname, "..", "uploads", req.file.filename);
        try {
            if (fs.existsSync(pathFile)) {
                fs.unlinkSync(pathFile);
            }
        } catch (e) {
            /* ignore */
        }

        return res.status(501).json({
            success: false,
            message:
                "Import Excel (san pham/kho) chua tich hop tren PeopleHub. Ban giu ten ham UploadExcel va route POST /upload/excel; khi can hay them exceljs + schema phu hop hoac copy lai logic cu vao day.",
        });
    },
};
