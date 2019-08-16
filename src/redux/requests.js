import { getRequests } from "api/requests";
import { getMessages } from "api/operation-messages";
import { showNotification } from "components/notification.js";
import {
	wsEvents,
	requestStatusNames,
	operationMessageStatus,
	operationMessageStatusNames,
	requestStatus,
} from "api/constants";

export const GET_OPERATION_REQUESTS_REQUEST = "GET_OPERATION_REQUESTS_REQUEST";
export const GET_OPERATION_REQUESTS_SUCCESS = "GET_OPERATION_REQUESTS_SUCCESS";
export const GET_OPERATION_REQUESTS_FAILURE = "GET_OPERATION_REQUESTS_FAILURE";
export const GET_OPERATION_REQUESTS = "GET_OPERATION_REQUESTS";
export const DISABLE_REQUEST = "DISABLE_REQUEST";

const initState = {
	items: [],
	total: null,
};

function enumerateItems(state, pred) {
	if (state.items) {
		let items = state.items.map(el => {
			return pred(el);
		});
		return { ...state, items: items };
	}
	return state;
}

const makerAcceptationPredicate = (payload, type, notification) => {
	return item => {
		const status =
			type === wsEvents.acceptRequestMaker
				? operationMessageStatus.accepted
				: operationMessageStatus.opened;
		if (item.requestId === payload.requestId) {
			let newItem = item;
			let message = item.type + " " + notification;
			showNotification({ type: "success", msg: message });
			newItem.operationMessages = item.operationMessages.map(message => {
				if (message.id === payload.messageId) {
					return {
						...message,
						statusCode: status,
						status: operationMessageStatusNames[status],
						_isDisabled: false,
					};
				}
				return message;
			});
			return newItem;
		}
		return item;
	};
};

const takerAcceptationPredicate = (payload, type, notification) => {
	return item => {
		const status =
			type === wsEvents.acceptRequestTaker
				? operationMessageStatus.accepted
				: operationMessageStatus.opened;
		if (item.request.requestId === payload.requestId) {
			let message = item.request.type + " " + notification;
			showNotification({ type: "success", msg: message });
			let newItem = item;
			newItem.statusCode = status;
			newItem.status = operationMessageStatusNames[status];
			newItem._isDisabled = false;
			return newItem;
		}
		return item;
	};
};

const chooseRequestMakerPredicate = payload => {
	return item => {
		if (item.requestId === payload.requestId) {
			let message = item.type + " request with id (" + item.id + ") is chosen";
			showNotification({ type: "success", msg: message });
			return {
				...item,
				statusCode: payload.status,
				status: requestStatusNames[payload.status],
				taker: payload.taker,
				takerAddr: payload.takerAddr,
				chooseTimestamp: payload.chooseTimestamp,
				_isDisabled: false,
			};
		}
		return item;
	};
};

const chooseRequestTakerPredicate = payload => {
	return item => {
		if (item.request.requestId === payload.requestId) {
			let message =
				item.request.type + " request with id (" + item.request.id + ") is chosen successfully";
			showNotification({ type: "success", msg: message });
			return {
				...item,
				request: {
					...item.request,
					statusCode: payload.status,
					status: requestStatusNames[payload.status],
					takerAddr: payload.takerAddr,
					chooseTimestamp: payload.chooseTimestamp,
				},
			};
		}
		return item;
	};
};

const saveRequestPredicate = payload => {
	return item => {
		if (item.trx_hash === payload.trxHash) {
			let message = item.type + " request with id (" + item.id + ") is openned successfully";
			showNotification({ type: "success", msg: message });
			return {
				...item,
				statusCode: payload.status,
				status: requestStatusNames[payload.status],
				requestId: payload.requestId,
			};
		}
		return item;
	};
};

const handleComplainStatusPredicate = payload => {
	return item => {
		if (item.request.requestId === payload.requestId) {
			let message = item.type + " request with id (" + item.id + ") is complained";
			showNotification({ type: "success", msg: message });
			return {
				...item,
				request: {
					...item.request,
					statusCode: payload.status,
					status: requestStatusNames[payload.status],
				},
			};
		}
		return item;
	};
};

const changeRequestStatusMakerPredicate = payload => {
	return item => {
		if (item.requestId === payload.requestId) {
			let message =
				item.type + " request with id (" + item.id + ") is " + requestStatusNames[payload.status];
			showNotification({ type: "success", msg: message });
			return {
				...item,
				statusCode: payload.status,
				status: requestStatusNames[payload.status],
				_isDisabled: false,
			};
		}
		return item;
	};
};

export const opRequestsReducer = (state = initState, action) => {
	let pred;
	switch (action.type) {
		case GET_OPERATION_REQUESTS_SUCCESS:
			return { items: action.payload.items, total: action.payload.total };
		case DISABLE_REQUEST:
			const testDataItems = state.items.map(req => {
				if (req.request && req.request.request_id) {
					if (req.request.request_id === action.payload.requestId) {
						req._isDisabled = true;
					}
				} else if (req.request_id) {
					if (req.request_id === action.payload.requestId) {
						req._isDisabled = true;
					}
				}
				return req;
			});

			return { ...state.total, items: testDataItems };

		case wsEvents.cancelAcceptationMaker:
			pred = makerAcceptationPredicate(
				action.payload,
				action.type,
				"request acceptation was canceled"
			);
			break;

		case wsEvents.acceptRequestMaker:
			pred = makerAcceptationPredicate(action.payload, action.type, "request is accepted");
			break;

		case wsEvents.acceptRequestTaker:
			pred = takerAcceptationPredicate(
				action.payload,
				action.type,
				"request was accepted successfully"
			);
			break;

		case wsEvents.cancelAcceptationTaker:
			pred = takerAcceptationPredicate(
				action.payload,
				action.type,
				"request was canceled successfully"
			);
			break;

		case wsEvents.chooseAgentMaker:
			pred = chooseRequestMakerPredicate(action.payload);
			break;

		case wsEvents.chooseAgentTaker:
			pred = chooseRequestTakerPredicate(action.payload);
			break;

		case wsEvents.saveRequest:
			pred = saveRequestPredicate(action.payload);
			break;

		case wsEvents.newMessage:
			showNotification({ type: "success", msg: "You received new request" });
			return { ...state, total: state.total + 1, items: [action.payload, ...state.items] };

		case wsEvents.changeRequestStatusTaker:
			if (action.payload.status === requestStatus.complained) {
				pred = handleComplainStatusPredicate(action.payload);
			} else {
				// remove request from the list
				let takerItems = state.items.filter(
					item => item.request.requestId !== action.payload.requestId
				);
				return { ...state, items: takerItems };
			}
			break;
		case wsEvents.changeRequestStatusMaker:
			if (action.payload.status === requestStatus.complained) {
				pred = changeRequestStatusMakerPredicate(action.payload);
			} else {
				// remove request from the list
				let makerItems = state.items.filter(item => item.requestId !== action.payload.requestId);
				return { ...state, items: makerItems };
			}
			break;
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

		dispatch({
			type: GET_OPERATION_REQUESTS_SUCCESS,
			payload: data,
		});
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OPERATION_REQUESTS_FAILURE });
	}
};

export const disableRequest = requestId => {
	console.log("requestId", requestId);

	return {
		type: DISABLE_REQUEST,
		payload: { requestId },
	};
};
