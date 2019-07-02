import { Parameter, ParameterType } from "ontology-ts-sdk";
import { getStore } from "../../store";
import { unlockWalletAccount } from "../wallet";
import { resolveContractAddress } from "../../redux/contracts";
import { createTrx, signTrx, sendTrx } from "../bc";
import { ContractAddressError } from "../../utils/custom-error";
import { timeout } from "promise-timeout";
import { notifyTimeout } from "../constants";
import { get } from "lodash";

const store = getStore();

export async function addNewAsset(assetSymbol, assetName) {
	const address = await store.dispatch(resolveContractAddress("Assets"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();
	const funcName = "addAsset";

	const p1 = new Parameter("caller", ParameterType.String, "did:onx:" + accountAddress.value);
	const p2 = new Parameter("keyNo", ParameterType.Integer, 1);
	const p3 = new Parameter("asset symbol", ParameterType.String, assetSymbol);
	const p4 = new Parameter("asset name", ParameterType.String, assetName);

	const trx = createTrx({
		funcName,
		params: [p1, p2, p3, p4],
		contractAddress: address,
		accountAddress,
	});
	signTrx(trx, pk);
	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
	return res;
}

export async function blockAsset(assetSymbol) {
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();
	const funcName = "BlockAsset";

	const p1 = new Parameter("caller", ParameterType.String, "did:onx:" + accountAddress.value);
	const p2 = new Parameter("keyNo", ParameterType.Integer, 1);
	const p3 = new Parameter("asset symbol", ParameterType.String, assetSymbol);

	//make transaction
	const trx = createTrx({
		funcName,
		params: [p1, p2, p3],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
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
