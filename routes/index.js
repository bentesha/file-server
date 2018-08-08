const express = require("express");
const staticRoute = require("./uploaded");
const uploadRoute = require("./upload");

const router = express.Router();

router.use("/upload", uploadRoute);
router.use("/uploaded", staticRoute);

module.exports = router;