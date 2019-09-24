import { tempWalletPassword } from "../api/constants";
import { UnlockWalletError } from "utils/custom-error";

const initialState = { isModalVisible: false, locked: true, checkAccount: null };
const SHOW_WALLET_UNLOCK_MODAL = "SHOW_WALLET_UNLOCK_MODAL";
const HIDE_WALLET_UNLOCK_MODAL = "HIDE_WALLET_UNLOCK_MODAL";
const LOCK_WALLET = "LOCK_WALLET";
const UNLOCK_WALLET = "UNLOCK_WALLET";

export const walletUnlockReducer = (state = initialState, action) => {
	switch (action.type) {
		case SHOW_WALLET_UNLOCK_MODAL:
			return { ...state, isModalVisible: true, currentAccountAddress: action.payload };
		case HIDE_WALLET_UNLOCK_MODAL:
			return { ...state, isModalVisible: false };
		case UNLOCK_WALLET:
			return { ...state, locked: false };
		case LOCK_WALLET:
			return { ...state, locked: true };
		default:
			return state;
	}
};

export const showWalletUnlockModal = accountAddress => {
	return { type: SHOW_WALLET_UNLOCK_MODAL, payload: accountAddress };
};

export const hideWalletUnlockModal = () => {
	return { type: HIDE_WALLET_UNLOCK_MODAL };
};

export const setUnlockWallet = () => {
	return { type: UNLOCK_WALLET };
};

export const setLockWallet = () => {
	return { type: LOCK_WALLET };
};

export const getWalletPassword = account => (dispatch, getState) => {
	return new Promise((resolve, reject) => {
		dispatch(showWalletUnlockModal(account));
		let timeoutId = setInterval(() => {
			const state = getState();
			if (!state.walletUnlock.locked) {
				clearInterval(timeoutId);
				dispatch(setLockWallet());
				resolve(tempWalletPassword);
			} else if (state.walletUnlock.locked && !state.walletUnlock.isModalVisible) {
				clearInterval(timeoutId);
				reject(new UnlockWalletError("You should unlock your wallet to make transactions"));
			}
		}, 1000);
	});
};
