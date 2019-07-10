import { handleReqError } from "../api/network";
import { finishLoading, startLoading } from "./loading";
import { LOG_OUT } from "./auth";
import { getUpgradeRequest } from "../api/upgrade";

const upgradeRequest = localStorage.getItem("upgradeRequest");
const initialState = (upgradeRequest && JSON.parse(upgradeRequest)) || null;

const SET_UPGRADE_REQUEST = "SET_UPGRADE_REQUEST";
const UPDATE_UPGRADE_REQUEST = "UPDATE_UPGRADE_REQUEST";

export const upgradeReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_UPGRADE_REQUEST:
			localStorage.setItem("upgradeRequest", JSON.stringify(action.payload));
			return action.payload;
		case UPDATE_UPGRADE_REQUEST:
			let storageState = localStorage.getItem("upgradeRequest");
			if (storageState) {
				let newState = { ...JSON.parse(storageState), ...action.payload };
				localStorage.setItem("upgradeRequest", JSON.stringify(newState));
				return newState;
			}
			return null;
		case LOG_OUT:
			localStorage.removeItem("upgradeRequest");
			return null;
		default:
			return state;
	}
};

export const setUpgradeRequest = request => {
	return { type: SET_UPGRADE_REQUEST, payload: request };
};

export const updateUpgradeRequest = request => {
	return { type: UPDATE_UPGRADE_REQUEST, payload: request };
};

export const getUserUpgradeRequest = () => async (dispatch, getState) => {
	dispatch(startLoading());
	try {
		let data = await getUpgradeRequest();

		if (data.status === 200 && data.data) {
			dispatch(setUpgradeRequest(data.data));
			return { upgradeRequest: data.data };
		} else if (data.status === 204) {
			dispatch(setUpgradeRequest(null));
		}
		dispatch(finishLoading());
		return { upgradeRequest: null };
	} catch (er) {
		return handleReqError(er);
	}
};
