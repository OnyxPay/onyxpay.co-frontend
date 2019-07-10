import { ParameterType, utils } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { addSignAndSendTrx, createAndSignTrxViaGasCompensator } from "./bc";
import { convertAmountFromStr } from "../utils/number";

export async function exchangeAssets(values) {
	const { pk, accountAddress } = await unlockWalletAccount();

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
			value: convertAmountFromStr(values.amountToBuy),
		},
		{
			label: "acct",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
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

export async function exchangeAssetsForOnyxCash(values) {
	const { pk, accountAddress } = await unlockWalletAccount();

	//make transaction
	const params = [
		{
			label: "tokenId",
			type: ParameterType.String,
			value: values.tokenId,
		},
		{
			label: "amount",
			type: ParameterType.Integer,
			value: convertAmountFromStr(values.amount),
		},
		{
			label: "agent",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
	];
	console.log(params);

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"Exchange",
		values.operationType === "buy" ? "Buy" : "Sell",
		params
	);

	return await addSignAndSendTrx(serializedTrx, pk);
}
