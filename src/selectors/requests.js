export function createClosedRequestsDataSelector(state, isUser, isAgentInitiator) {
	if (isUser || isAgentInitiator) {
		return state.opRequests;
	} else {
		return state.opMessages;
	}
}
