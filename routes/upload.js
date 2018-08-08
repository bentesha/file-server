const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const busboy = require("connect-busboy");
const shortid = require("shortid");
const moment = require("moment");

const router = express.Router();
router.use(busboy());

router.post("/", (request, response) => {
  request.pipe(request.busboy);
  request.busboy.on("file", (fieldName, file, fileName) => {
    const ext = path.extname(fileName);
    //Generate a random file name
    fileName = `${shortid.generate()}${ext}`;
    const filePath = `${__dirname}/public/uploaded/${fileName}`;
    const stream = fs.createWriteStream(filePath);
    file.pipe(stream);
    stream.on("close", () => {
      const url = `${request.protocol}://${request.host}/uploaded/${fileName}`;
      response.json({
        name: fileName,
        size: fs.statSync(filePath).size,
        date: moment().format(),
        format: ext.replace(".", "").toUpperCase(),
        url
      });
    });
  });
});

module.exports = router;