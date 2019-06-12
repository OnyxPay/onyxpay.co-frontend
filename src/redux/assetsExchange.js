import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { get } from "lodash";
import { getBcClient } from "../api/network";
import { cryptoAddress, gasPrice } from "../utils/blockchain";
import { resolveContractAddress } from "./contracts";

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

	if (!address) {
		dispatch({ type: ASSETS_EXCHANGE_FAILURE });
		return;
	}

	//make transaction
	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[
			new Parameter(
				"assetToSell",
				ParameterType.ByteArray,
				values.operationType === "sell" ? values.assetName : "oUSD"
			),
			new Parameter(
				"assetToBuy",
				ParameterType.ByteArray,
				values.operationType === "sell" ? "oUSD" : values.assetName
			),
			new Parameter("amountToBuy", ParameterType.Integer, values.amountToBuy),
			new Parameter("acct", ParameterType.ByteArray, values.acct),
		],
		cryptoAddress(address),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT
	);

	try {
		const response = await client.sendRawTransaction(tx.serialize(), true);
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
