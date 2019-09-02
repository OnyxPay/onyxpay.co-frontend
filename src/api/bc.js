import { TransactionBuilder, Parameter, Transaction } from "ontology-ts-sdk";
import { getRestClient, getBcClient, getAuthHeaders } from "./network";
import { SendRawTrxError, GasCompensationError } from "../utils/custom-error";
import { gasPrice, gasLimit, cryptoAddress } from "../utils/blockchain";
import { timeout } from "promise-timeout";
import { notifyTimeout } from "./constants";

export async function createAndSignTrxViaGasCompensator(contractName, funcName, params) {
	const client = getRestClient({ type: "gas" });

	try {
		const res = await client.post(
			"compensate-gas",
			{
				contractName,
				funcName,
				params,
			},
			{
				headers: {
					...getAuthHeaders(),
				},
			}
		);
		return res.data.data;
	} catch (e) {
		if (e.response) {
			let err = "Something went wrong at the GAS compensation server";
			if (e.response.data && e.response.data.error) {
				if (typeof e.response.data.error !== "object") {
					err = e.response.data.error;
				}
			} else if (e.response.data && e.response.data.data) {
				if (typeof e.response.data.data !== "object") {
					err = e.response.data.data;
				}
			}

			throw new GasCompensationError(err);
		} else if (e.request) {
			throw new GasCompensationError("Something went wrong at the GAS compensation server");
		} else {
			throw new GasCompensationError("Something went wrong");
		}
	}
}

export function createTrx({ funcName, params, contractAddress, accountAddress }) {
	const paramsTyped = params.map((param, index) => {
		return new Parameter(param.label, param.type, param.value);
	});

	return TransactionBuilder.makeInvokeTransaction(
		funcName,
		paramsTyped,
		cryptoAddress(contractAddress),
		gasPrice,
		gasLimit,
		accountAddress // address of payer
	);
}

export function signTrx(trx, pk, addSign) {
	if (typeof trx === "string") {
		trx = Transaction.deserialize(trx);
	}
	if (addSign) {
		TransactionBuilder.addSign(trx, pk);
	} else {
		TransactionBuilder.signTransaction(trx, pk);
	}
	return trx;
}

export async function sendTrx(trx, preExec = false, waitNotify = false) {
	try {
		const client = getBcClient();
		return await client.sendRawTransaction(trx.serialize(), preExec, waitNotify);
	} catch (e) {
		throw new SendRawTrxError(e.message);
	}
}

export async function addSignAndSendTrx(serializedTrx, pk) {
	const signedTrx = signTrx(serializedTrx, pk, true);
	return await timeout(sendTrx(signedTrx, false, true), notifyTimeout);
}
