export const syncNodeUrl = process.env.REACT_APP_SYNC_NODE_URL;
export const bcEndpoints = {
	ws: "wss://" + syncNodeUrl + ":20335",
	rest: "https://" + syncNodeUrl + ":20334",
};

export const backEndRestEndpoint = "https://" + process.env.REACT_APP_BACKEND_URL + "/api/v1/";
export const wssBackEnd = "wss://" + process.env.REACT_APP_BACKEND_URL;

export const wsEvents = {
	approveUpgradeRequest: "APPROVE_UPGRADE_REQUEST",
	rejectUpgradeRequest: "REJECT_UPGRADE_REQUEST",
	phoneNumberIsChanged: "PHONE_NUMBER_IS_CHANGED",
	upgradeUser: "UPDATE_USER",
};

export const gasCompensatorEndpoint = "https://cepheus-compensator.onyxpay.co/api";
export const addressOfHead = "87fd9b3718308de50fd639c9b9a411835936766a";
export const BackendUrl = process.env.REACT_APP_BACKEND_URL;

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
export const roleCodes = {
	user: 1,
	agent: 2,
	superagent: 3,
	adm: 4,
	super_admin: 100,
};
export const roleByCode = {
	1: roles.c,
	2: roles.a,
	3: roles.sa,
	4: roles.adm,
	100: roles.sadm,
};
export const notifyTimeout = 30000;

export const operationMessageStatus = {
	opened: 1,
	hided: 2,
	accepted: 3,
	canceled: 4,
};

export const operationMessageStatusNames = {
	[operationMessageStatus.opened]: "opened",
	[operationMessageStatus.hided]: "hided",
	[operationMessageStatus.accepted]: "accepted",
	[operationMessageStatus.canceled]: "canceled",
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

export const UpgradeRequestStatus = {
	Opened: 1,
	Completed: 2,
	Refused: 3,
	Closed: 4,
	Deleted: 5,
};
export const UpgradeRequestStatusNames = {
	[UpgradeRequestStatus.Opened]: "opened",
	[UpgradeRequestStatus.Completed]: "completed",
	[UpgradeRequestStatus.Refused]: "refused",
	[UpgradeRequestStatus.Closed]: "closed",
	[UpgradeRequestStatus.Deleted]: "deleted",
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
export const refreshBalanceEveryMsec = 30000;
