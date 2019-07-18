import { getRequests } from "api/requests";
import { getMessagesForClosedRequests } from "api/operation-messages";

const GET_CLOSED_DEPOSIT_REQUESTS_REQUEST = "GET_CLOSED_DEPOSIT_REQUESTS_REQUEST";
const GET_CLOSED_DEPOSIT_REQUESTS_SUCCESS = "GET_CLOSED_DEPOSIT_REQUESTS_SUCCESS";
const GET_CLOSED_DEPOSIT_REQUESTS_FAILURE = "GET_CLOSED_DEPOSIT_REQUESTS_FAILURE";
export const GET_CLOSED_DEPOSIT_REQUESTS = "GET_CLOSED_DEPOSIT_REQUESTS";

const initState = {
	items: [],
	total: null,
};

export const closedDepositRequestsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_CLOSED_DEPOSIT_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		default:
			return state;
	}
};

export const getClosedDepositRequests = (params = {}, isAgent = false) => async dispatch => {
	dispatch({ type: GET_CLOSED_DEPOSIT_REQUESTS_REQUEST });
	try {
		let data;
		if (isAgent) {
			data = await getMessagesForClosedRequests(params);
		} else {
			data = await getRequests(params);
		}

		dispatch({ type: GET_CLOSED_DEPOSIT_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_CLOSED_DEPOSIT_REQUESTS_FAILURE });
	}
};
