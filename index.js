require("dotenv-safe").config();
const express = require("express");
const http = require("http");
const https = require("https");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const httpRedirect = require("./middleware/httpRedirect");

const {
  HTTP_PORT,
  HTTPS_PORT,
  HTTPS,
  HSTS_MAX_AGE,
  HSTS_PRELOAD,
  HSTS_INCLUDE_SUBDOMAINS,
  SSL_CERT,
  SSL_KEY,
  SSL_MIN_VERSION,
  SSL_MAX_VERSION,
  SSL_CIPHERS,
  ECDH_CURVES,
  DH_PARAM,
} = process.env;

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      },
    },
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
  app.use(httpRedirect);
}

app.use(express.static(path.join(__dirname, "app/")));
app.get("*all", (req, res) => {
  res.sendFile(path.join(__dirname, "app/index.html"));
});

const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server started on port ${HTTP_PORT}`);
});

if (parseInt(HTTPS)) {
  const options = {
    cert: fs.readFileSync(path.join(__dirname, "ssl/", SSL_CERT)),
    key: fs.readFileSync(path.join(__dirname, "ssl/", SSL_KEY)),
    minVersion: SSL_MIN_VERSION,
    maxVersion: SSL_MAX_VERSION,
    ciphers: SSL_CIPHERS,
    ecdhCurves: ECDH_CURVES,
    dhparam: fs.readFileSync(path.join(__dirname, "ssl", DH_PARAM)),
  };
  const httpsServer = https.createServer(options, app);
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS server started on port ${HTTPS_PORT}`);
  });
}
