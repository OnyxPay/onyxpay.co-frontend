import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { walletReducer } from "./wallet";
import { contractsReducer } from "./contracts";
import { balanceReducer } from "./balance";
import { userReducer } from "./user";
import { walletUnlockReducer } from "./walletUnlock";
import { authReducer } from "./auth";
import { settlementsReducer } from "./settlements";
import { loaderReducer } from "./loading";
import { sessionReducer } from "./session";
import { adminUsersReducer, setUserSettlementDataReducer } from "./admin-panel/users/index";
import { assetsReducer } from "./assets";

export default history =>
	combineReducers({
		router: connectRouter(history),
		user: userReducer,
		wallet: walletReducer,
		walletUnlock: walletUnlockReducer,
		contracts: contractsReducer,
		balance: balanceReducer,
		auth: authReducer,
		settlements: settlementsReducer,
		loading: loaderReducer,
		session: sessionReducer,
		adminUsers: adminUsersReducer,
		userSettlement: setUserSettlementDataReducer,
		assets: assetsReducer,
	});
