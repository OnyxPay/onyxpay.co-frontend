const initialState = { isModalVisible: false };
const SHOW_SESSION_EXPIRED_MODAL = "SHOW_SESSION_EXPIRED_MODAL";

export const sessionReducer = (state = initialState, action) => {
	switch (action.type) {
		case SHOW_SESSION_EXPIRED_MODAL:
			return { ...state, isModalVisible: true };
		default:
			return state;
	}
};

export const showSessionExpiredModal = () => {
	return { type: SHOW_SESSION_EXPIRED_MODAL };
};
