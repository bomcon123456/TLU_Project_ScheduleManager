require("dotenv").config({ path: "./env/dev.env" });

// const path = require("path");
// const fs = require("fs");
// const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { csvReader } = require("./modules/common/util/csv-parser");

const Department = require("./modules/api/departments/model");
const Teacher = require("./modules/api/teachers/model");
const Room = require("./modules/api/rooms/model");

// const multer = require("multer");
// const {
//   fileFilter,
//   fileStorage
// } = require("./modules/common/util/multer-util");

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

// Routes

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
    csvReader("../data/Datasheets/CSV/Rooms.csv", data =>
      data.map(each => {
        capacity = 40;
        building = "A";
        floor = 1;
        roomType = "LT";
        // Capacity
        if (each.name[3] % 2 !== 0) {
          capacity = 80;
        }
        // BUilding
        if (each.name[0] === "B") {
          building = "B";
        } else if (each.name === "BENHVIEN") {
          building = "BENHVIEN";
          capacity = -1;
        } else if (each.name.includes("GD.")) {
          building = "GIANGDUONG";
          capacity = 200;
        } else if (each.name === "NHATC") {
          building = "NHATC";
          capacity = -1;
          roomType = "TC";
        }
        // floor
        if (!!each.name[1].trim() && each.name[1] > -1) {
          floor = parseInt(each.name[1]);
        }

        // room Type
        if (each.name[0] === "B" && each.name[3] === "5") {
          roomType = "TH";
          capacity = 35;
        } else if (each.name[0] === "A") {
          roomType = "TH";
        }
        room = new Room({
          name: each.name,
          capacity: capacity,
          location: {
            building: building,
            floor: floor
          },
          roomType: roomType
        });
        room
          .save()
          .then(data => data)
          .catch(err => console.log(err));
      })
    );
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
