import { getRestClient, handleReqError, getAuthHeaders } from "./network";
const client = getRestClient();

export async function sendMessage(requestId, receivers = []) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.post(
			`operation-request/${requestId}/messages`,
			{ receivers },
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
		const { data } = await client.put(`operation-message/${requestId}/hide`, null, {
			headers: {
				...authHeaders,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function getMessages(params) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("operation-messages", {
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

export async function getMessagesForClosedRequests(params) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("operation-messages/close-requests", {
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
