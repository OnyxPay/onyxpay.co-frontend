import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";
import { unlockWalletAccount, getAccount, getWallet } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError, SendRawTrxError, GasCompensationError } from "../utils/custom-error";
import {
	createTrx,
	signTrx,
	sendTrx,
	createAndSignTrxViaGasCompensator,
	addSignAndSendTrx,
} from "./bc";
import { timeout, TimeoutError } from "promise-timeout";
import { notifyTimeout } from "./constants";
import { get } from "lodash";

export async function createRequest(formValues, requestType) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const authHeaders = getAuthHeaders();

	const amount = convertAmountFromStr(formValues.amount);

	const params = [
		{
			label: "operationRequested",
			type: ParameterType.String,
			value: requestType === "buy_onyx_cash" ? "deposit" : requestType,
		},
		{
			label: "initiator",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
		{ label: "assetId", type: ParameterType.String, value: formValues.asset_symbol },
		{
			label: "amount",
			type: ParameterType.Integer,
			value: amount,
		},
	];
	let createRes;

	try {
		const serializedTrx = await createAndSignTrxViaGasCompensator(
			"RequestHolder",
			"Request",
			params
		);
		const signedTrx = signTrx(serializedTrx, pk, true);

		const trxHash = utils.reverseHex(signedTrx.getHash());
		const trxTimestamp = new Date().toISOString();
		formValues.trx_hash = trxHash;
		formValues.trx_timestamp = trxTimestamp;
		formValues.amount = amount;

		createRes = await client.post(`operation-requests/${requestType}`, formValues, {
			headers: {
				...authHeaders,
			},
		});
		const res = await timeout(sendTrx(signedTrx, false, true), notifyTimeout);
		return res;
	} catch (e) {
		if (e instanceof GasCompensationError) {
			throw new GasCompensationError(e.message);
		} else if (e.isAxiosError) {
			return handleReqError(e);
		} else if (e instanceof SendRawTrxError) {
			await client.put(`operation-request/${createRes.data.id}/cancel`, null, {
				headers: {
					...authHeaders,
				},
			});
		} else if (e instanceof TimeoutError) {
			throw new TimeoutError(); // pass error to component
		}
	}
}

export async function getRequests(params) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("operation-requests", {
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
}

export async function cancelRequest(requestId, type) {
	const { pk } = await unlockWalletAccount();
	const params = [{ label: "requestId", type: ParameterType.ByteArray, value: requestId }];
	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"RejectRequest",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function getRejectionCounter(userId) {
	const store = getStore();
	const { wallet } = store.getState();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const decodedWallet = getWallet(wallet);
	const account = getAccount(decodedWallet);

	const trx = createTrx({
		funcName: "RejectationCounter",
		params: [
			{
				label: "userId",
				type: ParameterType.ByteArray,
				value: utils.reverseHex(account.address.toHexString()),
			},
		],
		contractAddress: address,
	});

	const res = await sendTrx(trx, true);
	let counter = get(res, "Result.Result", 0);
	if (counter === "") {
		counter = 0;
	} else {
		counter = parseInt(counter, 16);
	}
	return counter;
}

export async function acceptRequest(requestId) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
		{
			label: "agent",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
	];
	const serializedTrx = await createAndSignTrxViaGasCompensator("RequestHolder", "Accept", params);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function cancelAcceptedRequest(requestId) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
		{
			label: "agentAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
	];
	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"CancelAcceptation",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function chooseAgent(requestId, agentAddress) {
	const { pk } = await unlockWalletAccount();
	const params = [
		{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
		{
			label: "agentAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(new Crypto.Address(agentAddress).toHexString()),
		},
	];
	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"ChooseAgent",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function performRequest(requestId) {
	const { pk } = await unlockWalletAccount();
	const params = [{ label: "requestId", type: ParameterType.ByteArray, value: requestId }];
	const trx = await createAndSignTrxViaGasCompensator("RequestHolder", "Perform", params);
	const serializedTrx = signTrx(trx, pk, true);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function complain(requestId) {
	const { pk, accountAddress } = await unlockWalletAccount();
	const params = [
		{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
		{
			label: "plaintiff",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
	];
	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"RequestHolder",
		"Complain",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}
