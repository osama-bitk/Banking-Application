async function testFun(e) {
  console.log(e);

  if (e === "Withdraw") {
    await get_html_Page_(1, "withdrawForm", null, 1);
  }

  if (e === "Deposit") {
    await get_html_Page_(1, "depositForm", null, 1);
  }

  if (e === "transectionHistory") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "depositHistory") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "withdrawHistory") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "sendMoney") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "payA_Bill") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "editProfile") {
    await get_html_Page_(1, e, null, 1);
  }

  if (e === "Logout") {
    q_s(`input[value="Logout"]`).value = "logging out..";

    let { url } = await get_FTC("user/logout");

    if (url === "user/login") {
      location.replace("/");
    }
  }
}
