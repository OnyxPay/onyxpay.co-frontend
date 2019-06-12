import {
	TransactionBuilder,
	Parameter,
	ParameterType,
	CONST,
	utils,
	Transaction,
} from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders, getBcClient } from "./network";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { gasPrice, cryptoAddress } from "../utils/blockchain";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError, SendRawTrxError } from "../utils/custom-error";

export async function createRequest(formValues, type) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new Error("Unable to get address of RequestHolder smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const clientBC = getBcClient();
	const authHeaders = getAuthHeaders();

	// TODO: send params to gas-compensator, deserialize, add signature
	const funcName = "Request";

	const p1 = new Parameter("operationRequested", ParameterType.String, "deposit");
	const p2 = new Parameter(
		"initiator",
		ParameterType.ByteArray,
		utils.reverseHex(accountAddress.toHexString())
	);
	const p3 = new Parameter("assetId", ParameterType.String, formValues.asset_symbol);
	const p4 = new Parameter(
		"amount",
		ParameterType.Integer,
		convertAmountFromStr(formValues.amount)
	);

	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[p1, p2, p3, p4],
		cryptoAddress(address),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT,
		accountAddress
	);
	TransactionBuilder.signTransaction(tx, pk);

	const trx_hash = tx.getHash();
	const trx_timestamp = new Date().toISOString();
	formValues.trx_hash = trx_hash;
	formValues.trx_timestamp = trx_timestamp;

	try {
		const createRes = await client.post("requests/deposit", formValues, {
			headers: {
				...authHeaders,
			},
		});

		try {
			const bcRes = await clientBC.sendRawTransaction(tx.serialize(), false, true);
			console.log(bcRes);
		} catch (e) {
			console.log("O-ho", JSON.parse(e.message));
			const removeRes = await client.put(`request/${createRes.data.reqId}/cancel`, {
				headers: {
					...authHeaders,
				},
			});
		}
	} catch (e) {
		console.log("O-ho", e);
		return handleReqError(e);
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

	const bcRes = await createAndSendTrxIntoBC({
		waitNotify: true,
		pk,
		accountAddress,
		contractAddress: address,
		funcName: "RejectRequest",
		params: [{ label: "requestId", value: requestId, type: ParameterType.String }],
	});

	const client = getRestClient();
	const authHeaders = getAuthHeaders();

	try {
		const removeRes = await client.put(`request/${requestId}/cancel`, {
			headers: {
				...authHeaders,
			},
		});
	} catch (e) {
		return handleReqError(e);
	}
}

export async function createAndSendTrxIntoBC({
	preExec = false,
	waitNotify = false,
	pk,
	accountAddress,
	contractAddress,
	funcName,
	params,
}) {
	const paramsTyped = params.map((param, index) => {
		let type;
		if (param.type === "ByteArray") {
			type = ParameterType.ByteArray;
		} else if (param.type === "Integer" || param.type === "Int") {
			type = ParameterType.Integer;
		} else if (param.type === "String") {
			type = ParameterType.String;
		}
		return new Parameter(param.label, type, param.value);
	});

	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		paramsTyped,
		cryptoAddress(contractAddress),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT,
		accountAddress
	);

	TransactionBuilder.signTransaction(tx, pk);
	try {
		const client = getBcClient();
		await client.sendRawTransaction(tx.serialize(), preExec, waitNotify);
	} catch (e) {
		throw new SendRawTrxError(e.message);
	}
}

export async function signTrxViaGasCompensator(contract, funcName, params) {
	const client = getRestClient({ type: "gas" });
	const res = await client.post("compensate-gas", {
		contract,
		funcName,
		params,
	});
	return res.data.data;
}

export async function signAndSendTrxIntoBC({
	preExec = false,
	waitNotify = false,
	pk,
	serializedTrx,
}) {
	const trx = Transaction.deserialize(serializedTrx);
	TransactionBuilder.addSign(trx, pk);

	try {
		const client = getBcClient();
		await client.sendRawTransaction(trx.serialize(), preExec, waitNotify);
	} catch (e) {
		throw new SendRawTrxError(e.message);
	}
}
