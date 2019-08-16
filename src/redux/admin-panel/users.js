import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";

const client = getRestClient();
const SAVE_ADMIN_USERS_DATA = "SAVE_ADMIN_USERS_DATA";
const SAVE_USER_SETTLEMENT_DATA = "USER_SETTLEMENT_DATA";
const UPDATE_ADMIN_USER_STATUS = "UPDATE_ADMIN_USER_STATUS";

export const adminUsersReducer = (state = [], action) => {
	switch (action.type) {
		case SAVE_ADMIN_USERS_DATA:
			return action.payload;
		case UPDATE_ADMIN_USER_STATUS:
			return state.map(user => {
				if (user.user_id === action.payload.userId) {
					return {
						...user,
						statusCode: action.payload.status,
						status: action.payload.status === 1 ? "active" : "blocked",
					};
				}
				return user;
			});
		default:
			return state;
	}
};

export const setUserSettlementDataReducer = (state = [], action) => {
	switch (action.type) {
		case SAVE_USER_SETTLEMENT_DATA:
			return action.payload;
		default:
			return state;
	}
};

export const saveUsers = users => {
	return { type: SAVE_ADMIN_USERS_DATA, payload: users };
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

export const updateUserStatus = (userId, status) => {
	return { type: UPDATE_ADMIN_USER_STATUS, payload: { userId, status } };
};

export const saveUserSettlementData = userSettlements => {
	return { type: SAVE_USER_SETTLEMENT_DATA, payload: userSettlements };
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

export const blockedUsersData = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`/admin/users?status="blocked"`, {
			headers: {
				...authHeaders,
			},
		});
		return { blockedUsersData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
