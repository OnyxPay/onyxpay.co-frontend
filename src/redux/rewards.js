import { wsEvents } from "api/constants";

const initialState = {
	amount: null,
};
const SET_REWARDS_BALANCE = "SET_REWARDS_BALANCE";
export const rewardsReducer = (state = initialState, action) => {
	switch (action.type) {
		case wsEvents.updateReward:
			return {
				amount: state.amount + action.payload.amount / 10 ** 8,
			};
		case SET_REWARDS_BALANCE:
			return {
				amount: action.payload,
			};
		default:
			return state;
	}
};

export const setConsolidatedRewardsBalance = balance => {
	return {
		type: SET_REWARDS_BALANCE,
		payload: balance,
	};
};
