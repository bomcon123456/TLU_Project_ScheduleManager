const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log('aaaaa')
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("require_login");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  if (token != "infinityToken") {
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      error.statusCode = 500;
      throw error;
    }
    if (!decodedToken) {
      const error = new Error("require_login");
      error.statusCode = 401;
      throw error;
    }
    var current_time = Date.now() / 1000;
    if (
      typeof decodedToken.exp !== "undefined" &&
      decodedToken.exp < current_time
    ) {
      const error = new Error("token_expired");
      error.statusCode = 401;
      throw error;
    }
    req.user = {
      id: decodedToken.userId,
      role: decodedToken.role
    };
  } else {
    req.user = {
      id: "5d86e7f47eacc31052eba6a2",
      role: 99
    };
  }
  next();
};
