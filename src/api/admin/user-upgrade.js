import { ParameterType, utils } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "../network";
import { getStore } from "../../store";
import { resolveContractAddress } from "../../redux/contracts";
import { unlockWalletAccount } from "../wallet";
import { createTrx, sendTrx, createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "../bc";
import { roles } from "../constants";
import { ContractAddressError } from "../../utils/custom-error";
import { cryptoAddress } from "../../utils/blockchain";
import { get } from "lodash";

export const getRequests = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/upgrade-requests", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (er) {
		return handleReqError(er);
	}
};

export async function upgradeUser(userAccountAddress, role) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{
			label: "userAddress",
			type: ParameterType.userAddress,
			value: utils.reverseHex(cryptoAddress(userAccountAddress).toHexString()),
		},
	];

	let funcName;
	if (role === roles.a) {
		funcName = "RegisterAgent";
	} else if (role === roles.sa) {
		funcName = "RegisterSuperAgent";
	}

	const serializedTrx = await createAndSignTrxViaGasCompensator("OnyxPay", funcName, params);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function downgradeUser(userAccountAddress, role) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{
			label: "userAddress",
			type: ParameterType.userAddress,
			value: utils.reverseHex(cryptoAddress(userAccountAddress).toHexString()),
		},
	];

	let funcName;
	if (role === roles.a) {
		funcName = "UnregisterAgent";
	} else if (role === roles.sa) {
		funcName = "UnregisterSuperAgent";
	}

	const serializedTrx = await createAndSignTrxViaGasCompensator("OnyxPay", funcName, params);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function checkUserRole(userAccountAddress, type) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("OnyxPay"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of OnyxPay smart-contract");
	}

	let funcName = "";
	const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());

	if (type === roles.a) {
		funcName = "IsAgent";
	} else if (type === roles.sa) {
		funcName = "IsSuperAgent";
	}

	console.log(funcName, userAccountAddress);

	const trx = createTrx({
		funcName,
		params: [{ label: "userAddress", type: ParameterType.ByteArray, value: userAddress }],
		contractAddress: address,
	});

	const response = await sendTrx(trx, true, false);
	return !!parseInt(get(response, "Result.Result", "0"), 16);
}

export const rejectRequest = async (request_id, reason) => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		return await client.put(
			`/admin/upgrade-request/${request_id}/reject`,
			{ reason: reason },
			{
				headers: {
					...authHeaders,
				},
			}
		);
	} catch (er) {
		return handleReqError(er);
	}
};

export const createRequest = async () => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		return await client.post(
			`/upgrade-request`,
			{ role: "agent" },
			{
				headers: {
					...authHeaders,
				},
			}
		);
	} catch (er) {
		return handleReqError(er);
	}
};
