import { TransactionBuilder, Oep4, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { getClient } from "./network";
import { cryptoAddress, gasPrice, parseAmounts } from "../utils/blockchain";
import * as Long from "long";
import { get } from "lodash";

export async function getTokenBalance(contract, address) {
	const builder = new Oep4.Oep4TxBuilder(cryptoAddress(contract));

	const client = getClient();
	const tx = builder.queryBalanceOf(address);
	const response = await client.sendRawTransaction(tx.serialize(), true);
	if (response.Result.Result) {
		return Long.fromString(utils.reverseHex(response.Result.Result), true, 16).toString();
	} else {
		return "0";
	}
}

export async function getAssetsBalance(contract, address) {
	//make transaction
	const client = getClient();
	const funcName = "balancesOf";
	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[new Parameter("account", ParameterType.ByteArray, address)],
		contract,
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT
	);

	const response = await client.sendRawTransaction(tx.serialize(), true);
	const result = get(response, "Result.Result", "");
	let balance;
	if (!result) {
		balance = 0;
	} else {
		balance = parseAmounts(result);
	}
	return balance;
}
