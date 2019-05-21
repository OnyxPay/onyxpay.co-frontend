export const SET_WALLET = "SET_WALLET";
export const CLEAR_WALLET = "CLEAR_WALLET";

const defaultState = JSON.parse(sessionStorage.getItem("wallet")) || null;

export const walletReducer = (state = defaultState, action) => {
	switch (action.type) {
		case CLEAR_WALLET:
			sessionStorage.removeItem("wallet");
			return null;
		case SET_WALLET:
			sessionStorage.setItem("wallet", JSON.stringify(action.wallet));
			return action.wallet;
		default:
			return state;
	}
};

export const setWallet = walletEncoded => ({ type: SET_WALLET, wallet: JSON.parse(walletEncoded) });
export const clearWallet = () => ({ type: CLEAR_WALLET });
