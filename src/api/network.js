import axios from "axios";
import { WebsocketClient, RestClient } from "ontology-ts-sdk";
import {
	bcEndpoints,
	backEndRestEndpoint,
	gasCompensatorEndpoint,
	gasCompensatorTimeout,
} from "./constants";
import { getStore } from "../store";
import { showSessionExpiredModal } from "../redux/session";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError, UnlockWalletError } from "utils/custom-error";
import { TimeoutError } from "promise-timeout";
import { logOut } from "redux/auth";
import { showUserIsBlockedNotification } from "components/notification";

const bcWsClient = new WebsocketClient(bcEndpoints.ws, false, false);
const bcRestClient = new RestClient(bcEndpoints.rest);

export function getBcClient(rest) {
	if (rest) {
		return bcRestClient;
	}
	return bcWsClient;
}

export function getRestClient({ type } = {}) {
	if (type === "explorer") {
		return axios;
	} else if (type === "gas") {
		return axios.create({ baseURL: gasCompensatorEndpoint, timeout: gasCompensatorTimeout });
	}
	return createCustomRestClient();
}

function createCustomRestClient() {
	const customRestClient = axios.create({
		baseURL: backEndRestEndpoint,
	});

	customRestClient.interceptors.response.use(
		res => res,
		error => {
			if (error.response) {
				const { status, data } = error.response;
				const store = getStore();
				const { user } = store.getState();
				if (status === 401) {
					store.dispatch(showSessionExpiredModal());
				} else if (
					status === 403 &&
					user &&
					data &&
					data.errors &&
					data.errors.hasOwnProperty("user_status")
				) {
					showUserIsBlockedNotification();
					setTimeout(() => {
						store.dispatch(logOut(true));
					}, 5000);
				}
			}
			return Promise.reject(error);
		}
	);

	return customRestClient;
}

export function getToken() {
	return {
		OnyxAuth: localStorage.getItem("OnyxAuth"),
		OnyxAddr: localStorage.getItem("OnyxAddr"),
	};
}

export function getAuthHeaders() {
	const { OnyxAuth, OnyxAddr } = getToken();
	if (OnyxAuth && OnyxAddr) {
		return {
			OnyxAuth,
			OnyxAddr,
		};
	}
	throw new Error("no token");
}

export function handleReqError(error) {
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		if (error.response.status === 404) {
			showNotification({
				type: "error",
				msg: "Error 404",
				desc: "Not Found",
			});
		} else if (error.response.status === 403) {
			showNotification({
				type: "error",
				msg: "Error 403",
				desc: "Forbidden",
			});
		} else if (error.response.status >= 400 && error.response.status < 500) {
			return {
				error: {
					data: error.response.data.errors,
					status: error.response.status,
				},
			};
			// 401 invalid credentials
			// 403 forbidden
			// 400 validation error
			// 422 Unprocessable Entity
			// 403 Forbidden - blocked user?????
		} else if (error.response.status >= 500) {
			showNotification({
				type: "error",
				msg: "Server error",
				desc: "Something went wrong at the server side",
			});
		}
	} else if (error.request) {
		// The request was made but no response was received
		showNotification({
			type: "error",
			msg: "Server error",
			desc: "Request is timed out. Something went wrong at the server side",
		});
		return { error: { message: "Something went wrong at the server side" } };
	} else {
		// Something happened in setting up the request that triggered an Error
		showNotification({
			type: "error",
			msg: "Something went wrong",
		});
		return {
			error: {
				message: "Something went wrong",
			},
		};
	}
}

export function handleBcError(e) {
	if (process.env.NODE_ENV === "development") console.dir(e);

	if (e instanceof UnlockWalletError) {
		return null; // just ignore for now
	} else if (e instanceof GasCompensationError) {
		showGasCompensationError();
	} else if (e instanceof SendRawTrxError) {
		showBcError(e.message);
	} else if (e instanceof TimeoutError) {
		showTimeoutNotification();
	} else {
		showNotification({
			type: "error",
			msg: e.message,
		});
	}
}
