const initialState = { isModalVisible: false };

const SHOW_WALLET_UNLOCK_MODAL = "SHOW_WALLET_UNLOCK_MODAL";
const HIDE_WALLET_UNLOCK_MODAL = "HIDE_WALLET_UNLOCK_MODAL";

export const walletUnlockReducer = (state = initialState, action) => {
	switch (action.type) {
		case SHOW_WALLET_UNLOCK_MODAL:
			return { isModalVisible: true };
		case HIDE_WALLET_UNLOCK_MODAL:
			return { isModalVisible: false };
		default:
			return state;
	}
};

export const showWalletUnlockModal = () => {
	return { type: SHOW_WALLET_UNLOCK_MODAL };
};

export const hideWalletUnlockModal = () => {
	return { type: HIDE_WALLET_UNLOCK_MODAL };
};
