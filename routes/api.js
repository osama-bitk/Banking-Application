//requirments for api routes
const { Router } = require("express");
const router = Router();
const apiFunctions = require("../controllers/api");
const cors = require("cors");

//routes
router.get("/user/total", cors(), apiFunctions.get_total_user_number);
router.get("/user/id/:card", cors(), apiFunctions.get_a_user_info);

//exports
module.exports = router;
