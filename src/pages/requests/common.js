import React from "react";
import { PageTitle } from "components/styled";

export function parseRequestType({ match, push }) {
	if (match.params.type === "withdraw") {
		return "withdraw";
	} else if (match.params.type === "deposit") {
		return "deposit";
	} else {
		push("/requests"); // redirect to 404
		return null;
	}
}

export function renderPageTitle({ requestType, isRequestClosed, isUserInitiator }) {
	let requestStatus;
	if (isRequestClosed) {
		requestStatus = "Closed";
	} else {
		requestStatus = "Active";
	}

	if (isUserInitiator) {
		return (
			<PageTitle>
				{requestStatus} {requestType} requests
			</PageTitle>
		);
	} else {
		return (
			<PageTitle>
				{requestStatus} customer {requestType} requests
			</PageTitle>
		);
	}
}

export const aa = {
	// active action
	accept: "accept",
	perform: "perform",
	cancelAccepted: "cancelAccepted",
	complain: "complain",
};
