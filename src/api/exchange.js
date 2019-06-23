import { ParameterType, utils } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { createTrx, signTrx, sendTrx } from "./bc";
import { timeout } from "promise-timeout";
import { notifyTimeout } from "./constants";
import { getWallet, getAccount } from "../api/wallet";

export async function exchangeAssets(values) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new Error("Unable to get address of Exchange smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();
	const walletDecoded = getWallet(values.wallet);
	const account = getAccount(walletDecoded);

	//make transaction
	const params = [
		{
			label: "assetToBuy",
			type: ParameterType.String,
			value: values.assetToBuyName,
		},
		{
			label: "assetToSell",
			type: ParameterType.String,
			value: values.assetToSellName,
		},
		{
			label: "amountToBuy",
			type: ParameterType.Integer,
			value: Math.round(values.amountToBuy * 10 ** 8),
		},
		{
			label: "acct",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(account.address.toHexString()),
		},
	];
	console.log(params);
	const trx = createTrx({
		funcName: "ExchangeAssets",
		params: params,
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);
	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	return res;
}
