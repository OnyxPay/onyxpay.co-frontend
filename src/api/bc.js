import {
	TransactionBuilder,
	Parameter,
	ParameterType,
	CONST,
	utils,
	Transaction,
} from "ontology-ts-sdk";
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
}

export async function sendTrx(trx, preExec = false, waitNotify = false) {
	try {
		const client = getBcClient();
		return await client.sendRawTransaction(trx.serialize(), preExec, waitNotify);
	} catch (e) {
		throw new SendRawTrxError(e.message);
	}
}

export async function createAndSendTrx({
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
		return await client.sendRawTransaction(tx.serialize(), preExec, waitNotify);
	} catch (e) {
		throw new SendRawTrxError(e.message);
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
		CONST.DEFAULT_GAS_LIMIT,
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
