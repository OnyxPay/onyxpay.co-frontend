import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { showNotification } from "components/notification";
const client = getRestClient();

export const FETCH_SETTLEMENTS_LIST_REQUEST = "FETCH_SETTLEMENTS_LIST_REQUEST";
export const FETCH_SETTLEMENTS_LIST_SUCCESS = "FETCH_SETTLEMENTS_LIST_SUCCESS";
export const FETCH_SETTLEMENTS_LIST_FAILURE = "FETCH_SETTLEMENTS_LIST_FAILURE";
export const FETCH_SETTLEMENTS_LIST = "FETCH_SETTLEMENTS_LIST";

export const ADD_SETTLEMENT = "ADD_SETTLEMENT";
export const DELETE_SETTLEMENT = "DELETE_SETTLEMENT";

const initialState = [];

export const settlementsReducer = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_SETTLEMENTS_LIST_SUCCESS:
			return action.payload;
		case ADD_SETTLEMENT:
			return [...state, action.payload];
		case DELETE_SETTLEMENT:
			return state.filter(item => item.id !== action.payload);
		default:
			return state;
	}
};

export const getSettlementsList = () => {
	return async dispatch => {
		const authHeader = getAuthHeaders();
		dispatch({ type: FETCH_SETTLEMENTS_LIST_REQUEST });

		try {
			const { data } = await client.get("settlements", {
				headers: {
					...authHeader,
				},
			});
			dispatch({
				type: FETCH_SETTLEMENTS_LIST_SUCCESS,
				payload: data.items,
			});
		} catch (error) {
			handleReqError(error);
			dispatch({
				type: FETCH_SETTLEMENTS_LIST_FAILURE,
			});
		}
	};
};

export const add = values => {
	return async dispatch => {
		const authHeader = getAuthHeaders();
		try {
			const { data } = await client.post("settlements", values, {
				headers: {
					...authHeader,
				},
			});
			dispatch({ type: ADD_SETTLEMENT, payload: data.data });
		} catch (error) {
			return handleReqError(error);
		}
	};
};

export const deleteAccount = id => {
	return async dispatch => {
		const authHeader = getAuthHeaders();
		console.log(id);
		try {
			await client.delete(`settlements/${id}`, {
				headers: {
					...authHeader,
				},
			});
			dispatch({
				type: DELETE_SETTLEMENT,
				payload: id,
			});
			showNotification({
				type: "success",
				msg: "Settlements account was successfully deleted",
			});
		} catch (error) {
			return handleReqError(error);
		}
	};
};
