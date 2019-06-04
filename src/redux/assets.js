import { TransactionBuilder, utils, CONST } from "ontology-ts-sdk";
import { get } from "lodash";
import { getBcClient } from "../api/network";
import { cryptoAddress, gasPrice } from "../utils/blockchain";
import { resolveContractAddress } from "./contracts";
import { hexArrToArr } from "../utils/blockchain";

export const GET_ASSETS_LIST_REQUEST = "GET_ASSETS_LIST_REQUEST";
export const GET_ASSETS_LIST_SUCCESS = "GET_ASSETS_LIST_SUCCESS";
export const GET_ASSETS_LIST_FAILURE = "GET_ASSETS_LIST_FAILURE";

const initState = { list: [] };

export const assetsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_ASSETS_LIST_SUCCESS:
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export const getAssetsList = () => async dispatch => {
	const client = getBcClient();
	const funcName = "AssetsList";

	const address = await dispatch(resolveContractAddress("Assets"));

	if (!address) {
		dispatch({ type: GET_ASSETS_LIST_FAILURE }); // add reason
		return;
	}

	const contractAddress = cryptoAddress(address);

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
		console.log("@@", result);
		dispatch({ type: GET_ASSETS_LIST_SUCCESS, payload: hexArrToArr(result) });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_ASSETS_LIST_FAILURE }); // add reason
	}
};
