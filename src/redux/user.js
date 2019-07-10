import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { finishLoading, startLoading } from "./loading";
import { LOG_OUT } from "./auth";

const client = getRestClient();

const userData = localStorage.getItem("user");
const initialState = (userData && JSON.parse(userData)) || null;

const SAVE_USER = "SAVE_USER";
const UPDATE_USER = "UPDATE_USER";

export const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case SAVE_USER:
			localStorage.setItem("user", JSON.stringify(action.payload));
			return action.payload;
		case UPDATE_USER:
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
