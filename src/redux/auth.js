import React from "react";
import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { showNotification } from "../components/notification";
import { push } from "connected-react-router";
import SupportLink from "components/SupportLink";

const client = getRestClient();

export const SIGN_UP = "SIGN_UP";
export const LOG_IN = "LOG_IN";
export const LOG_OUT = "LOG_OUT";

const OnyxAuth = localStorage.getItem("OnyxAuth");
const OnyxAddr = localStorage.getItem("OnyxAddr");

const initialState = OnyxAuth && OnyxAddr ? { OnyxAuth, OnyxAddr } : null;

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case SIGN_UP:
			localStorage.setItem("OnyxAuth", action.payload.OnyxAuth);
			localStorage.setItem("OnyxAddr", action.payload.OnyxAddr);
			return action.payload;
		case LOG_IN:
			localStorage.setItem("OnyxAuth", action.payload.OnyxAuth);
			localStorage.setItem("OnyxAddr", action.payload.OnyxAddr);
			localStorage.setItem("logged_in", true);
			return action.payload;
		case LOG_OUT:
			localStorage.removeItem("OnyxAuth");
			localStorage.removeItem("OnyxAddr");
			localStorage.removeItem("logged_in");
			return null;
		default:
			return state;
	}
};

export const signUp = values => async (dispatch, getState) => {
	try {
		const { status } = await client.post("signup", values, {
			headers: {
				OnyxAuth: values.signed_msg,
				OnyxAddr: values.walletAddr,
			},
		});
		if (status === 200) {
			dispatch({
				type: SIGN_UP,
				payload: { OnyxAuth: values.signed_msg, OnyxAddr: values.walletAddr },
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
				OnyxAddr: values.walletAddr,
			},
		});
		if (status === 200) {
			dispatch({
				type: LOG_IN,
				payload: { OnyxAuth: values.signed_msg, OnyxAddr: values.walletAddr },
			});
		}
		return true;
	} catch (er) {
		if (
			er.response.status === 403 &&
			er.response.data.errors &&
			er.response.data.errors.user_status
		) {
			showNotification({
				type: "error",
				msg: er.response.data.errors.user_status,
				desc: (
					<>
						Please,&nbsp;
						<SupportLink />
					</>
				),
			});
			return;
		}
		return handleReqError(er);
	}
};

export const confirmEmail = values => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		await client.post("confirm", values, {
			headers: {
				...authHeaders,
			},
		});
	} catch (er) {
		return handleReqError(er);
	}
};

export const logOut = (reload = true) => (dispatch, getState) => {
	dispatch({ type: LOG_OUT });
	dispatch(push("/login"));
	if (reload) {
		window.location.reload();
	}
};
