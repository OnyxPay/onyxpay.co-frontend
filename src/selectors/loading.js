import { get } from "lodash";
export const createLoadingSelector = actions => state => {
	return actions.some(action => get(state, `globalLoading.${action}`));
};
