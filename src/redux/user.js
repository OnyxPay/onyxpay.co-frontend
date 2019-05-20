import { getRestClient, handleReqError } from "../api/network";

const client = getRestClient();

const initialState = null;

const SAVE_USER = "SAVE_USER";

export const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case SAVE_USER:
			return action.payload;
		default:
			return state;
	}
};

export const saveUser = user => {
	return { type: SAVE_USER, payload: user };
};

export const getUserData = () => async (dispatch, getState) => {
	try {
		const { data } = await client.post("info");
		console.log(data);
		dispatch(saveUser(data));
		return { user: data };
	} catch (er) {
		return handleReqError(er);
	}
};
