import React from "react";
import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { finishLoading, startLoading } from "./loading";
import { LOG_OUT } from "./auth";
import { wsEvents, userStatus } from "../api/constants";
import { showNotification } from "../components/notification";

const client = getRestClient();

const userData = localStorage.getItem("user");
const initialState = (userData && JSON.parse(userData)) || null;

const SAVE_USER = "SAVE_USER";

export const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case SAVE_USER:
			localStorage.setItem("user", JSON.stringify(action.payload));
			return action.payload;
		case wsEvents.upgradeUser:
			let storageState = localStorage.getItem("user");
			if (storageState) {
				let newState = { ...JSON.parse(storageState), ...action.payload };
				localStorage.setItem("user", JSON.stringify(newState));
				return newState;
			}
			return null;
		case LOG_OUT:
			localStorage.removeItem("user");
			return null;
		default:
			return state;
	}
};

export const saveUser = user => {
	return { type: SAVE_USER, payload: user };
};

export const getUserData = () => async (dispatch, getState) => {
	dispatch(startLoading());
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("info", {
			headers: {
				...authHeaders,
			},
		});
		if (data.roleCode === 0) {
			data.role = "user";
		}
		dispatch(saveUser(data));
		dispatch(finishLoading());
		return { user: data };
	} catch (er) {
		return handleReqError(er);
	}
};

export const updateUser = (dispatch, type, payload) => {
	if (payload && payload.status === userStatus.blocked) {
		showNotification({
			desc: (
				<>
					Your account has been blocked by administrator. Please&nbsp;
					<a href="mailto:support@onyxpay.co">contact the support</a>
				</>
			),
		});
		dispatch({ type: LOG_OUT });
		return;
	}
	dispatch({
		type: type,
		payload: payload,
	});
};
