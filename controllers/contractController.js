const Contract = require("../schemas/contracts");
const Employee = require("../schemas/employees");

function isCastError(err) {
    return err && err.name === "CastError";
}

const contractController = {
    getContracts: async (req, res) => {
        try {
            const filter = { isDeleted: false };
            if (req.query.employeeId) {
                try {
                    const emp = await Employee.findOne({
                        _id: req.query.employeeId,
                        isDeleted: false,
                    });
                    if (!emp) {
                        return res.status(400).json({
                            success: false,
                            message: "Không tìm thấy nhân viên",
                        });
                    }
                    filter.employee = req.query.employeeId;
                } catch (error) {
                    if (isCastError(error)) {
                        return res.status(400).json({
                            success: false,
                            message: "employeeId không hợp lệ",
                        });
                    }
                    throw error;
                }
            }

            const list = await Contract.find(filter)
                .sort({ createdAt: -1 })
                .populate("employee", "fullName employeeCode");
            res.status(200).json({ success: true, data: list });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getContractById: async (req, res) => {
        try {
            const { id } = req.params;
            let doc;
            try {
                doc = await Contract.findOne({ _id: id, isDeleted: false }).populate(
                    "employee",
                    "fullName employeeCode department position",
                );
            } catch (error) {
                if (isCastError(error)) {
                    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
                }
                throw error;
            }
            if (!doc) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng" });
            }
            res.status(200).json({ success: true, data: doc });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createContract: async (req, res) => {
        try {
            const {
                employee,
                contractNo,
                contractType,
                startDate,
                endDate,
                baseSalary,
                signedDate,
                status,
                notes,
            } = req.body;

            if (!employee || !contractNo || !contractType || !startDate || baseSalary === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu: employee, contractNo, contractType, startDate, baseSalary",
                });
            }

            let emp;
            try {
                emp = await Employee.findOne({ _id: employee, isDeleted: false });
            } catch (error) {
                if (isCastError(error)) {
                    return res.status(400).json({ success: false, message: "employee không hợp lệ" });
                }
                throw error;
            }
            if (!emp) {
                return res.status(400).json({ success: false, message: "Không tìm thấy nhân viên" });
            }

            const doc = new Contract({
                employee,
                contractNo: String(contractNo).trim(),
                contractType,
                startDate,
                endDate: endDate || null,
                baseSalary: Number(baseSalary),
                signedDate: signedDate || undefined,
                status: status || "ACTIVE",
                notes: notes || "",
            });
            await doc.save();

            const data = await Contract.findById(doc._id).populate("employee", "fullName employeeCode");
            res.status(201).json({ success: true, data, message: "Tạo hợp đồng thành công" });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "contractNo đã tồn tại" });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateContract: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                employee,
                contractNo,
                contractType,
                startDate,
                endDate,
                baseSalary,
                signedDate,
                status,
                notes,
            } = req.body;

            const update = {};
            if (employee !== undefined) {
                let emp;
                try {
                    emp = await Employee.findOne({ _id: employee, isDeleted: false });
                } catch (error) {
                    if (isCastError(error)) {
                        return res.status(400).json({ success: false, message: "employee không hợp lệ" });
                    }
                    throw error;
                }
                if (!emp) {
                    return res.status(400).json({ success: false, message: "Không tìm thấy nhân viên" });
                }
                update.employee = employee;
            }
            if (contractNo !== undefined) update.contractNo = String(contractNo).trim();
            if (contractType !== undefined) update.contractType = contractType;
            if (startDate !== undefined) update.startDate = startDate;
            if (endDate !== undefined) update.endDate = endDate;
            if (baseSalary !== undefined) update.baseSalary = Number(baseSalary);
            if (signedDate !== undefined) update.signedDate = signedDate;
            if (status !== undefined) update.status = status;
            if (notes !== undefined) update.notes = notes;

            let doc;
            try {
                doc = await Contract.findOneAndUpdate(
                    { _id: id, isDeleted: false },
                    update,
                    { new: true, runValidators: true },
                ).populate("employee", "fullName employeeCode department position");
            } catch (error) {
                if (isCastError(error)) {
                    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
                }
                if (error.code === 11000) {
                    return res.status(400).json({ success: false, message: "contractNo đã tồn tại" });
                }
                throw error;
            }

            if (!doc) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng" });
            }
            res.status(200).json({ success: true, data: doc, message: "Cập nhật thành công" });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "contractNo đã tồn tại" });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

module.exports = contractController;