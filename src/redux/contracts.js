import { gasPrice, getHeadContractAddress } from "../utils/blockchain";
import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { getBcClient } from "../api/network";
import { get } from "lodash";

// "OnyxPay",
// "Exchange",
// "InternalRevenueServiceStrategy",
// "InternalRevenueService",
// "Assets",
// "OnyxCash",
// "Investments"

export const RESOLVE_CONTRACT_ADDRESS = "RESOLVE_CONTRACT_ADDRESS";

export const contractsReducer = (state = [], action) => {
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
		const { contracts } = getState();

		if (contracts.hasOwnProperty(contractName)) {
			return contracts[contractName];
		}

		const client = getBcClient();
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
			const address = get(response, "Result.Result");
			dispatch({
				type: RESOLVE_CONTRACT_ADDRESS,
				payload: { [contractName]: address },
			});
			return address;
		} catch (e) {
			dispatch({
				type: RESOLVE_CONTRACT_ADDRESS,
				payload: { [contractName]: null },
			});
			return null;
		}
	};
};
