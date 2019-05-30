import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { push } from "connected-react-router";
const client = getRestClient();

export const SIGN_UP = "SIGN_UP";
export const LOG_IN = "LOG_IN";
export const LOG_OUT = "LOG_OUT";

const OnyxAuth = sessionStorage.getItem("OnyxAuth");
const OnyxAddr = sessionStorage.getItem("OnyxAddr");

const initialState = OnyxAuth && OnyxAddr ? { OnyxAuth, OnyxAddr } : null;

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
			return null;
		default:
			return state;
	}
};

export const signUp = values => async (dispatch, getState) => {
	// TODO: send actual country_id to server
	values.country_id = 1;
	try {
		const { status } = await client.post("signup", values, {
			headers: {
				OnyxAuth: values.signed_msg,
				OnyxAddr: values.wallet_addr,
			},
		});
		if (status === 200) {
			dispatch({
				type: SIGN_UP,
				payload: { OnyxAuth: values.signed_msg, OnyxAddr: values.wallet_addr },
			});
		}
	} catch (er) {
		return handleReqError(er);
	}
};

export const login = values => async (dispatch, getState) => {
	try {
		const { status } = await client.post("login", undefined, {
			headers: {
				OnyxAuth: values.signed_msg,
				OnyxAddr: values.wallet_addr,
			},
		});
		if (status === 200) {
			dispatch({
				type: LOG_IN,
				payload: { OnyxAuth: values.signed_msg, OnyxAddr: values.wallet_addr },
			});
		}
	} catch (er) {
		return handleReqError(er);
	}
};

export const confirmEmail = values => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	// const formData = makeFormData(values);
	try {
		await client.post("confirm", values, {
			headers: {
				...authHeaders,
				// "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			},
		});
	} catch (er) {
		return handleReqError(er);
	}
};

export const logOut = notReload => (dispatch, getState) => {
	dispatch({ type: LOG_OUT });

	if (!notReload) {
		dispatch(push("/login"));
		window.location.reload();
	}
};
