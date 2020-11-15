const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  
  // Ensure Token is not null

  const token = req.header("x-access-token");

  if (!token) {
    return res.status(401).json({ msg: "Token missing. Access denied." });
  }

  try {
    //Decode the received Token
    const decoded = jwt.verify(token, config.get("JWT_SECRET"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token. Access denied." });
  }
};
