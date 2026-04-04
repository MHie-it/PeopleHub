var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
let dotenv = require("dotenv");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var roleRouter = require("./routes/role");
var attendanceRouter = require("./routes/attendance");
var departmentRouter = require("./routes/department");
var employeesRouter = require("./routes/employees");
var positionRouter = require("./routes/positions");
var notifiRouter = require("./routes/notifi");
var payrollsRouter = require("./routes/payrolls");
var leavesRouter = require("./routes/leaves");
var salaryRouter = require("./routes/salary");
const { connect } = require("http2");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/auth", authRouter);
app.use("/role", roleRouter);
app.use("/departments", departmentRouter);
app.use("/employees", employeesRouter);
app.use("/positions", positionRouter);
app.use("/attendance", attendanceRouter);
app.use("/notifi", notifiRouter);
app.use("/payrolls", payrollsRouter);
app.use("/leaves", leavesRouter);
app.use("/salary", salaryRouter);
// Connect to MongoDB
dotenv.config();
let connectDB = require("./config/db");
connectDB();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.sendFile(path.join(__dirname, "views", "error.html"));
});

module.exports = app;
