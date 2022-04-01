async function testFun() {
  let { amount_, recID_, send_money_ } = q_s(`.signupForm`);
  let showMsg_Div = q_s(`div.sendSuccess`);

  await commonTransferMoney(
    amount_,
    recID_,
    send_money_,
    showMsg_Div,
    `company`
  );
}
