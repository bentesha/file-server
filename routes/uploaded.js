const express = require("express");
const config = require("../config");
const path = require("path");
const fs = require("fs");
const utils = require("../utils");

const fileExists = path => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, error => {
      resolve(!error);
    });
  });
};

const router = express.Router();

router.get("/:file", ({ params }, response, next) => {
  const file = params.file;
  if(path.extname(file).toLowerCase() === '.pdf'){
    //Prevent directly opening pdf files
    return next();
  }
  const fileName = path.join(config.uploadDir, file);
  response.sendFile(fileName);
});

router.get("/:file/:size", async (request, response, next) => {
  const { file, size } = request.params;
  const filePath = path.join(config.uploadDir, file);
  //Check if file exists
  if (!(await fileExists(filePath).catch(next))) {
    return next();
  }
  const resizedFileName = utils.image.getResizedFileName(file, size);
  if (!resizedFileName) {
    return next();
  }
  const resizedFilePath = path.join(config.resizedImagesDir, resizedFileName);
  if (await fileExists(resizedFilePath).catch(next)) {
    response.sendFile(resizedFilePath);
  } else {
    //Resize image
    utils.image
      .resizeImage(filePath, resizedFilePath, size)
      .then(() => {
        response.sendFile(resizedFilePath);
      })
      .catch(next);
  }
});

module.exports = router;