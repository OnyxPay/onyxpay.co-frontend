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
				const { data, status } = error.response;
				// TODO: change status to 401, after API fix
				if (data.error === "Unauthenticated." && status === 403) {
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
	return sessionStorage.getItem("token");
}

export function getAuthHeader() {
	const token = getToken();
	if (token) {
		return {
			Authorization: `Bearer ${token}`,
		};
	}
	throw new Error("no token");
}

export function handleReqError(error) {
	if (error.response) {
		console.error(error.message, error.response);

		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		if (
			error.response.status === 422 ||
			error.response.status === 403 ||
			error.response.status === 401
		) {
			return {
				error: {
					data: error.response.data,
					status: error.response.status,
				},
			};
		}
		// 403, 401 invalid credentials
	} else if (error.request) {
		// The request was made but no response was received
		console.error(error.message, error.request);
		message.error("Network error", 5);
		return { error: { message: "Server does not respond" } };
	} else {
		// Something happened in setting up the request that triggered an Error
		console.error(error.message, error);
		message.error("Network error", 5);
		return {
			error: {
				message: "Error happened in setting up the request",
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
