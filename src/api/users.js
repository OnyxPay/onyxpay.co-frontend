import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export async function searchUsers(params) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("admin/users", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (error) {
		console.log(error);
		return handleReqError(error);
	}
}
