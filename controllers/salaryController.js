const Salary = require('../schemas/salary');
const Employee = require('../schemas/employees');

module.exports = {
    setSalary: async (req, res) => {
        try {
            const { employeeId, baseSalary, allowance, bonus, deduction, note } = req.body;

            if (!employeeId || baseSalary === undefined) {
                return res.status(400).json({ message: "Thiếu employeeId hoặc baseSalary" });
            }

            const employee = await Employee.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ message: "Không tìm thấy nhân viên này" });
            }

            const newSalary = await Salary.create({
                employee: employeeId,
                effectiveFrom: new Date(),
                baseSalary: Number(baseSalary),
                allowance: Number(allowance || 0),
                bonus: Number(bonus || 0),
                deduction: Number(deduction || 0),
                netSalary: Number(baseSalary) + Number(allowance || 0),
                note: note || ""
            });

            res.status(201).json({ success: true, message: "Đã thiết lập mức lương cứng thành công", data: newSalary });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getSalary: async (req, res) => {
        try {
            const { employeeId } = req.params;
            const salaryHistory = await Salary.find({ employee: employeeId }).sort({ effectiveFrom: -1 });
            res.status(200).json({ success: true, data: salaryHistory });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
