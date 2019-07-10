import React from "react";
import { PageTitle } from "components/styled";
import { roles } from "api/constants";

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

export function renderPageTitle({ userRole, requestType, isRequestClosed }) {
	let requestStatus;
	if (isRequestClosed) {
		requestStatus = "Closed";
	} else {
		requestStatus = "Active";
	}

	if (userRole === roles.c) {
		return (
			<PageTitle>
				{requestStatus} {requestType} requests
			</PageTitle>
		);
	} else if (userRole === roles.a) {
		return (
			<PageTitle>
				{requestStatus} customer {requestType} requests
			</PageTitle>
		);
	}
}
