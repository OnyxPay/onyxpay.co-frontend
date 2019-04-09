import { gasPrice, cryptoAdress, parseAmounts } from "../utils/blockchain";
import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { isEmpty, get } from "lodash";
import { getClient } from "../api/network";

export const GET_ASSETS_BALANCE_MAIN = "GET_ASSETS_BALANCE_MAIN";
export const GET_ASSETS_BALANCE_REWARD = "GET_ASSETS_BALANCE_REWARD";

const initialState = {
  main: {
    onyxCash: [],
    assets: []
  },
  reward: {
    onyxCash: [],
    assets: []
  }
};

export const balanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ASSETS_BALANCE_MAIN:
      return {
        ...state,
        main: {
          ...state.main,
          assets: action.payload
        }
      };
    case GET_ASSETS_BALANCE_REWARD:
      return {
        ...state,
        reward: {
          ...state.reward,
          assets: action.payload
        }
      };
    default:
      return state;
  }
};

// TODO: for both accounts: main and rewards
export const getAssetsBalance = address => {
  return async (dispatch, getState) => {
    const { contracts } = getState();
    const funcName = "balancesOf";
    const client = getClient();
    const contractAdress =
      !isEmpty(contracts) && contracts["Assets"] && cryptoAdress(utils.reverseHex(contracts["Assets"]));
    console.log(address, contractAdress);

    if (!contractAdress) return false;

    const p1 = new Parameter("account", ParameterType.ByteArray, address);

    //make transaction
    const tx = TransactionBuilder.makeInvokeTransaction(
      funcName,
      [p1],
      contractAdress,
      gasPrice,
      CONST.DEFAULT_GAS_LIMIT
    );

    try {
      const response = await client.sendRawTransaction(tx.serialize(), true);
      console.log(response);
    } catch (e) {
      // TODO: handle errors
      console.log(e);
    }
    // rest
    //   .sendRawTransaction(tx.serialize(), true)
    //   .then(res => {
    //     if (res.Error === 0) {
    //       let result = res.Result.Result;
    //       let balance;
    //       if (!result) {
    //         balance = 0;
    //       } else {
    //         balance = parseAmounts(result);
    //       }

    //       dispatch({
    //         type: GET_ASSETS_BALANCE,
    //         payload: balance
    //       });
    //     } else {
    //     }
    //   })
    //   .catch(er => {
    //     console.log(er);
    //   });
  };
};
