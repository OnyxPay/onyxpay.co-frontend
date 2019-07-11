export const bcEndpoints = {
	ws: "wss://cepheus5.onyxpay.co:20335",
	rest: "https://cepheus5.onyxpay.co:20334",
};

// export const backEndRestEndpoint = "https://10.100.3.189/api/v1/";
export const backEndRestEndpoint = "https://preprod.onyxpay.co/api/v1/";
export const gasCompensatorEndpoint = "https://cepheus-compensator.onyxpay.co/api";
export const addressOfHead = "87fd9b3718308de50fd639c9b9a411835936766a";
export const BackendUrl = "https://preprod.onyxpay.co";

export const OnyxCashDecimals = 8;
export const onyxCashSymbol = "oCASH";

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

export const userStatus = {
	wait: 0,
	active: 1,
	blocked: 2,
	deleted: 3,
};

export const userStatusNames = {
	[userStatus.wait]: "wait",
	[userStatus.active]: "active",
	[userStatus.blocked]: "blocked",
	[userStatus.deleted]: "deleted",
};

export const h12Mc = 12 * 60 * 60 * 1000;
export const h24Mc = 24 * 60 * 60 * 1000;
