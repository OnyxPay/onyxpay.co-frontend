import { gasPrice, getHeadContractAddress } from "../utils/blockchain";
import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { getClient } from "../api/network";
import { get } from "lodash";

export const RESOLVE_CONTRACT_ADDRESS = "RESOLVE_CONTRACT_ADDRESS";

const initialState = JSON.parse(localStorage.getItem("contracts")) || [];

export const contractsReducer = (state = initialState, action) => {
	switch (action.type) {
		case RESOLVE_CONTRACT_ADDRESS:
			const addresses = { ...state, ...action.payload };
			localStorage.setItem("contracts", JSON.stringify(addresses));
			return addresses;
		default:
			return state;
	}
};

export const resolveContractAddress = contractName => {
	return async (dispatch, getState) => {
		const client = getClient();
		const funcName = "GetContractAddress";
		const p1 = new Parameter("contractName", ParameterType.String, contractName);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			getHeadContractAddress(),
			gasPrice,
			CONST.DEFAULT_GAS_LIMIT
		);
		try {
			const response = await client.sendRawTransaction(tx.serialize(), true);
			const address = utils.hexstr2str(get(response, "Result.Result"));
			dispatch({
				type: RESOLVE_CONTRACT_ADDRESS,
				payload: { [contractName]: address },
			});
		} catch (e) {
			console.log(contractName, e);
			dispatch({
				type: RESOLVE_CONTRACT_ADDRESS,
				payload: { [contractName]: null },
			});
		}
	};
};
