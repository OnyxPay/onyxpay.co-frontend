export const bcEndpoints = {
	ws: "wss://cepheus5.onyxpay.co:20335",
	rest: "https://cepheus5.onyxpay.co:20334",
};

export const backEndRestEndpoint = "https://preprod.onyxpay.co/api/v1/";
export const gasCompensatorEndpoint = "https://cepheus-compensator.onyxpay.co/api";

export const addressOfHead = "9459005e778d990b7edd4447be277e3dd61785be";

// TODO: get address from Head
export const OnyxCashDecimals = 8;
export const OnyxCashSymbol = "OCH";

export const BackendUrl = "https://preprod.onyxpay.co";
export const temporaryToken =
	"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvcHJlcHJvZC5vbnl4cGF5LmNvXC9hcGlcL3YxXC9zaWduLXVwIiwiaWF0IjoxNTU4MTk2MzkwLCJleHAiOjE1NTgxOTk5OTAsIm5iZiI6MTU1ODE5NjM5MCwianRpIjoid3cxR0RDb1h6TXZWektuNCIsInN1YiI6MTksInBydiI6IjQzZDY4YjU4M2JhNTMwN2Y5ZWUyY2RkZTE0ZDBiYThlZmVjN2M1MTcifQ.6vs_nn0KPTkuKmIV77X4XMmJyCMG6se9xxJj3noUSMs";
export const tempWalletPassword = {};

export const roles = {
	c: "user",
	a: "agent",
	sa: "superagent", // at back-end
	adm: "admin",
	sadm: "super_admin",
};

export const notifyTimeout = 30000;

export const operationMessageStatus = {
	opened: 1,
	hidden: 2,
	accepted: 3,
	canceled: 4, // agent canceled a request
};

export const requestStatus = {
	pending: 0,
	opened: 1,
	choose: 2,
	rejected: 3, // client canceled a request
	canceled: 4, // client called /api/v1/operation-request/{requestId}/cancel
	complained: 5,
	completed: 6,
	closed: 7, //  not set at back-end now
};
