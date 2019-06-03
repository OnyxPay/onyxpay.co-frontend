import { TransactionBuilder, Oep4, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { getBcClient } from "./network";
import { cryptoAddress, gasPrice, parseAmounts, parseExchangeRates } from "../utils/blockchain";
import * as Long from "long";
import { get, isEmpty } from "lodash";
import Actions from "../redux/actions";

export async function getTokenBalance(contract, address) {
	const builder = new Oep4.Oep4TxBuilder(contract);
	const client = getBcClient();
	const tx = builder.queryBalanceOf(address);
	const response = await client.sendRawTransaction(tx.serialize(), true);
	console.log("onyxCashBalance", response);
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
	console.log("assetsBalance", response);
	const result = get(response, "Result.Result", "");
	let balance;
	if (!result) {
		balance = [];
	} else {
		balance = parseAmounts(result);
	}
	return balance;
}

export async function getExchangeRates(store) {
	let { contracts } = store.getState();
	const client = getBcClient();
	const funcName = "GetExchangeRates";
	const contractAddress =
		!isEmpty(contracts) && contracts["Exchange"] && cryptoAddress(contracts["Exchange"]);
	if (!contractAddress) return false;

	//make transaction
	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[],
		contractAddress,
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT
	);

	try {
		const response = await client.sendRawTransaction(tx.serialize(), true);
		const result = get(response, "Result.Result");
		let rates;
		if (!result) {
			rates = 0;
		} else {
			rates = parseExchangeRates(result);
		}
		store.dispatch(Actions.exchangeRates.setExchangeRates(rates));
	} catch (e) {
		console.log(e);
	}
}
