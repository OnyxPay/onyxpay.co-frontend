import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";

const client = getRestClient();
const ADMIN_USERS = "ADMIN_USERS";
const USER_SETTLEMENT_DATA = "USER_SETTLEMENT_DATA";

export const adminUsersReducer = (state, action) => {
	switch (action.type) {
		case ADMIN_USERS:
			return action.payload;
		default:
			return state || null;
	}
};

export const setUserSettlementDataReducer = (state, action) => {
	switch (action.type) {
		case USER_SETTLEMENT_DATA:
			return action.payload;
		default:
			return state || null;
	}
};

export const saveUsers = users => {
	return { type: ADMIN_USERS, payload: users };
};

export const getUsersData = params => async dispatch => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/users", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		dispatch(saveUsers(data.items));
		return { adminUsers: data };
	} catch (er) {
		return handleReqError(er);
	}
};

export const saveUserSettlementData = userSettlements => {
	return { type: USER_SETTLEMENT_DATA, payload: userSettlements };
};

export const getUserSettlementData = user_id => async dispatch => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`admin/user/${user_id}/settlements`, {
			headers: {
				...authHeaders,
			},
		});
		dispatch(saveUserSettlementData(data.items));
		return { userSettlementData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
