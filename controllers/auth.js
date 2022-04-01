//requirments for authantication route functions
const authFunctions = {};
const User = require("../models/user");
const Company = require("../models/company");
const jwt = require("jsonwebtoken");
const maxAge = 3 * 24 * 60 * 60 * 240000;
const httpOnly = true;
const { v4: uuidv4 } = require("uuid");

//temporary object
let res_json = {
  method: "",
  url: "",
};

//local functions
const createToken = (id) => {
  return jwt.sign({ id }, "Allahu Akbar", { expiresIn: maxAge });
};

const createCompanyToken = (id) => {
  return jwt.sign({ id }, "Allahu Akbar again", { expiresIn: maxAge });
};

const handleErrors = (error, res, isCompany) => {
  let Errors;
  isCompany
    ? (Errors = { companyname: "", email: "", password: "", card: "" })
    : (Errors = { username: "", email: "", password: "", card: "" });

  //signup errors

  if (error._message === `user validation failed`) {
    Object.values(error.errors).forEach((properties) => {
      Errors[properties.path] = properties.message;
    });
  }

  if (error._message === `company validation failed`) {
    Object.values(error.errors).forEach((properties) => {
      Errors[properties.path] = properties.message;
    });
  }

  if (error.code === 11000) {
    let errName = Object.keys(error.keyValue)[0];

    Errors[errName] = `${errName} already exists`;
  }

  //login error
  if (error.message === `invalid password`) {
    Errors.password = "invalid password";
  }

  if (error.message === `invalid email`) {
    Errors.email = "invalid email";
  }

  res.json(Errors);

  isCompany
    ? (Errors = { companyname: "", email: "", password: "", card: "" })
    : (Errors = { username: "", email: "", password: "", card: "" });
};

const setCookie = (user, res, red) => {
  const token = createToken(user.id);
  res.cookie("jwt", token, { maxAge, httpOnly }); //on production replace httpOnly to-> secure: true
  res.redirect(`/${red}`);
};

const setCompanyCookie = (user, res, red) => {
  const token = createCompanyToken(user.id);
  res.cookie("jwt", token, { maxAge, httpOnly }); //on production replace httpOnly to-> secure: true
  res.redirect(`/${red}`);
};

const transection_method = async (method, email, amount, res) => {
  const doTryCatch = async () => {
    try {
      const { willRedirect } = await User.transection(email, amount, method);

      if (willRedirect === 1) {
        res.redirect("/show_users");
      }
    } catch (error) {
      handleErrors(error, res);
    }
  };

  const ckeckMoney = async () => {
    let user;
    if (method === "withdraw") {
      user = await User.findOne({ email });
    }

    if (isNaN(amount)) {
      return true;
    } else {
      if (method === "withdraw") {
        if (Number(user.balance) - Number(amount) < 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  };

  let isWithdrawOK_ = (await ckeckMoney()) ? 0 : doTryCatch();

  if (isWithdrawOK_ === 0) {
    let res_json = {};

    //res_json.method = "POST";
    //res_json.url = "user/withdraw";
    res_json.error =
      method === "withdraw"
        ? `you don't have enough money to withdraw`
        : `invalid amount`;

    res.json(res_json);
  }
};

function userIsLoggedIn(email) {
  return email !== null;
}

//main authantication router functions
authFunctions.get_signup = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/signup";
  res_json.user = res.locals.user;

  res.json(res_json);
};
authFunctions.get_signup_company = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/signup/company";
  res_json.user = res.locals.user;

  res.json(res_json);
};
authFunctions.get_login = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/login";
  res_json.user = res.locals.user;

  delete res_json.update;
  res.json(res_json);
};
authFunctions.get_login_company = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/login/company";
  res_json.user = res.locals.user;

  res.json(res_json);
};
authFunctions.get_logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1, httpOnly });

  res.redirect("/show_users");
};
authFunctions.get_withdraw = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/withdraw";
  let { email } = res.locals.user;
  res_json.user = email;

  res.json(res_json);
};
authFunctions.get_deposit = (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/deposit";
  let { email } = res.locals.user;
  res_json.user = email;

  res.json(res_json);
};
authFunctions.get_withdraw_history = async (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/withdraw/history";

  try {
    let { email } = res.locals.user;

    const user = await User.findOne({ email });
    res_json.history = user["withdrawHistory"];

    delete res_json.method;
    delete res_json.url;

    delete res_json.user;
    res.json(res_json);
  } catch (error) {
    res.send("User not logged in. Please login to continue");
  }
};
authFunctions.get_deposit_history = async (req, res) => {
  res_json.method = "GET";
  res_json.url = "user/deposit/history";

  let e = res.locals.user;
  if (userIsLoggedIn(e)) {
    let { email } = res.locals.user;
    const user = await User.findOne({ email });
    res_json.history = user["depositHistory"];

    delete res_json.method;
    delete res_json.url;

    delete res_json.user;
    res.json(res_json);
  } else {
    res.send("Please login to continue");
  }
};
authFunctions.get_deposit_withdraw_history = async (req, res) => {
  let e = res.locals.user;

  if (userIsLoggedIn(e)) {
    let { email } = res.locals.user;

    const user = await User.findOne({ email });
    let edit_ = user["withdrawHistory"].map((itm) => {
      let before_ = itm.amount;
      itm.amount = `-${before_}`;

      return itm;
    });
    let edit_sendMoney = user["moneyTransferHistory"].map((itm) => {
      let before_ = itm.amount;
      itm.amount = `-${before_}`;

      return itm;
    });
    let newHistory = [...user["depositHistory"], ...edit_, ...edit_sendMoney];
    let sorted_ = newHistory.sort((a, b) => {
      return b.date - a.date;
    });

    res.json({ transactionHistory: sorted_ });
  } else {
    res.send("Please login to continue");
  }
};

