(async function () {
  let { transactionHistory } = await get_FTC("user/deposit_withdraw/history");

  if (transactionHistory.length <= 0) {
    q_s(
      `.showTransectionHistory`
    ).innerHTML += `<p class="d6">no transection was made</p>`;
  } else {
    let table_ = create_(`table`);
    append_(q_s(`.showTransectionHistory`), table_);

    transactionHistory.forEach(({ amount, type, date }, i) => {
      const formatDate = (date) => {
        let editedDate = ``;

        const formtDT = date.slice(0, 10);
        const formtDT_1 = date.slice(11, 16);

        editedDate = `${formtDT} ${formtDT_1}`;

        return editedDate;
      };

      const mkRedColorTableRowIfNeeded = () => {
        if (Number(amount) < 0) {
          if (type === `pay a bill` || type === `send money`) {
            return `
        <tr style="color: #2882d3">
          <td>${type}</td>
          <td>${amount}</td>
          <td>${formatDate(date)}</td>
        </tr>
      `;
          } else {
            return `
        <tr style="color: red">
          <td>${type}</td>
          <td>${amount}</td>
          <td>${formatDate(date)}</td>
        </tr>
      `;
          }
        } else {
          return `
        <tr style="color: #24b372">
          <td>${type}</td>
          <td>${amount}</td>
          <td>${formatDate(date)}</td>
        </tr>
      `;
        }
      };

      if (i <= 0) {
        let addTXT = `
          <th>type</th>
          <th>amount</th>
          <th>date</th>
        `;

        q_s(`.showTransectionHistory table`).innerHTML += `
        <tr>
          ${addTXT}
        </tr>
        ${mkRedColorTableRowIfNeeded()}
      `;
      } else {
        q_s(`.showTransectionHistory table`).innerHTML += `
      ${mkRedColorTableRowIfNeeded()}
      `;
      }
    });
  }
})();
