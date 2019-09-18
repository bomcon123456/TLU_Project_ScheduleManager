const csv = require("csv-parser");
const fs = require("fs");

exports.csvReader = (path, cb) => {
  const results = [];
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", data => results.push(data))
    .on("end", () => {
      cb(results);
    });
};
