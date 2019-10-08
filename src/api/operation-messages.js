import { getRestClient, handleReqError, getAuthHeaders } from "./network";
const client = getRestClient();

export async function sendMessage(requestId, receivers = []) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.post(
			`operation-request/${requestId}/messages`,
			{
				receivers,
				_notify: true,
			},
			{
				headers: {
					...authHeaders,
				},
			}
		);
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function hideMessage(requestId) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.put(
			`operation-message/${requestId}/hide`,
			{
				_notify: true,
			},
			{
				headers: {
					...authHeaders,
				},
			}
		);
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function getMessages(params, requestType, fetchActive) {
	let requestStatus = "active-requests";
	if (!fetchActive) {
		requestStatus = "close-requests";
	}

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get(`operation-messages/${requestType}/${requestStatus}`, {
			headers: {
				...authHeaders,
			},
			params,
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}
