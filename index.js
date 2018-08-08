const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log("File server listening on port: " + server.address().port);
});