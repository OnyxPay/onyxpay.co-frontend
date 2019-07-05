import { ParameterType, utils } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "../network";
import { unlockWalletAccount } from "../wallet";
import { createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";
import { cryptoAddress } from "../../utils/blockchain";

export const getRequestsComplaint = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();

	try {
		const { data } = await client.get("admin/operation-requests", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (error) {
		console.log(error);
		return handleReqError(error);
	}
};

export async function HandleComplainedRequest(requestId, winnerAddress) {
	const { pk, accountAddress } = await unlockWalletAccount();
	debugger;
	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{ label: "requestId", type: ParameterType.String, value: requestId },
		{
			label: "userAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(cryptoAddress(winnerAddress).toHexString()),
		},
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"HandleComplainedRequest",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}
