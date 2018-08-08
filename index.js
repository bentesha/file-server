const express = require("express");
const fs = require("fs-extra");
const busboy = require("connect-busboy");
const path = require("path");
const cors = require("cors");
const config = require("./config");
const shortid = require("shortid");
const moment = require("moment");

const app = express();
app.use(cors());
app.use(busboy());
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", (request, response) => {
  request.pipe(request.busboy);
  request.busboy.on("file", (fieldName, file, fileName) => {
    const ext = path.extname(fileName) || "";
    //Generate a random file name
    fileName = `${shortid.generate()}.${ext}`;
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

const server = app.listen(config.port, () => {
  console.log("File server listening on port: " + server.address().port);
});
