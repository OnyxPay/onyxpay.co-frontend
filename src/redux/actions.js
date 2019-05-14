import { writeLog, clearLogs } from "./logs";
import { setWallet, clearWallet } from "./wallet";
import { resolveContractAddress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { setExchangeRates } from "./exchangeRates";
import { saveUser } from "./user";
import { showWalletUnlockModal, hideWalletUnlockModal } from "./walletUnlock";

export default {
	wallet: { clearWallet, setWallet },
	logs: { writeLog, clearLogs },
	contracts: { resolveContractAddress },
	balance: { setAssetsBalance, setOnyxCashBalance },
	exchangeRates: { setExchangeRates },
	user: { saveUser },
	walletUnlock: { showWalletUnlockModal, hideWalletUnlockModal },
};
