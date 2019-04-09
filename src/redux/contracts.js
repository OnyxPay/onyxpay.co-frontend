import { gasPrice, getHeadContractAddress } from "../utils/blockchain";
import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { getClient } from "../api/network";
import { get } from "lodash";

export const RESOLVE_COTRACTS_ADRESS = "RESOLVE_COTRACTS_ADRESS";

const initialState = JSON.parse(localStorage.getItem("contracts")) || [];

export const contractsReducer = (state = initialState, action) => {
  switch (action.type) {
    case RESOLVE_COTRACTS_ADRESS:
      const addresses = { ...state, ...action.payload };
      localStorage.setItem("contracts", JSON.stringify(addresses));
      return addresses;
    default:
      return state;
  }
};

export const resolveContractsAdress = contractName => {
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
        type: RESOLVE_COTRACTS_ADRESS,
        payload: { [contractName]: address }
      });
    } catch (e) {
      // TODO: handle errors
      console.log(e);
    }
  };
};
