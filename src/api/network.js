import axios from "axios";
import { WebsocketClient, RestClient } from "ontology-ts-sdk";
import { bcEndpoints, backEndRestEndpoint } from "./constants";
import { message } from "antd";

const bcWsClient = new WebsocketClient(bcEndpoints.ws, false, false);
const bcRestClient = new RestClient(bcEndpoints.rest);

export function getBcClient(rest) {
	if (rest) {
		return bcWsClient;
	}
	return bcRestClient;
}

export function getRestClient({ type } = {}) {
	if (type === "explorer") {
		return axios;
	}
	return customRestClient;
}

export function getToken() {
	return sessionStorage.getItem("token");
}

const token = getToken();

export const customRestClient = axios.create({
	baseURL: backEndRestEndpoint,
	headers: { Authorization: token && `Bearer ${token}` },
	withCredentials: token ? true : false,
});

export function handleReqError(error) {
	if (error.response) {
		console.error(error.message, error.response);

		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		if (error.response.status === 422) {
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

export function makeFormDate(data) {
	const formData = new FormData();

	for (const field in data) {
		if (data.hasOwnProperty(field)) {
			formData.append(field, data[field]);
		}
	}
	return formData;
}
