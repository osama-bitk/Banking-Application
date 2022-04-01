//requirments for authentication mongoose model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

//mongoose schema object
const obj = {
  companyname: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "invalid company name"],
  },
  email: {
    type: String,
    required: [true, "email required"],
    lowercase: true,
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
const companySchema = new Schema(obj);

//hash password before saving to DB
companySchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
//mongoose static functions
companySchema.statics.login = async function (email, password) {
  const company = await Company.findOne({ email });

  if (company) {
    const auth = await bcrypt.compare(password, company.password);

    if (auth) {
      return company;
    }
    throw Error("invalid password");
  }
  throw Error("invalid email");
};

/*companySchema.statics.transection = async function (email, amount, method) {
  const company = await Company.findOne({ email });

  if (company) {
    let insha_Allah_balance_will_be =
      method === "withdraw"
        ? Number(company.balance) - Number(amount)
        : Number(company.balance) + Number(amount);

    let historyType = `${method}History`;

    let filter = { email },
      update = { balance: insha_Allah_balance_will_be.toString() };

    let newUpdateArr = company[historyType];
    newUpdateArr.push({ amount, date: new Date() });

    update[historyType] = newUpdateArr;

    const isOk = await company.findOneAndUpdate(filter, update);

    if (isOk) {
      return { willRedirect: 1 };
    }
    throw Error("withdrawn failed");
  }
  throw Error("invalid email");
};*/

companySchema.statics.transferMoneyTo = async function (
  email,
  amount,
  receiverID
) {
  let user = await User.findOne({ email });
  const receiver_ = await Company.findOne({ card: receiverID });

  if (user) {
    if (receiver_) {
      if (user[`balance`] - Number(amount) >= 0) {
        let currentBLNC = Number(receiver_[`balance`]);
        let query = { card: receiverID };
        let rec_obj = {
          balance: (currentBLNC += Number(amount)),
        };

        await Company.findOneAndUpdate(query, rec_obj);

        let currentUsrBLNC = Number(user[`balance`]);
        await User.findOneAndUpdate(
          { email },
          {
            balance: (currentUsrBLNC -= Number(amount)),
          }
        );

        let newUpdateArr = user[`moneyTransferHistory`];
        newUpdateArr.unshift({ amount, type: `pay a bill`, date: new Date() });
        let update = {};
        update[`moneyTransferHistory`] = newUpdateArr;

        await User.findOneAndUpdate({ email }, update);

        //last return
        //return "money transfer succesful. please make a get request to /user/login to see the decrease in balance";
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

//mongoose model setup
const Company = mongoose.model("company", companySchema);

//exports
module.exports = Company;
