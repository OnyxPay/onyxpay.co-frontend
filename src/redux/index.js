import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { logsReducer } from "./logs";
import { walletReducer } from "./wallet";
import { contractsReducer } from "./contracts";
import { balanceReducer } from "./balance";
import { exchangeRatesReducer } from "./exchangeRates";

export default history =>
	combineReducers({
		router: connectRouter(history),
		logs: logsReducer,
		wallet: walletReducer,
		contracts: contractsReducer,
		balance: balanceReducer,
		exchangeRates: exchangeRatesReducer,
	});
