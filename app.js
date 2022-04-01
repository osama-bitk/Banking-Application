//requires
const express = require("express");
const app = express();
const port = process.env.PORT || "3000";
const listen = () => {
  console.log(`listening on port: ${port}`);
};
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

//local requires
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const { checkUser, requireAuth } = require("./middlewares/auth");
const { checkUser1, requireAuth1 } = require("./middlewares/company");

//view engine setup
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//dbURI
const dbURI = `mongodb://localhost:27017/users`; //`mongodb+srv://a_01794642816:a_01794642816@afsinurcluster1.e2eue.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const dbURIoptions = {};
//connection function
(async () => {
  try {
    await mongoose.connect(dbURI, dbURIoptions);
    console.log(`DB connected!`);

    app.listen(port, listen);
  } catch (error) {
    console.log(`${error}`);
  }
})();

//routes
app.get("*", checkUser, checkUser1);

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/show_users", checkUser, requireAuth, (req, res) => {
  res.json({ method: "GET", url: "show_users", user: res.locals.user });
});

app.get("/show_users1", checkUser1, requireAuth1, (req, res) => {
  res.json({ method: "GET", url: "show_users1", company: res.locals.company });
});

app.use("/api", apiRoutes);
app.use("/user", authRoutes);
