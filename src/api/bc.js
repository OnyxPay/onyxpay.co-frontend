import { TransactionBuilder, Parameter, CONST, Transaction } from "ontology-ts-sdk";
import { getRestClient, getBcClient } from "./network";
import { SendRawTrxError } from "../utils/custom-error";
import { gasPrice, cryptoAddress } from "../utils/blockchain";

export async function createAndSignTrxViaGasCompensator(contractName, funcName, params) {
	const client = getRestClient({ type: "gas" });
	const res = await client.post("compensate-gas", {
		contractName,
		funcName,
		params,
	});
	return res.data.data;
	// TODO: throw custom error
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
		// CONST.DEFAULT_GAS_LIMIT,
		40000,
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
