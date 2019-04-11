import { writeLog, clearLogs } from "./logs";
import { setWallet, clearWallet } from "./wallet";
import { resolveContractsAdress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { setExchangeRates } from "./exchangeRates";

export default {
	wallet: { clearWallet, setWallet },
	logs: { writeLog, clearLogs },
	contracts: { resolveContractsAdress },
	balance: { setAssetsBalance, setOnyxCashBalance },
	exchangeRates: { setExchangeRates },
};
