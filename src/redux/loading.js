export const START_LOADING = "START_LOADING";
export const FINISH_LOADING = "FINISH_LOADING";

export const loaderReducer = (state = false, action) => {
	switch (action.type) {
		case START_LOADING:
			return false;
		case FINISH_LOADING:
			return true;
		default:
			return state;
	}
};

export const startLoading = () => ({ type: START_LOADING });
export const finishLoading = () => ({ type: FINISH_LOADING });
