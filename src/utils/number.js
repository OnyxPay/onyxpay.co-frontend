import BigNumber from "bignumber.js";

export function decodeAmount(amount, decimals) {
	let amountBN = new BigNumber(amount);
	amountBN = amountBN.shiftedBy(-decimals);

	return amountBN.toString();
}
