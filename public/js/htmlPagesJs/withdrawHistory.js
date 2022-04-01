(async function () {
  let { history } = await get_FTC("user/withdraw/history");

  if (history.length <= 0) {
    q_s(
      `.showTransectionHistory`
    ).innerHTML += `<p class="d6">no withdraw was made</p>`;
  } else {
    let table_ = create_(`table`);
    append_(q_s(`.showTransectionHistory`), table_);

    history.forEach(({ amount, type, date }, i) => {
      const formatDate = (date) => {
        let editedDate = ``;

        const formtDT = date.slice(0, 10);
        const formtDT_1 = date.slice(11, 16);

        editedDate = `${formtDT} ${formtDT_1}`;

        return editedDate;
      };

      const mkRedColorTableRowIfNeeded = () => {
        if (Number(amount) < 0) {
          return `
        <tr style="color: red">
          <td>${type}</td>
          <td>${amount}</td>
          <td>${formatDate(date)}</td>
        </tr>
      `;
        } else {
          return `
        <tr>
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
