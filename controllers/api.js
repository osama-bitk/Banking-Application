//requirments for api router functions
const apiFunctions = {};
const User = require("../models/user");

//local functions
const sendRes = (data, res) => {
  res.json(data);
};

//main router functions
apiFunctions.get_a_user_info = async (req, res) => {
  let { card } = req.params;

  try {
    let user = await User.findOne({ card });

    if (user) {
      let { username, email } = user;

      sendRes({ username, email }, res);
    } else {
      throw Error("user not found");
    }
  } catch ({ message }) {
    sendRes({ error: message }, res);
  }
};
apiFunctions.get_total_user_number = async (req, res) => {
  try {
    let total_user_num = await User.estimatedDocumentCount();

    if (total_user_num) {
      sendRes({ total: total_user_num }, res);
    } else {
      throw Error("can't get the number");
    }
  } catch ({ message }) {
    sendRes({ error: message }, res);
  }
};

//exports
module.exports = apiFunctions;
