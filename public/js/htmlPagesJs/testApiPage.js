async function testFun() {
  let { get_, api_ } = q_s(`.signupForm`);
  get_.value = `getting..`;

  let api = api_.value;
  let apiInfo = await get_FTC(api);

  q_s(`.preApi`).innerHTML = JSON.stringify(apiInfo, undefined, 2);

  get_.value = `GET`;
}
