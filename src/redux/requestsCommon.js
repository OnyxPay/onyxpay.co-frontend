import { wsEvents, operationMessageStatus } from "api/constants";

export const initState = {
	items: [],
	total: null,
};

export function enumerateItems(state, pred) {
	if (state.items && pred) {
		let items = state.items.map(el => {
			return pred(el, state);
		});
		return { ...state, items: items };
	}
	return state;
}

export function wsEventTypeToStatus(type) {
	switch (type) {
		case wsEvents.acceptRequestTaker:
		case wsEvents.acceptRequestMaker:
			return operationMessageStatus.accepted;
		case wsEvents.cancelAcceptationTaker:
		case wsEvents.cancelAcceptationMaker:
			return operationMessageStatus.canceled;
		default:
			return operationMessageStatus.opened;
	}
}
