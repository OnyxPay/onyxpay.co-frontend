/* 
const UserScheme = {
	verified: boolean,
	firstName: "",
	lastName: "",
	role: ""
}
*/

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
