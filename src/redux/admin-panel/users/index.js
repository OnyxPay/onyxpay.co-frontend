import { getRestClient, handleReqError, getAuthHeaders } from "../../../api/network";

const client = getRestClient();

const usersData = sessionStorage.getItem("adminUsers");
const userSettlement = sessionStorage.getItem("userSettlementData");
const initialState = (usersData && JSON.parse(usersData)) || null;
const initialState2 = (userSettlement && JSON.parse(userSettlement)) || null;
const ADMIN_USERS = "ADMIN_USERS";
const USER_SETTLEMENT_DATA = "USER_SETTLEMENT_DATA";

export const adminUsersReducer = (state = initialState, action) => {
	switch (action.type) {
		case ADMIN_USERS:
			sessionStorage.setItem("adminUsers", JSON.stringify(action.payload));
			return action.payload;
		default:
			return state;
	}
};

export const setUserSettlementDataReducer = (state = initialState2, action) => {
	switch (action.type) {
		case USER_SETTLEMENT_DATA:
			sessionStorage.setItem("userSettlement", JSON.stringify(action.payload));
			return action.payload;
		default:
			return state;
	}
};

export const saveUsers = users => {
	return { type: ADMIN_USERS, payload: users };
};

export const getUsersData = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/users", {
			headers: {
				...authHeaders,
			},
		});
		dispatch(saveUsers(data.items));
		return { adminUsers: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const saveUserSettlementData = userSettlements => {
	return { type: USER_SETTLEMENT_DATA, payload: userSettlements };
};

export const getUserSettlementData = user_id => async (dispatch, getState) => {
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
