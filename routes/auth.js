//requirments for authantication routes
const { Router } = require("express");
const router = Router();
const authFunctions = require("../controllers/auth");
const { checkUser } = require("../middlewares/auth");
const { checkUser1 } = require("../middlewares/company");

//routes
router.get("/signup", authFunctions.get_signup);
router.get("/signup/company", authFunctions.get_signup_company);
router.get("/login", authFunctions.get_login);
router.get("/login/company", authFunctions.get_login_company);
router.get("/logout", authFunctions.get_logout);
router.get("/withdraw", authFunctions.get_withdraw);
router.get("/deposit", authFunctions.get_deposit);
router.get("/withdraw/history", authFunctions.get_withdraw_history);
router.get("/deposit/history", authFunctions.get_deposit_history);
router.get(
  "/deposit_withdraw/history",
  authFunctions.get_deposit_withdraw_history
);

router.post("/signup", authFunctions.post_signup);
router.post("/signup/company", authFunctions.post_signup_company);
router.post("/login", authFunctions.post_login);
router.post("/login/company", authFunctions.post_login_company);
router.post("/withdraw", checkUser, checkUser1, authFunctions.post_withdraw);
router.post("/deposit", checkUser, checkUser1, authFunctions.post_deposit);
router.post("/info/update", checkUser, authFunctions.post_user_info_update);
router.post(
  "/money/transfer/user",
  checkUser,
  authFunctions.post_transferMoney
);
router.post(
  "/money/transfer/company",
  checkUser1,
  authFunctions.post_transferMoney
);
router.post("/check/password", checkUser, authFunctions.post_check_password);

//exports
module.exports = router;
