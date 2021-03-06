import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { createAndSignTrxViaGasCompensator, addSignAndSendTrx } from "./bc";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export const getRewardsAmount = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/total-rewards", {
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

export const getReferralsList = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/referrals", {
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

export const getRewardsList = async params => {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/rewards", {
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
