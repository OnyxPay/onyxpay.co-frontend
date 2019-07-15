import { getActiveRequests } from "api/requests";
import { getMessagesForActiveRequests } from "api/operation-messages";

export const GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST = "GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST";
export const GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS = "GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS";
export const GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE = "GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE";

const initState = {
	items: [],
	total: null,
};

export const activeDepositRequestsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		default:
			return state;
	}
};

export const getActiveDepositRequests = (params, isAgent) => async dispatch => {
	dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST });
	try {
		let data;
		if (isAgent) {
			data = await getMessagesForActiveRequests(params);
		} else {
			data = await getActiveRequests(params);
		}
		console.log("!!!", data);
		dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE });
	}
};
