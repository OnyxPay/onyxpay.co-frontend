import { getRestClient, makeFormData, handleReqError, getAuthHeader } from "../api/network";
import { push } from "connected-react-router";
const client = getRestClient();

export const SIGN_UP = "SIGN_UP";
export const LOG_IN = "LOG_IN";
export const LOG_OUT = "LOG_OUT";

const initialState = (sessionStorage.getItem("token") && {
	token: sessionStorage.getItem("token"),
}) || { token: null };

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case SIGN_UP:
			sessionStorage.setItem("token", action.payload.token);
			return action.payload;
		case LOG_IN:
			sessionStorage.setItem("token", action.payload.token);
			localStorage.setItem("logged_in", true);
			return action.payload;
		case LOG_OUT:
			sessionStorage.removeItem("token");
			localStorage.removeItem("logged_in");
			return { token: null };
		default:
			return state;
	}
};

export const signUp = data => async (dispatch, getState) => {
	const formData = makeFormData(data);
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
	const formData = makeFormData(data);

	try {
		const { data } = await client.post("login", formData);
		dispatch({ type: LOG_IN, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};

export const confirmEmail = email => async (dispatch, getState) => {
	const authHeader = getAuthHeader();
	const formData = makeFormData(email);
	try {
		await client.post("confirm-data", formData, {
			headers: {
				...authHeader,
			},
		});
	} catch (er) {
		return handleReqError(er);
	}
};

export const logOut = notReload => async (dispatch, getState) => {
	try {
		const authHeader = getAuthHeader();
		await client.post("logout", null, {
			headers: {
				...authHeader,
			},
		});
	} catch (error) {
		// do nothing
	} finally {
		dispatch({ type: LOG_OUT });

		if (!notReload) {
			dispatch(push("/login"));
			window.location.reload();
		}
	}
};
