import { Crypto, utils } from "ontology-ts-sdk";
import { addressOfHead } from "../api/constants";

export const gasPrice = 500;
export const gasLimit = 90000;

export function getHeadContractAddress() {
	return new Crypto.Address(addressOfHead);
}

export function reverseAddressHex(str) {
	return new Crypto.Address(utils.reverseHex(str));
}

export function cryptoAddress(address) {
	return new Crypto.Address(address);
}

export function cryptoPrivateKey(key) {
	return new Crypto.PrivateKey(key);
}

export function hexArrToArr(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		if (Array.isArray(arr[i])) {
			res.push({ [utils.hexstr2str(arr[i][0])]: utils.hexstr2str(arr[i][1]) });
		} else if (typeof arr[i] === "string" && arr[i] !== null) {
			res.push(utils.hexstr2str(arr[i]));
		}
	}
	return res;
}

// TODO: parse numbers
export function parseExchangeRates(arr) {
	let res = [];

	for (let i = 0; i < arr.length; i++) {
		let sell = parseInt(utils.reverseHex(arr[i][1][0]), 16);
		let buy = parseInt(utils.reverseHex(arr[i][1][1]), 16);
		res.push({
			symbol: utils.hexstr2str(arr[i][0]),
			buy: buy ? buy : 0,
			sell: sell ? sell : 0,
		});
	}
	return res;
}

export function parseAmounts(arr) {
	let res = [];

	for (let i = 0; i < arr.length; i++) {
		const amount = parseInt(utils.reverseHex(arr[i][1]), 16);
		const symbol = utils.hexstr2str(arr[i][0]);
		if (amount) {
			res.push({
				symbol,
				amount,
				key: symbol,
			});
		}
	}

	return res;
}

// Convert a hex string to a byte array
export function hexToBytes(hex) {
	for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
	return bytes;
}

export function signWithPk(msg, pk, schema) {
	return pk.sign(msg, schema);
}

export function parseBcError(er) {
	try {
		const errorObj = JSON.parse(er);
		return errorObj.Error === 42002 ? errorObj.Desc : errorObj.Result;
	} catch (e) {
		return "Something went wrong at the blockchain network";
	}
}
