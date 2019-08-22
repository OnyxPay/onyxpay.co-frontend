import React from "react";
import { PageTitle } from "components/styled";
import { roles } from "api/constants";

export function parseRequestType({ pathname }) {
	switch (pathname) {
		case "/active-requests/deposit":
		case "/closed-requests/deposit":
		case "/active-customer-requests/deposit":
			return "deposit";
		case "/active-requests/withdraw":
		case "/closed-requests/withdraw":
		case "/active-customer-requests/withdraw":
			return "withdraw";
		case "/active-requests/deposit-onyx-cash":
		case "/closed-requests/deposit-onyx-cash":
		case "/active-customer-requests/deposit-onyx-cash":
		case "/closed-customer-requests/deposit-onyx-cash":
			return "buy_onyx_cash";
		default:
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

	if (requestType === "buy_onyx_cash") {
		requestType = "deposit OnyxCash";
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
	cancel: "cancel",
};

export function isThisAgentInitiator(userRole, location) {
	return (
		(userRole === roles.a || userRole === roles.sa) &&
		(location.pathname === "/active-requests/deposit-onyx-cash" ||
			location.pathname === "/closed-requests/deposit-onyx-cash")
	);
}
