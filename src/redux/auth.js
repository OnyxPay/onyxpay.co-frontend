import { getRestClient, makeFormDate, handleReqError } from "../api/network";
const client = getRestClient();

export const SIGN_UP = "SIGN_UP";
export const LOG_IN = "LOG_IN";

const initialState = {
	token: null,
	// token_type
	// expires_in
};

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case SIGN_UP:
			sessionStorage.setItem("token", action.payload.token);
			return action.payload;
		case LOG_IN:
			sessionStorage.setItem("token", action.payload.token);
			return action.payload;
		default:
			return state;
	}
};

export const signUp = data => async (dispatch, getState) => {
	const formData = makeFormDate(data);
	// TODO: get actual country_id from server
	formData.set("country_id", 1);

	try {
		const { data } = await client.post("sign-up", formData);
		dispatch({ type: SIGN_UP, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};

export const login = data => async (dispatch, getState) => {
	const formData = makeFormDate(data);

	try {
		const { data } = await client.post("login", formData);
		// token: <string>,
		// expires: <int>,
		dispatch({ type: LOG_IN, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};
