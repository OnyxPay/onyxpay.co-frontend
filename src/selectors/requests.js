export function createRequestsDataSelector(state, type) {
	if (type === "deposit") {
		return state.activeDepositRequests;
	} else if (type === "withdraw") {
		return state.activeWithdrawRequests;
	}
}
