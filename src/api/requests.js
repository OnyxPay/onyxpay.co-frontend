import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";
import { unlockWalletAccount, getAccount, getWallet } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError, SendRawTrxError } from "../utils/custom-error";
import { createTrx, signTrx, sendTrx } from "./bc";
import { timeout, TimeoutError } from "promise-timeout";
import { notifyTimeout } from "./constants";
import { get } from "lodash";

export async function createRequest(formValues, requestType) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new Error("Unable to get address of RequestHolder smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const authHeaders = getAuthHeaders();

	const amount = convertAmountFromStr(formValues.amount);
	const trx = createTrx({
		funcName: "Request",
		params: [
			{ label: "operationRequested", type: ParameterType.String, value: requestType },
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
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const trx_hash = utils.reverseHex(trx.getHash());
	const trx_timestamp = new Date().toISOString();
	formValues.trx_hash = trx_hash;
	formValues.trx_timestamp = trx_timestamp;
	formValues.amount = amount;
	let createRes;

	try {
		createRes = await client.post(`operation-requests/${requestType}`, formValues, {
			headers: {
				...authHeaders,
			},
		});
		const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
		console.log(`createTrx for ${requestType}`, res);
		return res;
	} catch (e) {
		if (e.isAxiosError) {
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

export async function getActiveRequests(params) {
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
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	const trx = createTrx({
		funcName: "RejectRequest",
		params: [{ label: "requestId", type: ParameterType.ByteArray, value: requestId }],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
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
	console.log(requestId);
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	const trx = createTrx({
		funcName: "Accept",
		params: [
			{ label: "requestId", type: ParameterType.ByteArray, value: requestId }, // TODO: change id
			{
				label: "agent",
				type: ParameterType.ByteArray,
				value: utils.reverseHex(accountAddress.toHexString()),
			},
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);
	console.log("trx", trx);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
}

export async function chooseAgent(requestId, agentAddress) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	agentAddress = new Crypto.Address(agentAddress).toHexString();

	const trx = createTrx({
		funcName: "ChooseAgent",
		params: [
			{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
			{
				label: "agentAddress",
				type: ParameterType.ByteArray,
				value: utils.reverseHex(agentAddress),
			},
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);
	console.log("trx", trx);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
}

export async function performRequest(requestId) {
	console.log(requestId);
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	const trx = createTrx({
		funcName: "Perform",
		params: [{ label: "requestId", type: ParameterType.ByteArray, value: requestId }],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);
	console.log("trx", trx);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
}

export async function cancelAcceptedRequest(requestId) {
	console.log(requestId);
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	const trx = createTrx({
		funcName: "CancelAcceptation",
		params: [
			{ label: "requestId", type: ParameterType.ByteArray, value: requestId },
			{
				label: "agentAddress",
				type: ParameterType.ByteArray,
				value: utils.reverseHex(accountAddress.toHexString()),
			},
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);
	console.log("trx", trx);

	const res = await timeout(sendTrx(trx, false, true), notifyTimeout);
	console.log(res);
}
