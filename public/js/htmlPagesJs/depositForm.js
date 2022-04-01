async function testFun() {
  let { deposit_, amount_ } = q_s(`.signupForm`);

  if (amount_.value < 1) {
    q_s(".inValAmountErr").style[`display`] = `block`;
  } else {
    q_s(".inValAmountErr").style[`display`] = `none`;
    deposit_.value = `depositing..`;

    let { email } = await getUserInfo();
    let amount = amount_.value;

    let { url, user, error } = await post_FTC("user/deposit", {
      email,
      amount,
    });

    if (error) {
      get_html_Page_(1, null, error);
    } else {
      if (url === "show_users") {
        await get_html_Page_(1, "userDashboard", null, 1);
        setDashboardData(q_s(".dashboard div:nth-child(1)"), user);
      }
    }
  }
}
