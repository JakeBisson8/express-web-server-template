const httpRedirect = (req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect(301, `https://${req.headers.host}${req.url}`);
};

module.exports = httpRedirect;
