import { ParameterType, utils } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { addSignAndSendTrx, createAndSignTrxViaGasCompensator } from "./bc";
import { getWallet, getAccount } from "../api/wallet";

export async function exchangeAssets(values) {
	const { pk } = await unlockWalletAccount();
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

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"Exchange",
		"ExchangeAssets",
		params
	);

	return await addSignAndSendTrx(serializedTrx, pk);
}
