require("dotenv-safe").config();
const express = require("express");
const http = require("http");

const { HTTP_PORT } = process.env;

const app = express();

const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server started on port ${HTTP_PORT}`);
});
