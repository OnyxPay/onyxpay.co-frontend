export const SET_WALLET = "SET_WALLET";
export const CLEAR_WALLET = "CLEAR_WALLET";
export const SET_CURRENT_ACCOUNT_ADDRESS = "SET_CURRENT_ACCOUNT_ADDRESS";

const defaultState = JSON.parse(localStorage.getItem("wallet")) || null;

export const walletReducer = (state = defaultState, action) => {
	switch (action.type) {
		case CLEAR_WALLET:
			localStorage.removeItem("wallet");
			return null;
		case SET_WALLET:
			localStorage.setItem("wallet", JSON.stringify(action.wallet));
			return action.wallet;
		/*		case SET_CURRENT_ACCOUNT_ADDRESS:
			localStorage.setItem("setCurrentAccountAddress", JSON.stringify(action.address));
			return action.wallet;*/
		default:
			return state;
	}
};

export const setWallet = walletEncoded => ({ type: SET_WALLET, wallet: JSON.parse(walletEncoded) });
//export const setCurrentAccountAddress = address => ({ type: SET_CURRENT_ACCOUNT_ADDRESS, wallet:address });
export const clearWallet = () => ({ type: CLEAR_WALLET });
