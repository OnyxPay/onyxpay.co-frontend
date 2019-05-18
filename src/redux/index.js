import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { walletReducer } from "./wallet";
import { contractsReducer } from "./contracts";
import { balanceReducer } from "./balance";
import { exchangeRatesReducer } from "./exchangeRates";
import { userReducer } from "./user";
import { walletUnlockReducer } from "./walletUnlock";

export default history =>
	combineReducers({
		router: connectRouter(history),
		user: userReducer,
		wallet: walletReducer,
		walletUnlock: walletUnlockReducer,
		contracts: contractsReducer,
		balance: balanceReducer,
		exchangeRates: exchangeRatesReducer,
	});
