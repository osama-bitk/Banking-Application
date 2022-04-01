//requirments for authentication middleware functions
const Company = require("../models/company");
const jwt = require("jsonwebtoken");

//middlewares: check if user's cookie is found or not (logged in or not)
const checkUser1 = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Allahu Akbar again", async (err, decodedToken) => {
      if (err) {
        res.locals.company = null;
        next();
      } else {
        const user = await Company.findById(decodedToken.id);
        res.locals.company = user;
        next();
      }
    });
  } else {
    res.locals.company = null;
    next();
  }
};

//middlewares: jwt verify, means if user's cookie holds a verified jwt
const requireAuth1 = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Allahu Akbar again", (err) => {
      if (err) {
        res.redirect("/user/login/company");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/user/login/company");
  }
};

//exports
module.exports = { checkUser1, requireAuth1 };
