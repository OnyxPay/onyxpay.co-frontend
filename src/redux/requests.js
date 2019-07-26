import { getRequests } from "api/requests";
import { getMessages } from "api/operation-messages";
import {
	wsEvents,
	requestStatusNames,
	operationMessageStatus,
	operationMessageStatusNames,
} from "api/constants";

export const GET_OPERATION_REQUESTS_REQUEST = "GET_OPERATION_REQUESTS_REQUEST";
export const GET_OPERATION_REQUESTS_SUCCESS = "GET_OPERATION_REQUESTS_SUCCESS";
export const GET_OPERATION_REQUESTS_FAILURE = "GET_OPERATION_REQUESTS_FAILURE";
export const GET_OPERATION_REQUESTS = "GET_OPERATION_REQUESTS";

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

export const opRequestsReducer = (state = initState, action) => {
	let pred;
	switch (action.type) {
		case GET_OPERATION_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		case wsEvents.acceptRequestMaker:
			pred = item => {
				if (item.request_id === action.payload.requestId) {
					let newItem = item;
					newItem.operation_messages = item.operation_messages.map(message => {
						if (message.id === action.payload.messageId) {
							return {
								...message,
								status_code: operationMessageStatus.accepted,
								status: operationMessageStatusNames[operationMessageStatus.accepted],
							};
						}
						return message;
					});
					return newItem;
				}
				return item;
			};
			break;
		case wsEvents.acceptRequestTaker:
			pred = item => {
				if (item.request.request_id === action.payload.requestId) {
					let newItem = item;
					newItem.status_code = operationMessageStatus.accepted;
					newItem.status = operationMessageStatusNames[operationMessageStatus.accepted];
					return newItem;
				}
				return item;
			};
			break;
		case wsEvents.chooseAgentMaker:
			pred = item => {
				if (item.request_id === action.payload.requestId) {
					console.log("chooseAgent", item);
					return {
						...item,
						status_code: action.payload.status,
						status: requestStatusNames[action.payload.status],
						taker: action.payload.taker,
						choose_timestamp: action.payload.chooseTimestamp,
					};
				}
				return item;
			};
			break;
		case wsEvents.chooseAgentTaker:
			pred = item => {
				if (item.request.request_id === action.payload.requestId) {
					return {
						...item,
						request: {
							...item.request,
							status_code: action.payload.status,
							status: requestStatusNames[action.payload.status],
							taker_addr: action.payload.takerAddr,
							choose_timestamp: action.payload.chooseTimestamp,
						},
					};
				}
				return item;
			};
			break;
		case wsEvents.saveRequest:
			pred = item => {
				if (item.trx_hash === action.payload.trxHash) {
					console.log("saveRequest", item);
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
			return { ...state, total: state.total + 1, items: [action.payload, ...state.items] };
		case wsEvents.changeRequestStatusTaker:
			let takerItems = state.items.filter(
				item => item.request.request_id !== action.payload.requestId
			);
			return { ...state, items: takerItems };
		case wsEvents.changeRequestStatusMaker:
			let makerItems = state.items.filter(item => {
				console.log(item.request_id + " => " + action.payload.requestId);
				return item.request_id !== action.payload.requestId;
			});
			return { ...state, items: makerItems };
		default:
			return state;
	}
	return enumerateItems(state, pred);
};

export const getOpRequests = ({
	params = {}, // get params
	requestType, // deposit | withdraw | buy_onyx_cash
	fetchActive, // true | false
	isInitiator, // true | false
}) => async dispatch => {
	dispatch({ type: GET_OPERATION_REQUESTS_REQUEST });

	try {
		let data;
		if (isInitiator) {
			data = await getRequests(params);
		} else {
			data = await getMessages(params, requestType, fetchActive);
		}
		dispatch({ type: GET_OPERATION_REQUESTS_SUCCESS, payload: data });
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OPERATION_REQUESTS_FAILURE });
	}
};
