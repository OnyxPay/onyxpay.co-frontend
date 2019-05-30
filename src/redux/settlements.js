import { getRestClient, handleReqError, getAuthHeaders } from "../api/network";
import { startLoading, finishLoading } from "./loading";
import { message } from "antd";
const client = getRestClient();

export const INIT_SETTLEMENTS_LIST = "INIT_SETTLEMENTS_LIST";
export const ADD_SETTLEMENT = "ADD_SETTLEMENT";
export const DELETE_SETTLEMENT = "DELETE_SETTLEMENT";

const initialState = [];

export const settlementsReducer = (state = initialState, action) => {
	switch (action.type) {
		case INIT_SETTLEMENTS_LIST:
			return action.payload;
		case ADD_SETTLEMENT:
			return [...state, action.payload];
		case DELETE_SETTLEMENT:
			return state.filter(item => item.id !== action.payload);
		default:
			return state;
	}
};

export const setSettlements = settlementsList => ({
	type: INIT_SETTLEMENTS_LIST,
	payload: settlementsList,
});

export const getSettlementsList = () => {
	return async dispatch => {
		const authHeader = getAuthHeaders();
		dispatch(startLoading());

		try {
			const { data } = await client.get("settlements", {
				headers: {
					...authHeader,
				},
			});
			dispatch(setSettlements(data.items));
			dispatch(finishLoading());
		} catch (error) {
			handleReqError(error);
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
			message.success("Settlements account was successfully deleted");
		} catch (error) {
			return handleReqError(error);
		}
	};
};
