//requirments for mocha test
const mongoose = require("mongoose");
const User = require("../models/user");
const Company = require("../models/company");
const assert = require(`assert`);
const { v4: uuidv4 } = require("uuid");

//dbURI
const dbURI = `mongodb://localhost:27017/users`; //`mongodb://localhost:27017/users`;;//`mongodb://localhost:27017/users`; //`mongodb+srv://a_01794642816:a_01794642816@afsinurcluster1.e2eue.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`; //`mongodb://localhost:27017/users`;
const dbURIoptions = {};

//mocha: connect DB before anything doing using mocha
before(async function () {
  await mongoose.connect(dbURI, dbURIoptions);
});

//mocha: drop a collection before each describe block run
let dropCompany;
let once_ = 0;
beforeEach(async function () {
  await mongoose.connection.collections.users.drop();
  dropCompany && (await mongoose.connection.collections.companies.drop());
});

//mocha: describe block for signed up user's activities
describe(`signed up user's activities`, async function () {
  let ifDeposited,
    ifWithdrew,
    historyType = { depositHistory_: null, withdrawHistory_: null };

  //local common functions
  const writeHistory_ = async (type) => {
    let user = await User.find({});
    historyType[`${type}History_`] = user[0][`${type}History`];
  };

  const createUserObj = (username, email, password) => {
    return {
      username,
      email,
      password,
      balance: !ifDeposited ? `0` : ifDeposited - (ifWithdrew && ifWithdrew),
      card: uuidv4().slice(0, 8),
      depositHistory: ifDeposited ? historyType.depositHistory_ : [],
      withdrawHistory: ifWithdrew ? historyType.withdrawHistory_ : [],
      moneyTransferHistory: [],
      receivedMoneyHistory: [],
    };
  };

  const createCompanyObj = (companyname, email, password) => {
    return {
      companyname,
      email,
      password,
      balance: !ifDeposited ? `0` : ifDeposited - (ifWithdrew && ifWithdrew),
      card: uuidv4().slice(0, 8),
      depositHistory: ifDeposited ? historyType.depositHistory_ : [],
      withdrawHistory: ifWithdrew ? historyType.withdrawHistory_ : [],
      moneyTransferHistory: [],
      receivedMoneyHistory: [],
    };
  };

  //mocha: in this describe block run every time before a it block runs (this is signup test, run signup every time a it block run in this description)
  beforeEach(async function () {
    await User.create(
      createUserObj(`testmocha123`, `testmocha123@gmial.com`, `testmocha123`)
    );

    if (once_ === 0) {
      once_++;

      console.log(`user signed up`);
    }
  });

  //mocha: it block for login test
  it(`logged in`, async function () {
    await User.login(`testmocha123@gmial.com`, `testmocha123`);
    console.log(`user logged in`);
  });

  //mocha: it block for deposit test
  it(`deposit`, async function () {
    ifDeposited = 120;

    await User.transection(`testmocha123@gmial.com`, `120`, `deposit`);
    console.log(`deposit amount: 120`);

    await writeHistory_(`deposit`);
  });

  //mocha: it block for withdraw test
  it(`withdraw`, async function () {
    ifWithdrew = 25;

    await User.transection(`testmocha123@gmial.com`, `25`, `withdraw`);
    console.log(`withdraw amount: 25`);

    await writeHistory_(`withdraw`);
  });

  //deposit history
  it(`get deposit history`, async function () {
    let user = await User.find({});

    console.log(`deposit history: `);
    user[0]["depositHistory"].forEach(({ amount, date }) => {
      console.log(`transection amount +${amount}, on ${date}`);
    });
  });

  //withdraw history
  it(`get withdraw history`, async function () {
    let user = await User.find({});

    console.log(`withdraw history: `);
    user[0]["withdrawHistory"].forEach(({ amount, date }) => {
      console.log(`transection amount -${amount}, on ${date}`);
    });
  });

  //deposit and withdraw history
  it(`get deposit and withdraw history`, async function () {
    let user = await User.find({});

    console.log(`transaction history: `);
    user[0]["depositHistory"].forEach(({ amount, date }) => {
      console.log(`transection amount +${amount}, on ${date}`);
    });
    user[0]["withdrawHistory"].forEach(({ amount, date }) => {
      console.log(`transection amount -${amount}, on ${date}`);
    });
  });

  //api total user
  //mocha: it block for api test, total user
  it(`api test: show total user`, async function () {
    let totalUser = await User.estimatedDocumentCount();
    console.log(`total user: ${totalUser}`);
  });

  //api view a person's username/email using id
  //mocha: it block for api test, view a person's username/email using id
  it(`api test: show login info of a person using card number`, async function () {
    let user = await User.find({});

    let { username, email } = await User.findOne({ card: user[0][`card`] });
    console.log(`username: ${username}, email: ${email}`);
  });

  //edit profile
  //mocha: it block for update a person's username/email using id
  it(`edit a person's profile`, async function () {
    let user = await User.find({});

    let { username, email, password } = await User.findOne({
      card: user[0][`card`],
    });
    console.log(
      `current username: ${username}, current email: ${email}, current password: testmocha123`
    );

    const query = { username, email, password };

    await User.findOneAndUpdate(query, {
      username: `testperson345`,
      email: `testperson345@gmail.com`,
      password: `testperson345`,
    });

    let {
      username: username1,
      email: email1,
      password: password1,
    } = await User.findOne({
      card: user[0][`card`],
    });
    console.log(
      `updated username: ${username1}, updated email: ${email1}, updated password: ${password1}`
    );
  });

  //extra
  //sending some money to a user/person using id
  it(`sending some money to a user's account using their card number`, async function () {
    let user2 = await User.create(
      createUserObj(`2testmocha123`, `2testmocha123@gmial.com`, `2testmocha123`)
    );

    let sendBalance = 53;

    let user1DB = await User.findOne({ email: `testmocha123@gmial.com` });

    let res = await User.transferMoneyTo(
      "testmocha123@gmial.com",
      sendBalance,
      user2[`card`]
    );

    if (res === 1) {
      console.log(
        `before sending money user: testmocha123 has money ${user1DB["balance"]}`
      );
      console.log(
        `username: ${user2["username"]}, balance is ${user2["balance"]}`
      );
      console.log(
        `balance sent ${sendBalance} to username: ${user2["username"]}, from email: testmocha123@gmial.com`
      );

      user1DB = await User.findOne({ email: `testmocha123@gmial.com` });
      console.log(
        `after sending money user: testmocha123 has money ${user1DB["balance"]}`
      );
      let userDB = await User.findOne({ email: user2[`email`] });
      console.log(
        `username: ${user2["username"]}, balance is ${userDB["balance"]}`
      );
    } else {
      console.log(res);
    }

    dropCompany = true;
  });

  //sending some money to a company
  it(`sending some money to a company using their card number`, async function () {
    let company_ = await Company.create(
      createCompanyObj(`company123`, `company123@gmial.com`, `company123`)
    );

    let sendBalance = 43;

    let user1DB = await User.findOne({ email: `testmocha123@gmial.com` });

    let res = await Company.transferMoneyTo(
      "testmocha123@gmial.com",
      sendBalance,
      company_[`card`]
    );

    if (res === 1) {
      console.log(
        `before sending money user: testmocha123 has money ${user1DB["balance"]}`
      );
      console.log(
        `company name: ${company_["companyname"]}, balance is ${company_["balance"]}`
      );
      console.log(
        `balance sent ${sendBalance} to company name: ${company_["companyname"]}, from email: testmocha123@gmial.com`
      );

      user1DB = await User.findOne({ email: `testmocha123@gmial.com` });
      console.log(
        `after sending money user: testmocha123 has money ${user1DB["balance"]}`
      );

      let companyDB = await Company.findOne({ email: company_[`email`] });
      console.log(
        `company name: ${company_["companyname"]}, balance is ${companyDB["balance"]}`
      );
    } else {
      console.log(res);
    }
  });

  //more extra
  //request a person to send money and show the pending info and adding history to that person's database
  /*it(`sending send money request to a user/person using their id and adding a pending history to their account`, async function () {
    let user2 = await User.create(
      createUserObj(`2testmocha123`, `2testmocha123@gmial.com`, `2testmocha123`)
    );

    let { status, arrObj } = await User.transferMoney(
      "person to person",
      "testmocha123@gmial.com",
      43,
      user2[`card`]
    );

    if (status === 1) {
      console.log(`send money request sent`);
      console.log(`added a pending history to reciever's account`);
      console.log(`history obj`);
      console.log(arrObj);
      console.log(`reciever's database`);
      let userDB = await User.findOne({ email: user2[`email`] });
      console.log(userDB);
    }
  });*/

  //accept/keep it pending/reject a person's transfered money and update status info to history

  //receiving transfered money and adding to account

  //if someone received transfered money and adding this status to history
});
