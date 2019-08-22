import { getRequests } from "api/requests";

export const GET_OWN_OPERATION_REQUESTS_SUCCESS = "GET_OWN_OPERATION_REQUESTS_SUCCESS";
export const GET_OWN_OPERATION_REQUESTS_FAILURE = "GET_OWN_OPERATION_REQUESTS_FAILURE";
export const GET_OWN_OPERATION_REQUESTS = "GET_OWN_OPERATION_REQUESTS";
export const GET_OPERATION_REQUESTS_REQUEST = "GET_OPERATION_REQUESTS_REQUEST";

const initState = {
	items: [],
	total: null,
};

export const ownOpReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_OWN_OPERATION_REQUESTS_SUCCESS:
			return action.payload;
		default:
			return state;
	}
};

export const getOwnOpRequests = ({
	params = {}, // get params
	fetchActive, // true | false
}) => async dispatch => {
	dispatch({ type: GET_OPERATION_REQUESTS_REQUEST });
	try {
		let data = await getRequests(params);
		dispatch({
			type: GET_OWN_OPERATION_REQUESTS_SUCCESS,
			payload: data,
			fetchActive: fetchActive,
		});
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OWN_OPERATION_REQUESTS_FAILURE });
	}
};
