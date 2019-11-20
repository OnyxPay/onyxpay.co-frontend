import { TransactionBuilder, CONST } from "ontology-ts-sdk";
import { get } from "lodash";
import { getBcClient } from "../api/network";
import { cryptoAddress, gasPrice } from "../utils/blockchain";
import { resolveContractAddress } from "./contracts";
import { hexArrToArr, parseExchangeRates } from "../utils/blockchain";

export const GET_ASSETS_LIST_REQUEST = "GET_ASSETS_LIST_REQUEST";
export const GET_ASSETS_LIST_SUCCESS = "GET_ASSETS_LIST_SUCCESS";
export const GET_ASSETS_LIST_FAILURE = "GET_ASSETS_LIST_FAILURE";

export const GET_ASSETS_EXCHANGE_RATES_REQUEST = "GET_ASSETS_EXCHANGE_RATES_REQUEST";
export const GET_ASSETS_EXCHANGE_RATES_SUCCESS = "GET_ASSETS_EXCHANGE_RATES_SUCCESS";
export const GET_ASSETS_EXCHANGE_RATES_FAILURE = "GET_ASSETS_EXCHANGE_RATES_FAILURE";

export const SET_ALLOWED_ASSETS_SUCCESS = "SET_ALLOWED_ASSETS_SUCCESS";
export const SET_ALLOWED_ASSETS_REQUEST = "SET_ALLOWED_ASSETS_REQUEST";
export const SET_ALLOWED_ASSETS_FAILURE = "SET_ALLOWED_ASSETS_FAILURE";

const initState = {
	list: [],
	rates: [],
	allowedAssets: null,
	loadingAssetsList: false,
	loadingExchangeRates: false,
	loadingAllowedAssets: false,
};

export const assetsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_ASSETS_LIST_REQUEST:
			return { ...state, loadingAssetsList: true };
		case GET_ASSETS_LIST_SUCCESS:
			return { ...state, list: action.payload, loadingAssetsList: false };
		case GET_ASSETS_LIST_FAILURE:
			return { ...state, loadingAssetsList: false };
		case GET_ASSETS_EXCHANGE_RATES_REQUEST:
			return { ...state, loadingExchangeRates: true };
		case GET_ASSETS_EXCHANGE_RATES_SUCCESS:
			return { ...state, rates: action.payload, loadingExchangeRates: false };
		case GET_ASSETS_EXCHANGE_RATES_FAILURE:
			return { ...state, loadingExchangeRates: false };
		case SET_ALLOWED_ASSETS_REQUEST:
			return { ...state, loadingAllowedAssets: true };
		case SET_ALLOWED_ASSETS_SUCCESS:
			return { ...state, allowedAssets: action.payload, loadingAllowedAssets: false };
		case SET_ALLOWED_ASSETS_FAILURE:
			return { ...state, loadingAllowedAssets: false };
		default:
			return state;
	}
};

export const getAssetsList = () => async dispatch => {
	dispatch({ type: GET_ASSETS_LIST_REQUEST });
	const client = getBcClient();
	const funcName = "AssetsList";

	const address = await dispatch(resolveContractAddress("Assets"));

	if (!address) {
		dispatch({ type: GET_ASSETS_LIST_FAILURE }); // add reason
		return;
	}

	//make transaction
	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[],
		cryptoAddress(address),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT
	);

	try {
		const response = await client.sendRawTransaction(tx.serialize(), true);
		const result = get(response, "Result.Result");
		dispatch({ type: GET_ASSETS_LIST_SUCCESS, payload: hexArrToArr(result) });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_ASSETS_LIST_FAILURE }); // add reason
	}
};

export const getExchangeRates = () => async dispatch => {
	dispatch({ type: GET_ASSETS_EXCHANGE_RATES_REQUEST });
	const client = getBcClient();
	const funcName = "GetExchangeRates";
	const address = await dispatch(resolveContractAddress("Exchange"));

	if (!address) {
		dispatch({ type: GET_ASSETS_EXCHANGE_RATES_FAILURE });
		throw new Error("Unable to get address of Exchange smart-contract");
	}

	//make transaction
	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[],
		cryptoAddress(address),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT
	);

	try {
		const response = await client.sendRawTransaction(tx.serialize(), true);
		const result = get(response, "Result.Result");
		let rates = [];
		if (result) {
			rates = parseExchangeRates(result);
		}
		dispatch({ type: GET_ASSETS_EXCHANGE_RATES_SUCCESS, payload: rates });
		return rates;
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_ASSETS_EXCHANGE_RATES_FAILURE });
	}
};

export const startFetchingAllowedAssets = () => async dispatch => {
	dispatch({ type: SET_ALLOWED_ASSETS_REQUEST });
};

export const setAllowedAssets = items => async dispatch => {
	dispatch({ type: SET_ALLOWED_ASSETS_SUCCESS, payload: items });
};

export const failFetchingAllowedAssets = () => async dispatch => {
	dispatch({ type: SET_ALLOWED_ASSETS_FAILURE });
};
