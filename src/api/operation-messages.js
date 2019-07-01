import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export async function sendMessage(requestId, receivers = []) {
	const client = getRestClient();

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
		console.log(error);
		return handleReqError(error);
	}
}

export async function hideMessage(requestId) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.put(`operation-message/${requestId}/hide`, null, {
			headers: {
				...authHeaders,
			},
		});
		return data;
	} catch (error) {
		console.log(error);
		return handleReqError(error);
	}
}

export async function getMessages(params) {
	const client = getRestClient();

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
		console.log(error);
		return handleReqError(error);
	}
}
