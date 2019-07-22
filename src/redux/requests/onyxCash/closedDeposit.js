import { getRequests } from "api/requests";
import { getMessagesForClosedRequests } from "api/operation-messages";

const GET_CLOSED_DEPOSIT_OC_REQUESTS_REQUEST = "GET_CLOSED_DEPOSIT_OC_REQUESTS_REQUEST";
const GET_CLOSED_DEPOSIT_OC_REQUESTS_SUCCESS = "GET_CLOSED_DEPOSIT_OC_REQUESTS_SUCCESS";
const GET_CLOSED_DEPOSIT_OC_REQUESTS_FAILURE = "GET_CLOSED_DEPOSIT_OC_REQUESTS_FAILURE";
export const GET_CLOSED_OC_DEPOSIT_REQUESTS = "GET_CLOSED_OC_DEPOSIT_REQUESTS";

const initState = {
	items: [],
	total: null,
};

export const closedDepositOcRequestsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_CLOSED_DEPOSIT_OC_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		default:
			return state;
	}
};

export const getClosedDepositOcRequests = (params = {}, isInitiator) => async dispatch => {
	dispatch({ type: GET_CLOSED_DEPOSIT_OC_REQUESTS_REQUEST });
	try {
		let data;
		if (isInitiator) {
			data = await getRequests(params);
		} else {
			data = await getMessagesForClosedRequests(params, "buy_onyx_cash");
		}

		dispatch({ type: GET_CLOSED_DEPOSIT_OC_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_CLOSED_DEPOSIT_OC_REQUESTS_FAILURE });
	}
};
