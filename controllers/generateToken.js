const generateToken = function (req, res, next) {
  req.token = req.user.generateJwt();
  next();
};

module.exports = generateToken;