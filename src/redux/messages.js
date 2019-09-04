import { getMessages } from "api/operation-messages";
import { showNotification } from "components/notification.js";
import {
	wsEvents,
	operationMessageStatusNames,
	requestStatusNames,
	requestStatus,
} from "api/constants";
import { initState, enumerateItems, wsEventTypeToStatus } from "./requestsCommon";

import { DISABLE_OPERATION_REQ } from "./requests";
export const GET_OPERATION_MESSAGES_SUCCESS = "GET_OPERATION_MESSAGES_SUCCESS";
export const GET_OPERATION_MESSAGES_FAILURE = "GET_OPERATION_MESSAGES_FAILURE";
export const GET_OPERATION_MESSAGES_REQUEST = "GET_OPERATION_MESSAGES_REQUEST";
export const GET_OPERATION_MESSAGES = "GET_OPERATION_MESSAGES";

const takerAcceptationPredicate = (payload, type, notification) => {
	return item => {
		const status = wsEventTypeToStatus(type);
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
function removeRequestFromTheList(state, action) {
	let takerItems = state.items.filter(item => item.request.requestId !== action.payload.requestId);
	return { items: takerItems, total: state.total - 1 };
}

export const opMessagesReducer = (state = initState, action) => {
	let pred;
	switch (action.type) {
		case GET_OPERATION_MESSAGES_SUCCESS:
			return action.payload;

		case DISABLE_OPERATION_REQ:
			return disableOperationReq(state, action);

		case wsEvents.newMessage:
			try {
				showNotification({ type: "success", msg: "You received new request" }); // TODO: add details about request, link to page?
				const isStaleMsg = state.items.some(
					msg => msg.request.requestId === action.payload.request.requestId
				);
				if (state.requestType === action.payload.request.type && !isStaleMsg) {
					return { ...state, total: state.total + 1, items: [action.payload, ...state.items] };
				} else {
					return state;
				}
			} catch (e) {
				return state;
			}

		case wsEvents.acceptRequestTaker:
			pred = takerAcceptationPredicate(
				action.payload,
				action.type,
				"request was accepted successfully"
			);
			break;

		case wsEvents.cancelAcceptationTaker:
			return removeRequestFromTheList(state, action);

		case wsEvents.chooseAgentTaker:
			pred = chooseRequestTakerPredicate(action.payload);
			break;

		case wsEvents.changeRequestStatusTaker:
			if (
				action.payload.status === requestStatus.complained ||
				action.payload.status === requestStatus.rejected
			) {
				pred = handleComplainStatusPredicate(action.payload);
			} else {
				return removeRequestFromTheList(state, action);
			}
			break;
		default:
			return state;
	}
	return enumerateItems(state, pred);
};

export const getOpMessages = ({
	params = {}, // get params
	requestType, // deposit | withdraw | buy_onyx_cash
	fetchActive, // true | false
}) => async dispatch => {
	dispatch({ type: GET_OPERATION_MESSAGES_REQUEST });
	try {
		let data = await getMessages(params, requestType, fetchActive);

		dispatch({
			type: GET_OPERATION_MESSAGES_SUCCESS,
			payload: { ...data, requestType },
			fetchActive: fetchActive,
		});
	} catch (e) {
		console.log(e);
		dispatch({ type: GET_OPERATION_MESSAGES_FAILURE });
	}
};
