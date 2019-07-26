import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "./bc";

export async function addReferral(referrer, pk, accountAddress) {
	const referrerAddress = new Crypto.Address(referrer);

	const params = [
		{
			label: "referral", //  new user
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
		{
			label: "referrer", // user who recruited new user
			type: ParameterType.ByteArray,
			value: utils.reverseHex(referrerAddress.toHexString()),
		},
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"ReferralService",
		"AddReferral",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}
