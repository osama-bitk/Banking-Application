//requirments for authentication mongoose model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

//local functions
const handleErrors = ({ _message, errors, keyValue, code }) => {
  let Errors = { username: "", email: "", password: "" };

  //signup errors

  if (_message === `Validation failed`) {
    Object.values(errors).forEach((properties) => {
      Errors[properties.path] = properties.message;
    });
  }

  if (code === 11000) {
    //code
    let errName = Object.keys(keyValue)[0];

    Errors[errName] = `${errName} already exists`;
  }

  return { Errors };
};

//mongoose schema object
const obj = {
  username: {
    type: String,
    unique: true,
    //lowercase: true,
    required: [true, "invalid username"],
  },
  email: {
    type: String,
    required: [true, "email required"],
    //lowercase: true,
    unique: true,
    validate: [isEmail, "invalid email"],
  },
  password: {
    type: String,
    required: [true, "invalid password"],
    minlength: [8, "password has to be minimum 8 characters long"],
  },
  card: { type: String },
  balance: { type: String },
  depositHistory: { type: Array },
  withdrawHistory: { type: Array },
  moneyTransferHistory: { type: Array },
  receivedMoneyHistory: { type: Array },
};

//mongoose schema setup
const userSchema = new Schema(obj);

//hash password before saving to DB
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

//mongoose static functions
userSchema.statics.login = async function (email, password) {
  const user = await User.findOne({ email });

  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    // console.log("password sent from client: " + password);
    // console.log(user.password);
    if (auth) {
      return user;
    }
    throw Error("invalid password");
  }
  throw Error("invalid email");
};

userSchema.statics.checkPassword = async function (email, password) {
  const user = await User.findOne({ email });

  if (user) {
    const auth = await bcrypt.compare(password, user.password);

    if (auth) {
      return 1;
    }
    throw Error("invalid password");
  }
  throw Error("invalid email");
};

userSchema.statics.transferMoneyTo = async function (
  email,
  amount,
  receiverID
) {
  let user = await User.findOne({ email });
  const receiver_ = await User.findOne({ card: receiverID });

  if (user) {
    if (receiver_) {
      if (user[`balance`] - Number(amount) >= 0) {
        let currentBLNC = Number(receiver_[`balance`]);
        let query = { card: receiverID };
        let rec_obj = {
          balance: (currentBLNC += Number(amount)),
        };

        await User.findOneAndUpdate(query, rec_obj);

        let currentUsrBLNC = Number(user[`balance`]);
        await User.findOneAndUpdate(
          { email },
          {
            balance: (currentUsrBLNC -= Number(amount)),
          }
        );

        let newUpdateArr = user[`moneyTransferHistory`];
        newUpdateArr.unshift({ amount, type: `send money`, date: new Date() });
        let update = {};
        update[`moneyTransferHistory`] = newUpdateArr;

        await User.findOneAndUpdate({ email }, update);

        //last return
        //"money transfer successful. make a GET request to localhost:3000/user/login to see the corresponding decrease in balance";
        return 1;
      } else {
        //last return
        return `not enoungh money to send`;
      }
    }
    return "invalid receiver ID";
  }
  return "invalid email";
};

userSchema.statics.putUserInfo = async function ({ localUser, update }) {
  const query = {
    username: localUser[`username`],
    email: localUser[`email`],
    password: localUser[`password`],
  };

  const gn_pss = async (password) => {
    const salt = await bcrypt.genSalt();
    const password_ = await bcrypt.hash(password, salt);

    return password_;
  };

  let updated = {};

  const changePass = async () => {
    if (update[`password`]) {
      let hs_pass = await gn_pss(update[`password`]);
      updated[`password`] = update[`password`];

      return hs_pass;
    } else {
      return 0;
    }
  };

  const opts = { runValidators: true };
  const updateQ_OBJ = {};

  if (update[`username`]) {
    updateQ_OBJ[`username`] = update[`username`];

    updated.username = true;
  }
  if (update[`email`]) {
    updateQ_OBJ[`email`] = update[`email`];

    updated.email = true;
  }
  if (update[`password`]) {
    let permissn_ = await changePass();

    if (permissn_ !== 0) {
      updateQ_OBJ[`password`] = permissn_;

      updated.password = true;
    }
  }

  try {
    await User.findOneAndUpdate(query, updateQ_OBJ, opts);

    return { updated };
  } catch (error) {
    return handleErrors(error);
  }
};

userSchema.statics.transection = async function (email, amount, method) {
  const user = await User.findOne({ email });

  if (user) {
    let insha_Allah_balance_will_be =
      method === "withdraw"
        ? Number(user.balance) - Number(amount)
        : Number(user.balance) + Number(amount);

    let historyType = `${method}History`;

    let filter = { email },
      update = { balance: insha_Allah_balance_will_be.toString() };

    let newUpdateArr = user[historyType];
    newUpdateArr.unshift({ amount, type: method, date: new Date() });

    update[historyType] = newUpdateArr;

    const isOk = await User.findOneAndUpdate(filter, update);

    if (isOk) {
      return { willRedirect: 1 };
    }
    throw Error("withdrawn failed");
  }
  throw Error("invalid email");
};

//mongoose model setup
const User = mongoose.model("user", userSchema);

//exports
module.exports = User;
