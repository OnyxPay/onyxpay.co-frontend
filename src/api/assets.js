import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError /* SendRawTrxError */ } from "../utils/custom-error";
import { createTrx, signTrx, sendTrx } from "./bc";
import { timeout /* TimeoutError */ } from "promise-timeout";
import { notifyTimeout } from "./constants";
// import { get } from "lodash";

export async function sendAsset(values) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("InternalRevenueService"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
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

	const trx = createTrx({
		funcName: "Send",
		params,
		contractAddress: address,
		accountAddress,
	});
	signTrx(trx, pk);

	await timeout(sendTrx(trx, false, true), notifyTimeout);
}
