import * as axios from "axios";
import { BackendUrl, temporaryToken } from "../api/constants";

export const INIT_SETTLEMNTS_LIST = "INIT_SETTLEMNTS_LIST";
export const ADD_SETTLEMENT = "ADD_SETTLEMENT";
export const DELETE_SETTLEMENT = "DELETE_SETTLEMENT";

const initialState = [];
const headers = {
	authorization: `bearer ${temporaryToken}`,
};

export const settlementReducer = (state = initialState, action) => {
	switch (action.type) {
		case INIT_SETTLEMNTS_LIST:
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
	type: INIT_SETTLEMNTS_LIST,
	payload: settlementsList,
});

export const addSettlement = settlement => ({
	type: ADD_SETTLEMENT,
	payload: settlement,
});

export const deleteSettlement = settlementId => ({
	type: DELETE_SETTLEMENT,
	payload: settlementId,
});

export const getSettlementsList = () => {
	return async dispatch => {
		await axios
			.get(`${BackendUrl}/api/v1/settlements`, { headers })
			.then(res => {
				console.log("GET Settlements ", res.data.data);
				dispatch(setSettlements(res.data.data));
			})
			.catch(error => {
				console.log("GET /settlements error :", error);
			});
	};
};

export const addItem = formData => {
	return async dispatch => {
		await axios
			.post(`${BackendUrl}/api/v1/settlements`, formData, {
				headers: headers,
			})
			.then(res => {
				dispatch(addSettlement(res.data));
			})
			.catch(error => {
				console.log("ADD error :", error);
			});
	};
};

export const deleteItem = settlementId => {
	return async dispatch => {
		await axios
			.delete(`${BackendUrl}/api/v1/settlements/${settlementId}`, {
				headers: headers,
			})
			.then(res => {
				dispatch(deleteSettlement(settlementId));
			})
			.catch(error => {
				console.log("DELETE error :", error);
			});
	};
};
