import { TransactionBuilder, Parameter, ParameterType, Crypto } from "ontology-ts-sdk";
import { get } from "lodash";
import { getBcClient } from "../api/network";
import { unlockWalletAccount } from "../api/wallet";
import { cryptoAddress, gasPrice } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { resolveContractAddress } from "./contracts";
import { getWallet, getAccount } from "../api/wallet";
import { defaultAsset } from "../api/constants";

export const ASSETS_EXCHANGE_REQUEST = "ASSETS_EXCHANGE_REQUEST";
export const ASSETS_EXCHANGE_SUCCESS = "ASSETS_EXCHANGE_SUCCESS";
export const ASSETS_EXCHANGE_FAILURE = "ASSETS_EXCHANGE_FAILURE";

const initState = { exchange_successful: false };

export const assetsExchangeReducer = (state = initState, action) => {
	switch (action.type) {
		case ASSETS_EXCHANGE_REQUEST:
			return { ...state, exchange_successful: action.payload };
		default:
			return state;
	}
};

export const exchangeAssets = values => async dispatch => {
	const client = getBcClient();
	const funcName = "ExchangeAssets";
	const address = await dispatch(resolveContractAddress("Exchange"));
	const executionGasLimit = 40000;

	if (!address) {
		dispatch({ type: ASSETS_EXCHANGE_FAILURE });
		return;
	}

	const { pk, accountAddress } = await unlockWalletAccount();
	const walletDecoded = getWallet(values.wallet);
	const account = getAccount(walletDecoded);

	//make transaction
	let params = [
		new Parameter(
			"assetToBuy",
			ParameterType.String,
			values.operationType === "sell" ? defaultAsset.symbol : values.assetName
		),
		new Parameter(
			"assetToSell",
			ParameterType.String,
			values.operationType === "sell" ? values.assetName : defaultAsset.symbol
		),
		new Parameter("amountToBuy", ParameterType.Integer, values.amountToBuy * 10 ** 8),
		new Parameter("acct", ParameterType.ByteArray, utils.reverseHex(account.address.toHexString())),
	];

	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		params,
		cryptoAddress(address),
		gasPrice,
		executionGasLimit,
		new Crypto.Address(accountAddress.value)
	);
	console.log(params);
	console.log(tx);
	TransactionBuilder.signTransaction(tx, pk);
	console.log(tx);

	try {
		const response = await client.sendRawTransaction(tx.serialize(), false);
		const result = get(response, "Result.Result");
		let exchange_successful;

		if (!result) {
			exchange_successful = 0;
		} else {
			exchange_successful = result;
		}
		dispatch({ type: ASSETS_EXCHANGE_SUCCESS, payload: exchange_successful });
	} catch (e) {
		console.log(e);
	}
};
