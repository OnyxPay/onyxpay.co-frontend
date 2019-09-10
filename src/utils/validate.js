import { get } from "lodash";
import { utils, Crypto } from "ontology-ts-sdk";
import { deserializePrivateKey } from "../api/wallet";

const PrivateKey = Crypto.PrivateKey;

export function isMnemonicsValid(value) {
	try {
		utils.parseMnemonic(value);
		return true;
	} catch (e) {
		return false;
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

export function isPkValid(privateKeyStr) {
	try {
		if (privateKeyStr.length === 52) {
			// hex
			PrivateKey.deserializeWIF(privateKeyStr);
		} else {
			// base58
			deserializePrivateKey(privateKeyStr);
		}
		return true;
	} catch (error) {
		return false;
	}
}

export function samePassword(values) {
	const password = get(values, "password", "");
	const passwordAgain = get(values, "password_confirm", "");

	if (password !== passwordAgain) {
		return {
			password_confirm: "Password does not match",
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

export function isEmailValid(value) {
	return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
}

export function isBase58Address(address) {
	try {
		new Crypto.Address(address).toHexString();
		return true;
	} catch (error) {
		return false;
	}
}

export function isLatinChars(value) {
	return /^[A-Za-z \-.—]+$/i.test(value);
}

export function countDecimals(value) {
	if (Math.floor(value) !== value) {
		return value.toString().split(".")[1].length || 0;
	}
	return 0;
}
