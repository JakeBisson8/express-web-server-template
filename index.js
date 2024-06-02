require("dotenv-safe").config();
const express = require("express");
const http = require("http");
const https = require("https");
const helmet = require("helmet");

const { HTTP_PORT, HTTPS_PORT, HTTPS } = process.env;

const app = express();

app.use(helmet());

if (parseInt(HTTPS)) {
  const options = {};
  const httpsServer = https.createServer(options, app);
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS server started on port ${HTTPS_PORT}`);
  });
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server started on port ${HTTP_PORT}`);
  });
}
