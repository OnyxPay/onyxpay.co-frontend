import { TransactionBuilder, Oep4, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { get } from "lodash";
import * as Long from "long";
import { getBcClient } from "./network";
import { gasPrice, parseAmounts } from "../utils/blockchain";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export async function getTokenBalance(contract, address) {
	const builder = new Oep4.Oep4TxBuilder(contract);
	const client = getBcClient();
	const tx = builder.queryBalanceOf(address);
	const response = await client.sendRawTransaction(tx.serialize(), true);
	if (response.Result.Result) {
		return Long.fromString(utils.reverseHex(response.Result.Result), true, 16).toString();
	} else {
		return 0;
	}
}

export async function getAssetsBalance(contract, address) {
	//make transaction
	const client = getBcClient();
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
		balance = [];
	} else {
		balance = parseAmounts(result);
	}
	return balance;
}

export async function getRewardsBalance() {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("info", {
			headers: {
				...authHeaders,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}
