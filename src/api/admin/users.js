import { ParameterType, utils } from "ontology-ts-sdk";
import { getStore } from "../../store";
import { unlockWalletAccount } from "../wallet";
import { createTrx, sendTrx, createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";
import { cryptoAddress } from "../../utils/blockchain";
import { resolveContractAddress } from "redux/contracts";
import { ContractAddressError } from "utils/custom-error";

export async function blockUser(userAccountAddress, reason, duration) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{
			label: "userId",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(cryptoAddress(userAccountAddress).toHexString()),
		},
		{
			label: "reasonCode",
			type: ParameterType.Integer,
			value: reason,
		},
		{
			label: "duration",
			type: ParameterType.Integer,
			value: duration,
		},
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"OnyxPay",
		"BlockUserManually",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function unblockUser(userAccountAddress) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{
			label: "userId",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(cryptoAddress(userAccountAddress).toHexString()),
		},
		{
			label: "userId",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(cryptoAddress(userAccountAddress).toHexString()),
		},
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"OnyxPay",
		"UnblockUserManually",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function isBlockedUser(userAccountAddress) {
	const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("OnyxPay"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}

	const trx = createTrx({
		funcName: "IsBlockedUser",
		params: [
			{
				label: "userAddress",
				type: ParameterType.ByteArray,
				value: userAddress,
			},
		],
		contractAddress: address,
	});

	const res = await sendTrx(trx, true, false);
	if (res.Result.Result === "") {
		return false;
	}
	return true;
}
