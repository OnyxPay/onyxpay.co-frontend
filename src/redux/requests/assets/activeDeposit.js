import { getRequests } from "api/requests";
import { getMessagesForActiveRequests } from "api/operation-messages";
import {
	wsEvents,
	requestStatusNames,
	operationMessageStatus,
	operationMessageStatusNames,
	requestStatus,
} from "api/constants";

export const GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST = "GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST";
export const GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS = "GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS";
export const GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE = "GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE";
export const GET_ACTIVE_DEPOSIT_REQUESTS = "GET_ACTIVE_DEPOSIT_REQUESTS";

const initState = {
	items: [],
	total: null,
};

export const activeDepositRequestsReducer = (state = initState, action) => {
	switch (action.type) {
		case GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		case wsEvents.acceptRequest:
			let stateItems = state.items.map(item => {
				if (item.request_id === action.payload.requestId) {
					item.operation_messages.forEach(message => {
						if (message.id === action.payload.messageId) {
							return {
								...message,
								status_code: operationMessageStatus.accepted,
								status: operationMessageStatusNames[operationMessageStatus.accepted],
							};
						}
						return message;
					});
				}
				return item;
			});
			console.info({ ...state, items: stateItems });
			return { ...state, items: stateItems };
		case wsEvents.chooseAgent:
			let items = state.items.map(el => {
				if (el.request_id === action.payload.requestId) {
					return {
						...el,
						status_code: action.payload.status,
						status: requestStatusNames[action.payload.status],
					};
				}
				return el;
			});
			return { ...state, items: items };
		case wsEvents.saveRequest:
			let savedItems = state.items.map(el => {
				if (el.trx_hash === action.payload.trxHash) {
					return {
						...el,
						status_code: action.payload.status,
						status: requestStatusNames[action.payload.status],
						requestId: action.payload.requestId,
					};
				}
				return el;
			});
			return { ...state, items: savedItems };
		case wsEvents.newMessage:
			console.info(action.payload);
			action.payload.forEach(item => {
				state.items = state.items.push(item);
			});
			return state;
		default:
			return state;
	}
};

export const getActiveDepositRequests = (params = {}, isAgent = false) => async dispatch => {
	dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST });
	try {
		let data;
		if (isAgent) {
			data = await getMessagesForActiveRequests(params);
		} else {
			data = await getRequests(params);
		}
		dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE });
	}
};
