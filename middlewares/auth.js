//requirments for authentication middleware functions
const User = require("../models/user");
const jwt = require("jsonwebtoken");

//middlewares: check if user's cookie is found or not (logged in or not)
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Allahu Akbar", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

//middlewares: jwt verify, means if user's cookie holds a verified jwt
const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Allahu Akbar", (err) => {
      if (err) {
        res.redirect("/user/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/user/login");
  }
};

//exports
module.exports = { checkUser, requireAuth };
