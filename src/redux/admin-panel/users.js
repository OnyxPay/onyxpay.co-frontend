import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";

const client = getRestClient();

const usersData = sessionStorage.getItem("adminUsers");
const initialState = (usersData && JSON.parse(usersData)) || null;

const ADMIN_USERS = "ADMIN_USERS";
const USER_SETTLEMENT_DATA = "USER_SETTLEMENT_DATA";

export const adminUsersReducer = (state = initialState, action) => {
	switch (action.type) {
		case ADMIN_USERS:
			sessionStorage.setItem("adminUsers", JSON.stringify(action.payload));
			return action.payload;
		case USER_SETTLEMENT_DATA:
			sessionStorage.setItem("userSettlementData", JSON.stringify(action.payload));
			return action.payload;
		default:
			return state;
	}
};

export const saveUsers = users => {
	return { type: ADMIN_USERS, payload: users };
};

export const getUsersData = () => async (dispatch, getState) => {
	console.log(0);
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/users/search", {
			headers: {
				...authHeaders,
			},
		});
		console.log(data.items);
		dispatch(saveUsers(data.items));
		return { adminUsers: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const saveUserSettlementData = userSettlements => ({
	type: USER_SETTLEMENT_DATA,
	payload: userSettlements,
});

export const getUserSetElementData = user_id => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/users/search", {
			headers: {
				...authHeaders,
			},
		});
		console.log(data.items);
		dispatch(saveUserSettlementData(data.items));
		return { adminUsers: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
