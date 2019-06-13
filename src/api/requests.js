import { ParameterType, utils } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError, SendRawTrxError } from "../utils/custom-error";
import { createTrx, signTrx, sendTrx } from "./bc";

export async function createRequest(formValues, type) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new Error("Unable to get address of RequestHolder smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const authHeaders = getAuthHeaders();

	// TODO: send params to gas-compensator

	const trx = createTrx({
		funcName: "Request",
		params: [
			{ label: "operationRequested", type: ParameterType.String, value: "deposit" },
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

	try {
		createRes = await client.post("requests/deposit", formValues, {
			headers: {
				...authHeaders,
			},
		});
		return await sendTrx(trx, false, true);
	} catch (e) {
		if (e.isAxiosError) {
			return handleReqError(e);
		} else if (e instanceof SendRawTrxError) {
			await client.put(`request/${createRes.data.reqId}/cancel`, {
				headers: {
					...authHeaders,
				},
			});
		}
	}
}

export async function getActiveRequests(params) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("requests", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
				// pageNum: 1,
				// pageSize: 10,
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
		funcName: "Request",
		params: [{ label: "requestId", value: requestId, type: ParameterType.String }],
		contractAddress: address,
		accountAddress,
	});

	signTrx(trx, pk);

	const res = await sendTrx(trx, false, true);
	console.log(res);
}
