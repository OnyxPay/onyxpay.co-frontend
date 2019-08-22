import { getRequests } from "api/requests";
import { showNotification } from "components/notification.js";
import {
	wsEvents,
	requestStatusNames,
	operationMessageStatusNames,
	requestStatus,
} from "api/constants";
import { initState, enumerateItems, wsEventTypeToStatus } from "./requestsCommon";

export const GET_OPERATION_REQUESTS_REQUEST = "GET_OPERATION_REQUESTS_REQUEST";
export const GET_OPERATION_REQUESTS_SUCCESS = "GET_OPERATION_REQUESTS_SUCCESS";
export const GET_OPERATION_REQUESTS_FAILURE = "GET_OPERATION_REQUESTS_FAILURE";
export const GET_OPERATION_REQUESTS = "GET_OPERATION_REQUESTS";
export const DISABLE_OPERATION_REQ = "DISABLE_OPERATION_REQ";

const makerAcceptationPredicate = (payload, type, notification) => {
	return item => {
		const status = wsEventTypeToStatus(type);
		if (item.requestId === payload.requestId) {
			let newItem = item;
			let message = item.type + " " + notification;
			showNotification({ type: "success", msg: message });
			newItem.operationMessages = item.operationMessages.map(message => {
				if (message.receiver.user_id === payload.receiverUserId) {
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

function disableOperationReq(state, action) {
	const modifiedItems = state.items.map(req => {
		if (req.request && req.request.requestId) {
			if (req.request.requestId === action.payload.requestId) {
				req._isDisabled = true;
			}
		} else if (req.requestId) {
			if (req.requestId === action.payload.requestId) {
				req._isDisabled = true;
			}
		}
		return req;
	});

	return { ...state, items: modifiedItems };
}
export const opRequestsReducer = (state = initState, action) => {
	let pred;
	switch (action.type) {
		case GET_OPERATION_REQUESTS_SUCCESS:
			return action.payload;
		case DISABLE_OPERATION_REQ:
			return disableOperationReq(state, action);

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

		case wsEvents.chooseAgentMaker:
			pred = chooseRequestMakerPredicate(action.payload);
			break;

		case wsEvents.changeRequestStatusMaker:
			if (action.payload.status === requestStatus.complained) {
				pred = changeRequestStatusMakerPredicate(action.payload);
			} else {
				// remove request from the list
				let makerItems = state.items.filter(item => item.requestId !== action.payload.requestId);
				return { items: makerItems, total: state.total - 1 };
			}
			break;
		default:
			return state;
	}
	return enumerateItems(state, pred, action.type);
};

export const getOpRequests = ({
	params = {}, // get params
	fetchActive, // true | false
}) => async dispatch => {
	dispatch({ type: GET_OPERATION_REQUESTS_REQUEST });
	try {
		let data = await getRequests(params);
		dispatch({
			type: GET_OPERATION_REQUESTS_SUCCESS,
			payload: data,
			fetchActive: fetchActive,
		});
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OPERATION_REQUESTS_FAILURE });
	}
};

export const disableRequest = requestId => {
	return {
		type: DISABLE_OPERATION_REQ,
		payload: { requestId },
	};
};
