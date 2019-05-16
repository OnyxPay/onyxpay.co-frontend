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
	const formData = makeFormDate(data);

	formData.append(
		"public_key",
		"0364851c12f1f8d753333faf521bd50b7cbd72251a6d651871bc3bef1c27311932a"
	);
	formData.append("wallet_addr", "AK3Axgz3dJyUWbzmyZDbixyn5TVZJxM8wu");
	formData.set("country_id", 1);

	try {
		const { data } = await restClient.post("sign-up", formData);
		dispatch({ type: SIGN_UP, payload: data });
	} catch (er) {
		return handleReqError(er);
	}
};
