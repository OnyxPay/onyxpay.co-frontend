let syncNodeUrl;
let reactAppBackendUrl;
let headAddress;
let compensatorUrl;
if (process.env.REACT_APP_TAG === "prod") {
	reactAppBackendUrl = "www.onyxpay.co";
	syncNodeUrl = "andromeda-sync.onyxpay.co";
	headAddress = "9a54f5d022fe964d32881a7ed8fe36795ec37c27";
	compensatorUrl = "https://andromeda-compensator.onyxpay.co/api";
} else if (process.env.REACT_APP_TAG === "preprod") {
	reactAppBackendUrl = "preprod.onyxpay.co";
	syncNodeUrl = "cepheus5.onyxpay.co";
	headAddress = "87fd9b3718308de50fd639c9b9a411835936766a";
	compensatorUrl = "https://cepheus-compensator.onyxpay.co/api";
} else {
	reactAppBackendUrl = "10.0.75.2";
	syncNodeUrl = "10.0.75.2";
	headAddress = "1177a03284dad7cef227a19ec9756993566fd38e";
	compensatorUrl = "localhost:4444/api";
}

export const bcEndpoints = {
	ws: "wss://" + syncNodeUrl + ":20335",
	rest: "https://" + syncNodeUrl + ":20334",
};
export const backEndRestEndpoint = "https://" + reactAppBackendUrl + "/api/v1/";
export const wssBackEnd = "wss://" + reactAppBackendUrl;

export const wsEvents = {
	approveUpgradeRequest: "APPROVE_UPGRADE_REQUEST",
	rejectUpgradeRequest: "REJECT_UPGRADE_REQUEST",
	phoneNumberIsChanged: "PHONE_NUMBER_IS_CHANGED",
	upgradeUser: "UPDATE_USER",
	saveRequest: "SAVE_REQUEST",
	chooseAgentMaker: "CHOOSE_AGENT_MAKER",
	chooseAgentTaker: "CHOOSE_AGENT_TAKER",
	newMessage: "NEW_MESSAGE",
	acceptRequestMaker: "ACCEPT_REQUEST_MAKER",
	acceptRequestTaker: "ACCEPT_REQUEST_TAKER",
	changeRequestStatusMaker: "CHANGE_REQUEST_STATUS_MAKER",
	changeRequestStatusTaker: "CHANGE_REQUEST_STATUS_TAKER",
	cancelAcceptationMaker: "CANCEL_ACCEPTATION_MAKER",
	cancelAcceptationTaker: "CANCEL_ACCEPTATION_TAKER",
	updateReward: "UPDATE_REWARD",
};

export const gasCompensatorEndpoint = compensatorUrl;
export const addressOfHead = headAddress;
export const BackendUrl = reactAppBackendUrl;

export const OnyxCashDecimals = 8;
export const onyxCashSymbol = "OnyxCash";

export const tempWalletPassword = {};

export const roles = {
	c: "user",
	a: "agent",
	sa: "superagent", // at back-end
	support: "support",
	adm: "admin",
	sadm: "super_admin",
};
export const roleCodes = {
	user: 1,
	agent: 2,
	superagent: 3,
	support: 10,
	adm: 50,
	super_admin: 100,
};
export const roleByCode = {
	1: roles.c,
	2: roles.a,
	3: roles.sa,
	10: roles.support,
	50: roles.adm,
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

export const requestStatusNames = {
	0: "pending",
	1: "opened",
	2: "choose",
	3: "rejected",
	4: "canceled",
	5: "complained",
	6: "completed",
	7: "closed",
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

export const operationType = {
	deposit: 1,
	withdraw: 2,
	buyOnyxCache: 3,
};

export const h12Mc = 12 * 60 * 60 * 1000;
export const h24Mc = 24 * 60 * 60 * 1000;
export const refreshBalanceEveryMsec = 30000;

export const gasCompensatorTimeout = 30000;

export const supportEmail = "support@onyxpay.co";

export const paymentAmountByRole = {
	[roles.a]: 800,
	[roles.sa]: 100000
}
