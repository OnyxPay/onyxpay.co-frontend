import { wsEvents } from "api/constants";

const initialState = {
	amount: null,
	assetsRewards: [],
};
const SET_REWARDS_BALANCE = "SET_REWARDS_BALANCE";
export const rewardsReducer = (state = initialState, action) => {
	switch (action.type) {
		case wsEvents.updateReward:
			return {
				amount: state.amount + action.payload.amount / 10 ** 8,
			};
		case SET_REWARDS_BALANCE:
			return action.payload;
		default:
			return state;
	}
};

export const setConsolidatedRewardsBalance = rewards => {
	const rewardsAssetsBalance = rewards.operationRewards.perAsset;
	const consolidatedRewards = rewards.operationRewards.consolidated;
	let assetsRewards = [];

	for (var key in rewardsAssetsBalance) {
		assetsRewards.push({
			symbol: key,
			amount: rewardsAssetsBalance[key],
		});
	}

	return {
		type: SET_REWARDS_BALANCE,
		payload: { assetsRewards: assetsRewards, amount: consolidatedRewards },
	};
};
