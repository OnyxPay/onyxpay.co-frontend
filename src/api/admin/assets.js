import { ParameterType } from "ontology-ts-sdk";
import { getStore } from "../../store";
import { unlockWalletAccount } from "../wallet";
import { resolveContractAddress } from "../../redux/contracts";
import { createTrx, signTrx, sendTrx } from "../bc";
import { ContractAddressError } from "../../utils/custom-error";
import { timeout } from "promise-timeout";
import { notifyTimeout } from "../constants";
import { get } from "lodash";
import { message } from "antd";

const store = getStore();

export async function addNewAsset(assetSymbol, assetName) {
	const address = await store.dispatch(resolveContractAddress("Assets"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();
	const funcName = "addAsset";

	const trx = createTrx({
		funcName,
		params: [
			{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
			{ label: "keyNo", type: ParameterType.Integer, value: 1 },
			{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol },
			{ label: "assetName", type: ParameterType.String, value: assetName },
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
	if (res.Error === 0) {
		message.success("Asset was successfully added");
	}
	return res;
}

export async function blockAsset(assetSymbol) {
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();
	const funcName = "BlockAsset";

	const trx = createTrx({
		funcName,
		params: [
			{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
			{ label: "keyNo", type: ParameterType.Integer, value: 1 },
			{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol },
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
	if (res.Error === 0) {
		message.success("Asset was successfully blocked");
	}
	return res;
}

export async function isBlockedAsset(assetSymbol) {
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}

	const funcName = "IsAssetBlocked";

	const trx = createTrx({
		funcName,
		params: [{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol }],
		contractAddress: address,
	});

	const res = await sendTrx(trx, true, false);
	console.log(res);
	return get(res, "Result.Result", "0");
}
