const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
// const db = require("../models");
// const User = db.user;
const errorMessage = (res) => {
  return res.status(401).json({
    status: "fail",
    message: "Authorization denied, user is not logged in.",
  });
};

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return errorMessage(res);
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      req.user = decoded.id;
      next();
    });
  } catch {
    return errorMessage(res);
  }  
};

module.exports = auth;
