import * as axios from "axios";
import { BackendUrl, temporaryToken } from "../api/constants";
import { getRestClient, handleReqError, getAuthHeader, makeFormData } from "../api/network";
import { startLoading } from "./loading";
const client = getRestClient();

export const INIT_SETTLEMENTS_LIST = "INIT_SETTLEMENTS_LIST";
export const ADD_SETTLEMENT = "ADD_SETTLEMENT";
export const DELETE_SETTLEMENT = "DELETE_SETTLEMENT";

const initialState = [];

const headers = {
	authorization: `bearer ${temporaryToken}`,
};

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
		const authHeader = getAuthHeader();
		dispatch(startLoading());

		try {
			const { data } = await client.get("settlements", {
				headers: {
					...authHeader,
				},
			});
			dispatch(setSettlements(data.data));
		} catch (error) {
			handleReqError(error);
		}
	};
};

export const add = values => {
	return async dispatch => {
		const formData = makeFormData(values);
		const authHeader = getAuthHeader();
		dispatch(startLoading());

		try {
			const { data } = await client.post("settlements", formData, {
				headers: {
					...authHeader,
				},
			});
			dispatch({ type: ADD_SETTLEMENT, payload: data.data });
		} catch (error) {
			return handleReqError(error);
		}

		// await axios
		// 	.post(`${BackendUrl}/api/v1/settlements`, formData, {
		// 		headers: headers,
		// 	})
		// 	.then(res => {
		// 		dispatch({ type: ADD_SETTLEMENT, payload: res.data });
		// 	})
		// 	.catch(error => {
		// 		console.log("ADD error :", error);
		// 	});
	};
};

export const deleteSettlement = settlementId => {
	return async dispatch => {
		await axios
			.delete(`${BackendUrl}/api/v1/settlements/${settlementId}`, {
				headers: headers,
			})
			.then(res => {
				dispatch({
					type: DELETE_SETTLEMENT,
					payload: settlementId,
				});
			})
			.catch(error => {
				console.log("DELETE error :", error);
			});
	};
};
