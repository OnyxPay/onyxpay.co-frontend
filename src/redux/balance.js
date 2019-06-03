export const SET_ASSETS_BALANCE = "SET_ASSETS_BALANCE";
export const SET_ONYXCASH_BALANCE = "SET_ONYXCASH_BALANCE";

const initialState = {
	onyxCash: null,
	assets: [],
};

export const balanceReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_ASSETS_BALANCE:
			return {
				...state,
				assets: action.payload,
			};

		case SET_ONYXCASH_BALANCE:
			return {
				...state,
				onyxCash: action.payload,
			};

		default:
			return state;
	}
};

export const setAssetsBalance = balance => {
	return {
		type: SET_ASSETS_BALANCE,
		payload: balance,
	};
};

export const setOnyxCashBalance = balance => {
	return {
		type: SET_ONYXCASH_BALANCE,
		payload: balance,
	};
};
