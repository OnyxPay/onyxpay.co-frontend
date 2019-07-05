import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export async function searchUsers(params) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("users", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}
