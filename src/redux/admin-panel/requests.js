import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";

const client = getRestClient();

const requestsData = sessionStorage.getItem("adminUsers");
const initialState = (requestsData && JSON.parse(requestsData)) || null;
const REQUESTS_DATA = "REQUESTS_DATA";

export const adminRequestsReducer = (state = initialState, action) => {
	switch (action.type) {
		case REQUESTS_DATA:
			sessionStorage.setItem("adminUsers", JSON.stringify(action.payload));
			return action.payload;
		default:
			return state;
	}
};

export const saveRequests = users => {
	return { type: REQUESTS_DATA, payload: users };
};

export const getRequestsData = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/users", {
			headers: {
				...authHeaders,
			},
		});
		dispatch(saveRequests(data.items));
		return { requestsData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
