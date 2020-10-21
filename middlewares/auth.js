const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header

  const token = req.header("x-auth-token");

  //Check if not token

  if (!token) {
    return res.status(401).json({ msg: "No token. Access denied." });
  }

  try {
    //Decode the token
    const decoded = jwt.verify(token, config.get("JWT_SECRET"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token. Access denied." });
  }
};