authFunctions.post_signup = async (req, res) => {
  try {
    req.body.balance = "0";
    req.body.card = uuidv4().slice(0, 8);
    req.body.depositHistory = [];
    req.body.withdrawHistory = [];
    moneyTransferHistory = [];
    receivedMoneyHistory = [];

    await User.create(req.body);
    res.redirect("/user/login");
  } catch (error) {
    handleErrors(error, res);
  }
};
authFunctions.post_signup_company = async (req, res) => {
  try {
    req.body.balance = "0";
    req.body.card = uuidv4().slice(0, 8);
    req.body.depositHistory = [];
    req.body.withdrawHistory = [];
    moneyTransferHistory = [];
    receivedMoneyHistory = [];

    await Company.create(req.body);
    res.redirect("/user/login/company");
  } catch (error) {
    handleErrors(error, res, true);
  }
};
authFunctions.post_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    setCookie(user, res, "show_users");
  } catch (error) {
    handleErrors(error, res);
  }
};
authFunctions.post_login_company = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Company.login(email, password);

    setCompanyCookie(user, res, "show_users1");
  } catch (error) {
    handleErrors(error, res, true);
  }
};
// authFunctions.post_withdraw = async (req, res) => {
//   let e = res.locals.user;
//   if (userIsLoggedIn(e)) {
//     const { email, amount } = req.body;
//     transection_method("withdraw", email, amount, res);
//   }
//   else {
//     res.send("Please login to continue");
//   }
// };
authFunctions.post_withdraw = async (req, res) => {
  let u = res.locals.user;

  if (u.email !== req.body.email) {
    res.send("Invalid email");
  } else {
    const { email, amount } = req.body;
    transection_method("withdraw", email, amount, res);
  }
};
authFunctions.post_deposit = async (req, res) => {
  let u = res.locals.user;
  if (u.email !== req.body.email) {
    res.send("Invalid email");
  } else {
    const { email, amount } = req.body;
    transection_method("deposit", email, amount, res);
  }
};
authFunctions.post_user_info_update = async (req, res) => {
  const { username, email, password } = req.body;

  let {
    username: local_username,
    email: local_email,
    password: local_password,
  } = res.locals.user;

  let res_update = await User.putUserInfo({
    localUser: {
      username: local_username,
      email: local_email,
      password: local_password,
    },
    update: {
      username,
      email,
      password,
    },
  });

  res.json(res_update);
};
authFunctions.post_transferMoney = async (req, res) => {
  const { recipientType, email, amount, receiverID } = req.body;
  let message;

  if (recipientType === `user`) {
    message = await User.transferMoneyTo(email, amount, receiverID);
  } else if (recipientType === `company`) {
    message = await Company.transferMoneyTo(email, amount, receiverID);
  }

  res.json({ message });
};
authFunctions.post_check_password = async (req, res) => {
  let { email } = res.locals.user;
  let { password } = req.body;

  try {
    let res_ = await User.checkPassword(email, password);

    res.json(res_);
  } catch (error) {
    handleErrors(error, res);
  }
};

//exports
module.exports = authFunctions;
