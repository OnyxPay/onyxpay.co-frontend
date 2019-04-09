import { get } from "lodash";
import { utils } from "ontology-ts-sdk";

export function validMnemonics(value) {
  try {
    utils.parseMnemonic(value);
    return false;
  } catch (e) {
    return true;
  }
}

export function isHexadecimal(str) {
  const regexp = /^[0-9a-fA-F]+$/;

  if (regexp.test(str)) {
    return str.length % 2 === 0;
  } else {
    return false;
  }
}

export function samePassword(values) {
  const password = get(values, "password", "");
  const passwordAgain = get(values, "passwordAgain", "");

  if (password !== passwordAgain) {
    return {
      passwordAgain: "Password does not match"
    };
  }

  return {};
}

export function required(value) {
  return value === undefined || value.trim().length === 0;
}

export function range(from, to) {
  return function rangeCheck(value) {
    if (value === undefined) {
      return true;
    }

    const val = Number(value);
    return val <= from || val > to;
  };
}

export function tokenValid(value) {
  return required(value) || !isHexadecimal(value) || value.length !== 40;
}

export function gt(than) {
  return function gtCheck(value) {
    if (value === undefined) {
      return true;
    }

    const val = Number(value);
    return val <= than;
  };
}

export function gte(than) {
  return function gtCheck(value) {
    if (value === undefined) {
      return true;
    }

    const val = Number(value);
    return val < than;
  };
}
