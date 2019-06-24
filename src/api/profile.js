import { getRestClient, getAuthHeaders } from "./network";

const restClient = getRestClient();

export async function getTelegramBotLink() {
	const authHeaders = getAuthHeaders();
	const form = await restClient.put("/profile/phone", null, { headers: { ...authHeaders } });
	return form;
}
