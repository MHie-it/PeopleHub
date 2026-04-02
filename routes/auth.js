var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let roleModel = require('../schemas/roles')
let { RegisterValidator, validatedResult, ForgotPasswordValidator, ResetPasswordValidator } = require('../utils/validator')
let { CheckLogin, CheckRole } = require('../utils/authHandler')

//login
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(404).send("thong tin dang nhap khong dung")
    } else {
        res.send(result)
    }

})
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {
    let { username, password, email } = req.body;
    let employeeRole = await roleModel.findOne({ name: 'Employee' });
    if (!employeeRole) {
        return res.status(500).send({ message: "Default role (Employee) not found in database" });
    }
    let newUser = await userController.CreateAnUser(
        username, password, email, employeeRole._id
    )
    res.send(newUser)
})
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user)
})
router.post('/forgot-password', ForgotPasswordValidator, validatedResult, async function (req, res, next) {
    let { email } = req.body;
    let result = await userController.ForgotPassword(email);
    res.send(result)
})
router.post('/change-password', ResetPasswordValidator, validatedResult, async function (req, res, next) {
    let { email, password } = req.body;
    let result = await userController.ChangePassword(email, password);
    res.send(result)
})

//register
//changepassword
//me
//forgotpassword
//permission
module.exports = router;