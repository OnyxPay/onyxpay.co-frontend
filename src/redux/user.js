import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { finishLoading, startLoading } from "./loading";
import { LOG_OUT } from "./auth";
import { wsEvents, roleCodes } from "../api/constants";

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
				if (action.payload.role === roleCodes.user) {
					action.payload = { role: "user" };
				} else if (action.payload.role === roleCodes.agent) {
					action.payload = { role: "agent" };
				} else if (action.payload.role === roleCodes.superagent) {
					action.payload = { role: "superagent" };
				}
				let newState = { ...JSON.parse(storageState), ...action.payload };
				localStorage.setItem("user", JSON.stringify(newState));
				return newState;
			}
			return null;
		case wsEvents.phoneNumberIsChanged:
			let currentState = localStorage.getItem("user");
			if (currentState) {
				let newState = { ...JSON.parse(currentState), phone: action.payload.phone };
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
