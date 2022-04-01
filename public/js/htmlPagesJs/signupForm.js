let radioVal_;
function ckeckIt(e) {
  e.children[0].checked = true;
  let preValue = e.children[0].value;

  radioVal_ = preValue;
}

async function testFun() {
  q_s(`div.ckBx_err`).innerHTML = ``;

  if (radioVal_ === undefined) {
    q_s(`div.ckBx_err`).innerHTML = `select e signup type`;
  } else {
    let { username_, email_, password_, signup_ } = q_s(`.signupForm`);
    signup_.value = `signing up..`;

    let email = email_.value;
    let password = password_.value;

    console.log(radioVal_);

    if (radioVal_ === "SignupRadioUser") {
      let username = username_.value;
      let signupInfo = await post_FTC("user/signup", {
        username,
        email,
        password,
      });

      let { url } = signupInfo;

      if (url === "user/login") {
        get_html_Page_(q_sa(".header ul li a")[1], "loginForm", null, 1);
      } else {
        handle_error(signupInfo);
        signup_.value = `Signup`;
      }
    } else {
      let username = username_.value;
      let signupInfo = await post_FTC("user/signup/company", {
        companyname: username,
        email,
        password,
      });

      let { url } = signupInfo;
      console.log(url);

      if (url === "user/login/company") {
        get_html_Page_(q_sa(".header ul li a")[1], "loginForm", null, 1);
      } else {
        handle_error(signupInfo);
        signup_.value = `Signup`;
      }
    }
  }
}
