require("dotenv-safe").config();
const express = require("express");
const http = require("http");
const https = require("https");
const helmet = require("helmet");

const {
  HTTP_PORT,
  HTTPS_PORT,
  HTTPS,
  HSTS_MAX_AGE,
  HSTS_PRELOAD,
  HSTS_INCLUDE_SUBDOMAINS,
  SSL_MIN_VERSION,
  SSL_MAX_VERSION,
  SSL_CIPHERS,
} = process.env;

const app = express();

app.use(
  helmet({
    strictTransportSecurity: parseInt(HTTPS)
      ? {
          maxAge: parseInt(HSTS_MAX_AGE),
          includeSubDomains: !!parseInt(HSTS_INCLUDE_SUBDOMAINS),
          preload:
            parseInt(HSTS_PRELOAD) &&
            parseInt(HSTS_INCLUDE_SUBDOMAINS) &&
            parseInt(HSTS_MAX_AGE) >= 31536000,
        }
      : false,
  })
);

if (parseInt(HTTPS)) {
  const options = {
    minVersion: SSL_MIN_VERSION,
    maxVersion: SSL_MAX_VERSION,
    ciphers: SSL_CIPHERS,
  };
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
