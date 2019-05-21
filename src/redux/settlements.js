import * as axios from "axios";
import { BackendUrl, temporaryToken } from "../api/constants";
import { getRestClient, handleReqError } from "../api/network";
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

export const addSettlement = settlement => ({
	type: ADD_SETTLEMENT,
	payload: settlement,
});

export const getSettlementsList = () => {
	return async dispatch => {
		dispatch(startLoading());
		const plug = [
			{
				id: 1,
				accountNumber: "FA343",
				description: "Private 24",
				accountName: "some user",
				briefNotes: "",
			},
			{
				id: 2,
				accountNumber: "F2323",
				description: "Private 24",
				accountName: "some user 2",
				briefNotes: "tram tfdsf dsf",
			},
		];
		try {
			const { data } = await client.get("settlements");
			dispatch(setSettlements(plug));
		} catch (error) {
			// console.log(handleReqError(error));
			dispatch(setSettlements(plug));
		}
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
