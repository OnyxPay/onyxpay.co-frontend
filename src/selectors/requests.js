export function createRequestsDataSelector(state, type, status) {
	if (type === "deposit") {
		if (status === "active") {
			return state.activeDepositRequests;
		} else {
			return state.closedDepositRequests;
		}
	} else if (type === "withdraw") {
		if (status === "active") {
			return state.activeWithdrawRequests;
		} else {
			return state.closedWithdrawRequests;
		}
	} else if (type === "depositOnyxCash") {
		if (status === "active") {
			return state.activeDepositOcRequests;
		} else {
			return state.closedDepositOcRequests;
		}
	}
}
