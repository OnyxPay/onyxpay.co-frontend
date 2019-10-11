import { ParameterType } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "../network";
import { unlockWalletAccount } from "../wallet";
import { createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";

export const getRequests = async params => {
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

export async function handleComplainedRequest(requestId, winner) {
	const walletAddress = localStorage.getItem("OnyxAddr");
	const { pk, accountAddress } = await unlockWalletAccount(walletAddress);

	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
		{ label: "winner", type: ParameterType.String, value: winner },
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"HandleComplainedRequest",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}
