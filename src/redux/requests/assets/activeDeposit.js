import { getRequests } from "api/requests";
import { getMessagesForActiveRequests } from "api/operation-messages";
import {
	wsEvents,
	requestStatusNames,
	operationMessageStatus,
	operationMessageStatusNames,
} from "api/constants";

export const GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST = "GET_ACTIVE_DEPOSIT_REQUESTS_REQUEST";
export const GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS = "GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS";
export const GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE = "GET_ACTIVE_DEPOSIT_REQUESTS_FAILURE";
export const GET_ACTIVE_DEPOSIT_REQUESTS = "GET_ACTIVE_DEPOSIT_REQUESTS";

const initState = {
	items: [],
	total: null,
};
function enumerateItems(state, pred) {
	console.info("enumerateItems", state);
	if (state.items) {
		let items = state.items.map(el => {
			return pred(el);
		});
		console.info("enumerateItems_end", { ...state, items: items });
		return { ...state, items: items };
	}
	return state;
}

export const activeDepositRequestsReducer = (state = initState, action) => {
	let pred;
	switch (action.type) {
		case GET_ACTIVE_DEPOSIT_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		case wsEvents.acceptRequest:
			pred = item => {
				if (item.request_id === action.payload.requestId) {
					item.operation_messages = item.operation_messages.map(message => {
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
			};
			break;
		case wsEvents.chooseAgent:
			pred = item => {
				if (item.request_id === action.payload.requestId) {
					return {
						...item,
						status_code: action.payload.status,
						status: requestStatusNames[action.payload.status],
					};
				}
				return item;
			};
			break;
		case wsEvents.saveRequest:
			pred = item => {
				if (item.trx_hash === action.payload.trxHash) {
					return {
						...item,
						status_code: action.payload.status,
						status: requestStatusNames[action.payload.status],
						requestId: action.payload.requestId,
					};
				}
				return item;
			};
			break;
		case wsEvents.newMessage:
			console.info("newMessage", state);
			state.items.push(action.payload);
			state.total += 1;
			console.info("newMessage_end", state);
			return state;
		default:
			return state;
	}
	return enumerateItems(state, pred);
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
