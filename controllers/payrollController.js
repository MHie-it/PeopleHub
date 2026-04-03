const Payroll = require("../schemas/payrolls");
const User = require("../schemas/users");
const Employee = require("../schemas/employees");
const Salary = require("../schemas/salary");
const Attendance = require("../schemas/attendances");
const { sendMail } = require("../utils/mailer");

const payrollController = {
    sendSalaryEmail: async (req, res) => {
        try {
            const payrollId = req.params.id;

            const payroll = await Payroll.findById(payrollId).populate('employee');

            if (!payroll) {
                return res.status(404).json({ success: false, message: "Payroll not found" });
            }

            const user = await User.findById(payroll.employee.user);

            if (!user || !user.email) {
                return res.status(404).json({ success: false, message: "User/Email not found for this employee" });
            }

            const htmlContent = `
                <h2>Thông báo lương tháng ${payroll.month}/${payroll.year}</h2>
                <p>Kính gửi <strong>${payroll.employee.fullName}</strong>,</p>
                <p>Phòng Hành chính - Nhân sự trân trọng gửi bảng lương chi tiết tháng ${payroll.month}/${payroll.year} của bạn như sau:</p>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; min-width: 400px; text-align: left;">
                    <tr style="background-color: #f2f2f2;">
                        <th>Tiêu chí</th>
                        <th>Chi tiết</th>
                    </tr>
                    <tr>
                        <td>Tháng/Năm</td>
                        <td>${payroll.month}/${payroll.year}</td>
                    </tr>
                    <tr>
                        <td>Ngày công làm việc</td>
                        <td>${payroll.workingDays} ngày</td>
                    </tr>
                    <tr>
                        <td>Ngày nghỉ phép</td>
                        <td>${payroll.leaveDays} ngày</td>
                    </tr>
                    <tr>
                        <td>Mức lương cơ bản</td>
                        <td>${payroll.baseSalary.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr>
                        <td>Thưởng</td>
                        <td>${payroll.bonus.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr>
                        <td>Khấu trừ (Phạt)</td>
                        <td>${payroll.penalty.toLocaleString('vi-VN')} VND</td>
                    </tr>
                    <tr style="background-color: #e6f7ff;">
                        <td><strong>Tổng lương thực nhận</strong></td>
                        <td><strong style="color: red;">${payroll.totalSalary.toLocaleString('vi-VN')} VND</strong></td>
                    </tr>
                </table>
                <br />
                <p>Mọi thắc mắc xin vui lòng liên hệ phòng Hành chính - Nhân sự trước ngày 15 hàng tháng.</p>
                <p>Trân trọng,</p>
            `;

            await sendMail(user.email, `Chi tiết Bảng lương tháng ${payroll.month}/${payroll.year}`, htmlContent);

            res.status(200).json({ success: true, message: "Salary email sent successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    calculate: async (req, res) => {
        try {
            const { employeeId, month, year } = req.body;
            if (!employeeId || !month || !year) {
                return res.status(400).json({ message: "Thiếu employeeId, month hoặc year" });
            }

            const employee = await Employee.findById(employeeId);
            if (!employee) return res.status(404).json({ message: "Nhân viên không tồn tại" });

            const salaryInfo = await Salary.findOne({ employee: employeeId }).sort({ effectiveFrom: -1 });
            if (!salaryInfo) return res.status(404).json({ message: "Nhân viên chưa cấu hình bảng lương (Salary)" });

            const monthStr = month < 10 ? `0${month}` : `${month}`;
            const prefixDate = `${year}-${monthStr}-`;

            const attendances = await Attendance.find({ 
                employeeId: employee.user,
                attendanceDate: { $regex: `^${prefixDate}` }
            });

            const workingDays = attendances.length;
            const standardDays = 26;
            const baseSalary = salaryInfo.baseSalary || 0;
            const bonusValue = req.body.bonus !== undefined ? req.body.bonus : (salaryInfo.bonus || 0);
            const penalty = salaryInfo.deduction || 0; 

            const totalSalary = Math.round((baseSalary / standardDays) * workingDays + bonusValue);

            const newPayroll = await Payroll.create({
                employee: employeeId,
                month,
                year,
                workingDays,
                baseSalary,
                bonus: bonusValue,
                penalty,
                totalSalary,
                status: "DRAFT"
            });

            res.status(200).json({ success: true, data: newPayroll });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = payrollController;
