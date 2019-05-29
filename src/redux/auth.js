import { getRestClient, makeFormData, handleReqError, getAuthHeader } from "../api/network";
// import { stringify } from "qs";
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
			sessionStorage.setItem("OnyxAuth", action.payload.OnyxAuth);
			sessionStorage.setItem("OnyxAddr", action.payload.OnyxAddr);
			return action.payload;
		case LOG_IN:
			sessionStorage.setItem("OnyxAuth", action.payload.OnyxAuth);
			sessionStorage.setItem("OnyxAddr", action.payload.OnyxAddr);
			localStorage.setItem("logged_in", true);
			return action.payload;
		case LOG_OUT:
			sessionStorage.removeItem("OnyxAuth");
			sessionStorage.removeItem("OnyxAddr");
			localStorage.removeItem("logged_in");
			return { token: null };
		default:
			return state;
	}
};

export const signUp = values => async (dispatch, getState) => {
	// TODO: get actual country_id from server
	// remove form data

	const formData = makeFormData(values);
	formData.set("country_id", 1);

	try {
		const { data } = await client.post("signup", formData, {
			headers: {
				OnyxAuth: values.signed_msg,
				OnyxAddr: values.wallet_addr,
				// "Content-Type": "application/x-www-form-urlencoded",
			},
		});
		console.log(data);
		// TODO: save signature and account address
		// OnyxAuth
		// OnyxAddr
		// dispatch({ type: SIGN_UP, payload: { OnyxAuth: data.signed_msg, OnyxAddr: data.wallet_addr } });
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
