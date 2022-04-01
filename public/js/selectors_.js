const q_s = (e) => {
  return document.querySelector(e);
};
const qa_s = (e) => {
  return document.querySelectorAll(e);
};
const _css = (e, e1, e2) => {
  if (typeof e1 === "object") {
    Object.assign(e.style, e1);
  } else if (typeof e1 === "string") {
    e.style[e1] = e2;
  }
};
const a_class = (e, e1) => {
  let arr_ = e1.split(" ");

  arr_.forEach((clsNm) => {
    e.classList.add(clsNm.trim());
  });
};
const r_class = (e, e1) => {
  let arr_ = e1.split(" ");

  arr_.forEach((clsNm) => {
    e.classList.remove(clsNm.trim());
  });
};
const get_css = (e, e1) => {
  let if_inclues = Object.keys(window.getComputedStyle(e)).includes(e1);
  const err_ = () => {
    throw Error(`invalid property: "${e1}"`);
  };

  try {
    return if_inclues
      ? window.getComputedStyle(e).getPropertyValue(e1)
      : err_();
  } catch (error) {
    console.log(error);
  }
};
const type_ = (e) => {
  const typ_ = typeof e;
  const warn_ = () => {
    let err = new Error("Input can't be empty.");
    throw {
      Error: { error_in_line: err.stack, message: err.message },
      input: e,
    };
  };

  const data_ = (tp, cOb = "") => `data${cOb} type: ${tp}, can contain values`;
  const no_data_contains = () => `${typ_}: ${e}, cannot contain values`;
  const sm_typ_obj = () => data_(typ_, " & object");
  const dif_typ_obj = (dif) => data_(dif, " & object");

  const is_e_other_objects = () =>
    e.constructor === Date ? dif_typ_obj("date") : sm_typ_obj();

  const is_e_array = () =>
    Array.isArray(e) ? dif_typ_obj("array") : is_e_other_objects();

  const is_e_func = () => (typ_ === "function" ? data_(typ_) : sm_typ_obj());
  const is_e_object = () => (typ_ === "object" ? is_e_array() : is_e_func());

  const is_null_or_undefined = () =>
    e === null || e === undefined ? no_data_contains() : warn_();

  const is_obj_or_err = () => (e ? is_e_object() : is_null_or_undefined());

  try {
    return typ_ === "boolean" ? sm_typ_obj() : is_obj_or_err();
  } catch (er) {
    return er;
  }
};
const on_ = (e, e1, e2, e3) => {
  const warn_ = () => {
    throw Error(`4th parameter must be an object in on_()..`);
  };

  const is_e3_array = () =>
    Array.isArray(e3) ? warn_() : e.addEventListener(e1, e2, e3);

  const is_e3_object = () => (typeof e3 === "object" ? is_e3_array() : warn_());

  try {
    e3 ? is_e3_object() : e.addEventListener(e1, e2);
  } catch (e) {
    console.log(e);
  }
};
const r_listener = (e, e1, e2) => {
  e.removeEventListener(e1, e2);
};
const create_ = (e) => {
  return document.createElement(e);
};
const append_ = (e, e1) => {
  return e.appendChild(e1);
};
const s_attr = (e, e1, e2) => {
  e.setAttribute(e1, e2);
};
const r_attr = (e, e1) => {
  e.removeAttribute(e1);
};
const g_attr = (e, e1) => e.getAttribute(e1);
const _val = (e) => {
  return e.value;
};
const prevent_ = (e) => {
  return e.preventDefault();
};
