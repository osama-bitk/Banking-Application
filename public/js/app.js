/*
 note: on root directory in
  public/js/ the folder "htmlPageJs" contains all the js files
  that controlls all the functionalities of this app
  in that folder all the js file names explain what it implements
*/

// common function for querySelectorAll
const q_sa = (e) => document.querySelectorAll(e);
// while page content is loading run this function everytime
const msg_load = () =>
  (q_s(".inside_app").innerHTML = `<p class="d6">loading..</p>`);
// set div.app height after loading some content in the page
const setInitAppHeight = () => {
  let set_app_height = q_s("body").clientHeight - q_s(".header").clientHeight;
  q_s(".app").style["height"] = `${set_app_height}px`;
};
// nav links controller function
const hideNavLinks = (e) => {
  if (e === 0) {
    q_sa(".header ul li a").forEach((itm, i) => {
      itm.style["display"] = `none`;
    });
  } else {
    q_sa(".header ul li a").forEach((itm, i) => {
      itm.style["display"] = `block`;
    });
  }
};
// reset or set nav links color
const reset_NavLinksColor = (target) => {
  if (target !== 1) {
    hideNavLinks(1);
    let tr_attr = target.getAttribute("href");

    q_sa(".header ul li a").forEach((itm) => {
      let itm_attr = itm.getAttribute("href");

      itm_attr === tr_attr
        ? (itm.style["color"] = `#f2f7fa`)
        : (itm.style["color"] = `#cbcccc`);
    });
  } else {
    hideNavLinks(0);
  }
};
// common html code fetch function
const get_html_FTC = async (url) => {
  try {
    let res = await fetch(url);
    if (res.ok) {
      let out_data = await res.text();
      return out_data;
    } else {
      throw Error("can't get_FTC");
    }
  } catch ({ message }) {
    return message && null;
  }
};
// common fetch function for getting data
const get_FTC = async (url) => {
  try {
    let res = await fetch(url);
    if (res.ok) {
      let out_data = await res.json();
      return out_data;
    } else {
      throw Error(`can't get ${res.url}`);
    }
  } catch ({ message }) {
    return message;
  }
};
// common fetch function for posting data
const post_FTC = async (url, data) => {
  let res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let out_data = await res.json();
  return out_data;
};
// common fetch function for getting html and js codes
const get_html_Page_ = async (target, get, msg, getScript) => {
  msg_load();
  reset_NavLinksColor(target);
  let signupForm, script_;

  if (get) {
    signupForm = await get_html_FTC(`../html/${get}.html`);
  } else {
    signupForm = msg;
  }

  getScript &&
    ((script_ = document.createElement("script")),
    (script_[`src`] = `../js/htmlPagesJs/${get}.js`),
    script_.setAttribute(`defer`, ``));

  q_s(".inside_app").innerHTML = `${signupForm}`;
  script_ && q_s(".inside_app").appendChild(script_);
};
// common function for user dashboard data controll and implement on page
const setDashboardData = (div, user) => {
  div.childNodes.forEach((cld) => {
    if (cld.nodeName === "P") {
      if (cld.childNodes[1].nodeName === "SPAN") {
        let slc = cld.childNodes[1];
        let spn_clss = cld.childNodes[1].classList[0];

        if (
          user[`companyname`] &&
          !div.childNodes[1].innerHTML.includes(`companyname`)
        ) {
          slc.textContent = user[`companyname`];

          let replaced_html = cld.innerHTML.replace("username", "companyname");
          cld.innerHTML = replaced_html;

          let INParr = Array.from(qa_s(`.dashboardOptionsContainer input`));
          INParr.forEach((itm) => {
            if (!(itm.value === `Logout`)) {
              itm.remove();
            }
          });
        } else {
          user[spn_clss] && (slc.textContent = user[spn_clss]);
        }
      }
    }
  });
};
// common function for getting logged in user information
const getUserInfo = async () => {
  let data = await get_FTC("show_users");
  let { url, user } = data;

  if (url === "show_users") {
    return user;
  } else {
    return false;
  }
};
// common function for getting logged in company information
const getCompanyInfo = async () => {
  let data = await get_FTC("show_users1");
  let { url, company } = data;

  if (url === "show_users") {
    return company;
  } else {
    return false;
  }
};
// common function for user/company money transfer
const commonTransferMoney = async (
  amount_,
  recID_,
  send_money_,
  showMsg_Div,
  to_
) => {
  send_money_.value = `sending..`;

  let amount = amount_.value;
  let receiverID = recID_.value;

  let user = await getUserInfo();

  let { message } = await post_FTC(`user/money/transfer/${to_}`, {
    recipientType: to_,
    email: user.email,
    amount,
    receiverID,
  });

  showMsg_Div.innerHTML = "";
  if (message === 1) {
    showMsg_Div.innerHTML = `
        <p style="color:#0a0">
          money was sent successfully, amount: <span style="color:#00a">${amount}</span>. please wait..
        </p>
      `;
    send_money_.value = `Send`;

    amount_.value = ``;
    recID_.value = ``;

    setTimeout(async () => {
      await get_html_Page_(1, "userDashboard", null, 1);

      let agn_user = await getUserInfo();
      setDashboardData(q_s(".dashboard div:nth-child(1)"), agn_user);
    }, 3000);
  } else {
    showMsg_Div.innerHTML = `<div class="error">${message}</div>`;
    send_money_.value = `Send`;
  }
};
// common function for handling errors while submitting any html form
const handle_error = (error) => {
  for (const k in error) {
    if (Object.hasOwnProperty.call(error, k)) {
      const el = error[k];

      if (q_s(`.signupForm`)[`${k}_`]) {
        q_s(`.signupForm`)[`${k}_`].nextElementSibling.textContent = el;
      } else {
        if (k === "companyname") {
          q_s(`.signupForm`)[`username_`] &&
            (q_s(`.signupForm`)[`username_`].nextElementSibling.textContent =
              el);
        }
      }
    }
  }
};
// get clicks and clicked urls from inside div.inside_app and implement that
const enRoute = (route, target) => {
  if (route === "/") {
    get_html_Page_(target, "homePage", null, 1);
  }

  if (route === "user/signup") {
    get_html_Page_(1, "signupForm", null, 1);
  }

  if (route === "user/login") {
    get_html_Page_(target, "loginForm", null, 1);
  }

  if (route === "user/api") {
    get_html_Page_(1, "apiPage");
  }

  if (route === "user/testapi") {
    get_html_Page_(1, "testApiPage", null, 1);
  }
};
// implement click events outside of div.inside _app
q_sa(".header ul li a").forEach((itm) => {
  itm.addEventListener("click", (e) => {
    e.preventDefault();
    let route = e.target.getAttribute("href");

    enRoute(route, e.target);
  });
});
// implement click events inside div.inside_app
q_s(".inside_app").addEventListener("click", (e) => {
  e.preventDefault();
  let tr = e.target;

  if (tr.nodeName === "A") {
    let route = tr.getAttribute("href");

    enRoute(route, tr);
  }
});

//init
// hide all nav links
hideNavLinks(0);
// show loading message
msg_load();
// check if user logged in or not and show UI according to that
(async () => {
  let data = await get_FTC("show_users");
  let { url, user } = data;

  if (url === "show_users") {
    await get_html_Page_(1, "userDashboard", null, 1);
    setDashboardData(q_s(".dashboard div:nth-child(1)"), user);
  } else {
    let data_ = await get_FTC("show_users1");
    let { url, company } = data_;

    if (url === "show_users1") {
      await get_html_Page_(1, "userDashboard", null, 1);
      setDashboardData(q_s(".dashboard div:nth-child(1)"), company);
    } else {
      get_html_Page_(q_sa(".header ul li a")[0], "homePage", null, 1);
    }
  }
  //set height
  setInitAppHeight();
})();
