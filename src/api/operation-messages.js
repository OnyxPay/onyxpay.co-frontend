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
