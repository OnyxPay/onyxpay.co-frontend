import { ParameterType } from "ontology-ts-sdk";
import { unlockCurrentWalletAccount } from "../wallet";
import { createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";

export async function addNewAsset(assetSymbol, assetName) {
	const { pk, accountAddress } = await unlockCurrentWalletAccount();

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
	const { pk, accountAddress } = await unlockCurrentWalletAccount();

	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{ label: "assetSymbol", type: ParameterType.String, value: assetSymbol },
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator("Exchange", "BlockAsset", params);

	return addSignAndSendTrx(serializedTrx, pk);
}
