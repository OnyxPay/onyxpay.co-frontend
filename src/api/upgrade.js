import { getRestClient, getAuthHeaders } from "./network";

const restClient = getRestClient();

export async function sendUpgradeRequest(role) {
	const authHeaders = getAuthHeaders();
	const form = await restClient.post(
		"upgrade-request",
		{ role: role.toLowerCase() },
		{ headers: { ...authHeaders } }
	);
	return form;
}

export async function getUpgradeRequest() {
	const authHeaders = getAuthHeaders();
	const form = await restClient.get("/upgrade-request", { headers: { ...authHeaders } });
	return form;
}

export async function getPaymentForm(amount) {
	const authHeaders = getAuthHeaders();
	const form = await restClient.get("ipayform?amount=" + amount, {
		headers: {
			...authHeaders,
		},
	});
	return form;
}
