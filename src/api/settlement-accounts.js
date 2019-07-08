import { getRestClient, handleReqError, getAuthHeaders } from "./network";
const client = getRestClient();

export async function getSettlementsByUserId(userId) {
	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get(`user/${userId}/settlements`, {
			headers: {
				...authHeaders,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}
