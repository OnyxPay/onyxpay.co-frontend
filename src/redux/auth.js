import { getRestClient, makeFormDate, handleReqError } from "../api/network";
const client = getRestClient();
export const SIGN_UP = "SIGN_UP";

const initialState = {
	token: null,
};

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case SIGN_UP:
			sessionStorage.setItem("token", action.payload.token);
			return action.payload;
		default:
			return state;
	}
};

export const signUp = data => async (dispatch, getState) => {
	const formData = makeFormDate(data);
	formData.set("country_id", 1);

	try {
		const { data } = await client.post("sign-up", formData);
		dispatch({ type: SIGN_UP, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};
