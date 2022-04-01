let editUnitContainerArr = Array.from(qa_s(`.editUnitContainer`));

let dataBox,
  passCanCng = 0;

editUnitContainerArr.forEach((itm) => {
  itm.innerHTML += `
        <div class="editContainer">
            <button onclick="openEdit_(this)">&#128394;</button>

            <div class="finaleActionContainer">
                <button id="closeEdit_ided" onclick="closeEdit_(this)">&#10006;</button>
                <button onclick="justDoEdit_(this)">&#10004;</button>
            </div>
        </div>
    `;
});

async function setProInfo() {
  let user_ = await getUserInfo();
  dataBox = user_;

  for (const k in user_) {
    if (Object.hasOwnProperty.call(user_, k)) {
      const el = user_[k];

      k !== `password`
        ? q_s(`.editUnitContainer input[name="ed_${k}_"]`) &&
          (q_s(`.editUnitContainer input[name="ed_${k}_"]`).value = el)
        : false;
    }
  }
}

function openEdit_(e) {
  let multipleDOM = e.parentNode.parentNode.children[0];

  e.parentNode.children[1].style["display"] = `flex`;

  multipleDOM.style["display"] = `block`;
  r_attr(multipleDOM, `readonly`);

  e.style["display"] = `none`;

  let nm_ = g_attr(multipleDOM, "name");

  const dyn_word = `${nm_.slice(3, nm_.length - 1)}`;
  if (dyn_word === `password`) {
    q_s(`div._divShadowType`).style[`display`] = `flex`;
  }
}

function closeEdit_(e) {
  e.parentNode.style["display"] = `none`;
  e.parentNode.parentNode.parentNode.children[0].style["display"] = `none`;

  e.parentNode.parentNode.children[0].style["display"] = `block`;

  (async () => await setProInfo())();
}

function cancel_old_pass(e) {
  q_s(`div._divShadowType`).style[`display`] = `none`;
  q_s(`#giveOldPassword .error`).innerHTML = ``;
  q_s(`#giveOldPassword #oldPass`).value = ``;

  qa_s(`.editUnitContainer`)[2].children[1].children[1].children[0].click();
}

async function ok_old_pass(e) {
  q_s(`#giveOldPassword .error`).innerHTML = ``;

  let password = e.parentNode.parentNode.children[1].value;

  let res_ = await post_FTC(`user/check/password`, { password });
  if (res_[`password`] === `invalid password`) {
    q_s(`#giveOldPassword .error`).innerHTML = `password does not match`;
  } else {
    q_s(`div._divShadowType`).style[`display`] = `none`;
    passCanCng = 1;
  }
}

async function justDoEdit_(e) {
  let val_ = e.parentNode.parentNode.parentNode.children[0].value;
  let nm_ = g_attr(e.parentNode.parentNode.parentNode.children[0], "name");

  const dyn_word = `${nm_.slice(3, nm_.length - 1)}`;

  //common function
  const doUpdates = async (pass) => {
    q_s(`.successUpdate`).innerHTML = `updating..`;

    if (val_ === dataBox[dyn_word]) {
      q_s(
        `.successUpdate`
      ).innerHTML = `<div class="error">can not update same ${dyn_word}</div>`;
    } else {
      //common function
      const doFinaleUpdate = async () => {
        const updateQ_OBJ = {};
        updateQ_OBJ[dyn_word] = val_;

        let res_ = await post_FTC(`user/info/update`, updateQ_OBJ);

        if (res_.updated) {
          q_s(`.successUpdate`).innerHTML = `${dyn_word} successfully updated`;
          closeEdit_(e);
        } else {
          let { Errors } = res_;

          q_s(
            `.successUpdate`
          ).innerHTML = `<div class="error">${Errors[dyn_word]}</div>`;
        }
      };

      if (pass) {
        let res_ = await post_FTC(`user/check/password`, { password: pass });

        if (res_ !== 1) {
          await doFinaleUpdate();
        } else {
          q_s(
            `.successUpdate`
          ).innerHTML = `<div class="error">can not update same ${dyn_word}</div>`;
        }
      } else {
        await doFinaleUpdate();
      }
    }
  };

  if (val_ === "") {
    q_s(
      `.successUpdate`
    ).innerHTML = `<div class="error">invalid ${dyn_word}</div>`;
  } else {
    if (dyn_word !== `password`) {
      await doUpdates();
    } else {
      passCanCng === 1
        ? await doUpdates(val_)
        : alert(`please dont try to cheat and give the old password`);
    }
  }
}

//init
(async () => await setProInfo())();
