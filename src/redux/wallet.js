import walletPlug from "../wallet.json";

export const SET_WALLET = "SET_WALLET";
export const CLEAR_WALLET = "CLEAR_WALLET";

const defaultState = JSON.parse(localStorage.getItem("wallet")) || walletPlug;

export const walletReducer = (state = defaultState, action) => {
  switch (action.type) {
    case CLEAR_WALLET:
      return { ...state, wallet: null };
    case SET_WALLET:
      localStorage.setItem("wallet", JSON.stringify(action.wallet));
      return { ...state, wallet: action.wallet };
    default:
      return state;
  }
};

export const setWallet = walletEncoded => ({ type: SET_WALLET, wallet: JSON.parse(walletEncoded) });
export const clearWallet = () => ({ type: CLEAR_WALLET });
