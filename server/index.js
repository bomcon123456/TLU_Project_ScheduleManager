require("dotenv").config({ path: "./env/dev.env" });

// const path = require("path");
// const fs = require("fs");
// const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const teacherRoutes = require("./modules/api/teachers/routes");
const roomRoutes = require("./modules/api/rooms/routes");
const courseRoutes = require("./modules/api/courses/routes");
const departmentRoutes = require("./modules/api/departments/routes");
const authRoutes = require("./modules/api/auth/routes");
const classroomRoutes = require("./modules/api/classrooms/routes");
const queryRoutes = require("./modules/api/query/routes");
const calendarRoutes = require("./modules/api/calendar/routes");

// const teacherRoutes = require("./modules/api/teachers/routes");

const {
  fileFilter,
  fileStorage
} = require("./modules/common/util/multer-util");

const app = express();

app.use(bodyParser.json());

// Static folder Middleware

// CORS-Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Multer (file upload) middleware
app.use(
  "/api",
  multer({
    fileFilter: fileFilter
  }).single("file")
);

// Routes
app.use("/api/teachers", teacherRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/calendar", calendarRoutes);

// Error-handling Middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    const port = process.env.PORT;
    console.warn("Listening at port:", port);
    app.listen(process.env.PORT);
    /* HTTPs
    // https
    //   .createServer(
    //     {
    //       key: fs.readFileSync(
    //         `./modules/common/keys/${process.env.NODE_ENV}/${process.env.SSL_KEY_NAME}`
    //       ),
    //       cert: fs.readFileSync(
    //         `./modules/common/keys/${process.env.NODE_ENV}/${process.env.SSL_CRT_NAME}`
    //       ),
    //       requestCert: false,
    //       rejectUnauthorized: false
    //     },
    //     app
    //   )
    //   .listen(port);    */
  })
  .catch(err => console.log(err));
