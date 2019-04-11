export const SET_EXCHANGE_RATES = "SET_EXCHANGE_RATES";

export const exchangeRatesReducer = (state = [], action) => {
	switch (action.type) {
		case SET_EXCHANGE_RATES:
			return action.payload;
		default:
			return state;
	}
};

export const setExchangeRates = rates => {
	return { type: SET_EXCHANGE_RATES, payload: rates };
};
