import { ParameterType, utils } from "ontology-ts-sdk";
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

const depositReqId = "fc50fc92c4fd628610f02edf4180343d0e1c1c83fba7d5af049344b44dc38334"; // 12 oEUR
const depositReqId2 = "d8ed79ba2c9b1237cf615886858c950cb3415b2742b3baf5cde1c55a5f8c07ad"; // 13 oEUR

/* 
	Get operation requests (url: /api/v1/operation-requests, method: GET)
/* 
{
    "items": [
        {
            "id": <int>,
            "type_code": <int>,
            "type": <string>,
            "asset": <string>,
            "maker_addr": <string>,
            "taker_addr": <string>, поменяется после ChooseAgent trx
            "amount": <float>,
            "country": <string>,
            "status_code": <int>,
            "status": <string>,
            "finalization_at": <string>,
            "trx_hash": <string>,
            "trx_timestamp": <string>,
            "operation_messages": [
                {
                    "id": <array>,
                    "status": <string>, поменяется после Accept(requestId, agent) trx на 3 и "/operation-message/{operationMessageId}/hide" на 2
                    "status_code": <int>,
                    "receiver": {
                        "id": <int>,
                        "addr": <string>
                    }
                }
            ]
        }
    ]
}

	Request status:
	1 - opened
	2 - choose
	3 - rejected
	4 - canceled
	5 - complained
	6 - completed
	7 - closed
	
	operation_messages status:
	1 - opened
	2 - hidden 
	3 - accepted

*/

export async function createRequest(formValues, requestType) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new Error("Unable to get address of RequestHolder smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const authHeaders = getAuthHeaders();

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
				value: convertAmountFromStr(formValues.amount),
			},
		],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const trx_hash = trx.getHash();
	const trx_timestamp = new Date().toISOString();
	formValues.trx_hash = trx_hash;
	formValues.trx_timestamp = trx_timestamp;
	let createRes;

	console.log(formValues);

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
		params: [{ label: "requestId", type: ParameterType.ByteArray, value: depositReqId }],
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
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}
	const { pk, accountAddress } = await unlockWalletAccount();

	const trx = createTrx({
		funcName: "Accept",
		params: [
			{ label: "requestId", type: ParameterType.String, value: requestId },
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
