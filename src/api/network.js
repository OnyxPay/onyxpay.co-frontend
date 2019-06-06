import axios from "axios";
import { WebsocketClient, RestClient } from "ontology-ts-sdk";
import { bcEndpoints, backEndRestEndpoint } from "./constants";
import { message } from "antd";
import { getStore } from "../store";
import { showSessionExpiredModal } from "../redux/session";

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
				const { status } = error.response;
				if (status === 401) {
					const store = getStore();
					store.dispatch(showSessionExpiredModal());
				}
			}
			return Promise.reject(error);
		}
	);

	return customRestClient;
}

export function getToken() {
	return {
		OnyxAuth: sessionStorage.getItem("OnyxAuth"),
		OnyxAddr: sessionStorage.getItem("OnyxAddr"),
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
			message.error("Something went wrong at the server side", 5);
		} else if (error.response.status >= 400 && error.response.status < 500) {
			return {
				error: {
					data: error.response.data.errors,
					status: error.response.status,
				},
			};
			// 403, 401 invalid credentials
			// 400 validation error
			// 422 Unprocessable Entity
		} else if (error.response.status >= 500) {
			message.error("Something went wrong at the server side", 5);
		}
	} else if (error.request) {
		// The request was made but no response was received
		message.error("Something went wrong at the server side", 5);
		return { error: { message: "Something went wrong at the server side" } };
	} else {
		// Something happened in setting up the request that triggered an Error
		message.error("Something went wrong", 5);
		return {
			error: {
				message: "Something went wrong",
			},
		};
	}
}

export function makeFormData(data) {
	const formData = new FormData();

	for (const field in data) {
		if (data.hasOwnProperty(field)) {
			formData.append(field, data[field]);
		}
	}
	return formData;
}
