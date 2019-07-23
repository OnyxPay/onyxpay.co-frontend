import { getRequests } from "api/requests";
import { getMessages } from "api/operation-messages";

export const GET_OPERATION_REQUESTS_REQUEST = "GET_OPERATION_REQUESTS_REQUEST";
export const GET_OPERATION_REQUESTS_SUCCESS = "GET_OPERATION_REQUESTS_SUCCESS";
export const GET_OPERATION_REQUESTS_FAILURE = "GET_OPERATION_REQUESTS_FAILURE";
export const GET_OPERATION_REQUESTS = "GET_OPERATION_REQUESTS";

const initState = {
	items: [],
	total: null,
};

export const opRequestsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_OPERATION_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		default:
			return state;
	}
};

export const getOpRequests = ({
	params = {},
	requestType, // deposit | withdraw | buy_onyx_cash
	fetchActive,
	isInitiator,
}) => async dispatch => {
	dispatch({ type: GET_OPERATION_REQUESTS_REQUEST });
	console.log({ params, requestType, fetchActive, isInitiator });

	try {
		let data;
		if (isInitiator) {
			data = await getRequests(params);
		} else {
			data = await getMessages(params, requestType, fetchActive);
		}
		dispatch({ type: GET_OPERATION_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OPERATION_REQUESTS_FAILURE });
	}
};
