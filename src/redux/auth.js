import { restClient, makeFormDate, handleReqError } from "../api/network";

export const SIGN_UP = "SIGN_UP";

const initialState = {
	token: null,
};

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case SIGN_UP:
			return action.payload;
		default:
			return state;
	}
};

export const signUp = data => async (dispatch, getState) => {
	console.log(data);
	const formData = makeFormDate(data);
	formData.set("country_id", 1);

	try {
		const { data } = await restClient.post("sign-up", formData);
		dispatch({ type: SIGN_UP, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};
