import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError /* SendRawTrxError */ } from "../utils/custom-error";
import { createTrx, signTrx, sendTrx, createAndSignTrxViaGasCompensator } from "./bc";
import { timeout /* TimeoutError */ } from "promise-timeout";
import { notifyTimeout } from "./constants";
import { get } from "lodash";

export async function sendAsset(values) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const receiverAddress = new Crypto.Address(values.receiver_address);

	const params = [
		{
			label: "fromAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
		{
			label: "receiverAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(receiverAddress.toHexString()),
		},
		{ label: "tokenId", type: ParameterType.String, value: values.asset_symbol },
		{ label: "amount", type: ParameterType.Integer, value: convertAmountFromStr(values.amount) },
	];

	const trx = await createAndSignTrxViaGasCompensator("InternalRevenueService", "Send", params);
	const signed_trx = signTrx(trx, pk, true);

	return await timeout(sendTrx(signed_trx, false, true), notifyTimeout);
}

export async function isAssetBlocked(tokenId) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of Exchange smart-contract");
	}

	const trx = createTrx({
		funcName: "IsAssetBlocked",
		params: [
			{
				label: "tokenId",
				type: ParameterType.String,
				value: tokenId,
			},
		],
		contractAddress: address,
	});

	const response = await sendTrx(trx, true, false);
	return !!parseInt(get(response, "Result.Result", "0"), 16);
}
