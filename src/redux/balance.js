import { cryptoAddress } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { isEmpty } from "lodash";
import { getWallet } from "../api/wallet";
import { getAccount } from "../api/account";
import { getTokenBalance, queryAssetsBalance } from "../api/balance";
import { OnyxCashAddress } from "../api/constants";

export const GET_ASSETS_BALANCE_MAIN = "GET_ASSETS_BALANCE_MAIN";
export const GET_ASSETS_BALANCE_REWARD = "GET_ASSETS_BALANCE_REWARD";
export const GET_ONYXCASH_BALANCE_MAIN = "GET_ONYXCASH_BALANCE_MAIN";
export const GET_ONYXCASH_BALANCE_REWARD = "GET_ONYXCASH_BALANCE_REWARD";

const initialState = {
  main: {
    onyxCash: null,
    assets: []
  },
  reward: {
    onyxCash: null,
    assets: []
  }
};

// TODO: normalize state
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
    case GET_ONYXCASH_BALANCE_MAIN:
      return {
        ...state,
        main: {
          ...state.main,
          onyxCash: action.payload
        }
      };
    case GET_ONYXCASH_BALANCE_REWARD:
      return {
        ...state,
        reward: {
          ...state.main,
          onyxCash: action.payload
        }
      };

    default:
      return state;
  }
};

// for both accounts: main and rewards
export const getAssetsBalance = () => {
  return async (dispatch, getState) => {
    const { contracts, wallet } = getState();
    const walletDecoded = getWallet(wallet);
    const accountDefault = getAccount(walletDecoded, true);
    const accountReward = getAccount(walletDecoded);
    const contractAdress =
      !isEmpty(contracts) && contracts["Assets"] && cryptoAddress(utils.reverseHex(contracts["Assets"]));

    if (!contractAdress) return false;

    try {
      const balance = await queryAssetsBalance(contractAdress, accountDefault.address.toHexString());

      dispatch({
        type: GET_ASSETS_BALANCE_MAIN,
        payload: balance
      });
    } catch (e) {
      // handle errors
      console.log(e);
    }

    try {
      const balance = await queryAssetsBalance(contractAdress, accountReward.address.toHexString());

      dispatch({
        type: GET_ASSETS_BALANCE_REWARD,
        payload: balance
      });
    } catch (e) {
      // handle errors
      console.log(e);
    }
  };
};

export const getOnyxCashBalance = () => {
  return async (dispatch, getState) => {
    const { wallet } = getState();
    const walletDecoded = getWallet(wallet);
    const accountDefault = getAccount(walletDecoded, true);
    const accountReward = getAccount(walletDecoded);

    try {
      const balance = await getTokenBalance(OnyxCashAddress, accountDefault.address);
      dispatch({
        type: GET_ONYXCASH_BALANCE_MAIN,
        payload: balance
      });
    } catch (e) {
      console.log(e);
    }

    try {
      const balance = await getTokenBalance(OnyxCashAddress, accountReward.address);
      dispatch({
        type: GET_ONYXCASH_BALANCE_REWARD,
        payload: balance
      });
    } catch (e) {
      console.log(e);
    }
  };
};
