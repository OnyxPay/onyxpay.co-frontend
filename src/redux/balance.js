export const SET_ASSETS_BALANCE_MAIN = "SET_ASSETS_BALANCE_MAIN";
export const SET_ASSETS_BALANCE_REWARD = "SET_ASSETS_BALANCE_REWARD";
export const SET_ONYXCASH_BALANCE_MAIN = "SET_ONYXCASH_BALANCE_MAIN";
export const SET_ONYXCASH_BALANCE_REWARD = "SET_ONYXCASH_BALANCE_REWARD";

const initialState = {
	main: {
		onyxCash: null,
		assets: [],
	},
	reward: {
		onyxCash: null,
		assets: [],
	},
};

// TODO: normalize state!!!
export const balanceReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_ASSETS_BALANCE_MAIN:
			return {
				...state,
				main: {
					...state.main,
					assets: action.payload,
				},
			};
		case SET_ASSETS_BALANCE_REWARD:
			return {
				...state,
				reward: {
					...state.reward,
					assets: action.payload,
				},
			};
		case SET_ONYXCASH_BALANCE_MAIN:
			return {
				...state,
				main: {
					...state.main,
					onyxCash: action.payload,
				},
			};
		case SET_ONYXCASH_BALANCE_REWARD:
			return {
				...state,
				reward: {
					...state.reward,
					onyxCash: action.payload,
				},
			};

		default:
			return state;
	}
};

export const setAssetsBalance = (balance, isAccountMain) => {
	if (isAccountMain) {
		return {
			type: SET_ASSETS_BALANCE_MAIN,
			payload: balance,
		};
	} else {
		return {
			type: SET_ASSETS_BALANCE_REWARD,
			payload: balance,
		};
	}
};

export const setOnyxCashBalance = (balance, isAccountMain) => {
	if (isAccountMain) {
		return {
			type: SET_ONYXCASH_BALANCE_MAIN,
			payload: balance,
		};
	} else {
		return {
			type: SET_ONYXCASH_BALANCE_REWARD,
			payload: balance,
		};
	}
};
