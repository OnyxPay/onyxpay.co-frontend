import { TransactionBuilder, Oep4, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { get } from "lodash";
import * as Long from "long";
import { getBcClient } from "./network";
import { gasPrice, parseAmounts } from "../utils/blockchain";
import { getStore } from "store";
import { ContractAddressError } from "../utils/custom-error";
import { getAccount, getWallet } from "./wallet";
import { createTrx, sendTrx } from "./bc";
import { resolveContractAddress } from "redux/contracts";

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

export async function getFiatAmount(userId, assetSymbol) {
	const store = getStore();
	const { wallet } = store.getState();
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of Exchange smart-contract");
	}
	const decodedWallet = getWallet(wallet);
	const account = getAccount(decodedWallet);

	const trx = createTrx({
		funcName: "GetFiatAmount",
		params: [
			{
				label: "userId",
				type: ParameterType.ByteArray,
				value: utils.reverseHex(account.address.toHexString()),
			},
			{
				label: "tokenId",
				type: ParameterType.String,
				value: assetSymbol,
			},
		],
		contractAddress: address,
	});

	const res = await sendTrx(trx, true);
	if (res.Result.Result) {
		return parseInt(utils.reverseHex(res.Result.Result), 16);
	}
	return 0;
}
