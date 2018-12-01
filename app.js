const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const morgan = require("morgan");

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(routes);

module.exports = app;