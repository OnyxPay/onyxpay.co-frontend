import { ParameterType } from "ontology-ts-sdk";
import { getStore } from "../../store";
import { unlockWalletAccount } from "../wallet";
import { resolveContractAddress } from "../../redux/contracts";
import { createTrx, sendTrx, createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";
import { ContractAddressError } from "../../utils/custom-error";
import { get } from "lodash";

export async function addNewAsset(assetSymbol, assetName) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol },
		{ label: "assetName", type: ParameterType.String, value: assetName },
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator("Assets", "addAsset", params);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function blockAsset(assetSymbol) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol },
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator("Exchange", "BlockAsset", params);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function isBlockedAsset(assetSymbol) {
	const store = getStore();
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
