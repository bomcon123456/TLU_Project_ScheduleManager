const csv = require("csv-parser");
const parse = require("csv-parse");
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

exports.csvParser = (path, cb) => {
  let parser = parse({ delimiter: "," }, cb);
  fs.createReadStream(path).pipe(parser);
};
