import { setWallet, clearWallet } from "./wallet";
import { resolveContractAddress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { setExchangeRates } from "./exchangeRates";
import { saveUser, getUserData } from "./user";
import {
	showWalletUnlockModal,
	hideWalletUnlockModal,
	setUnlockWallet,
	getWalletPassword,
} from "./walletUnlock";
import { signUp, login, confirmEmail, logOut } from "./auth";
import {
	getSettlementsList,
	setSettlements,
	addSettlement,
	deleteSettlement,
	deleteItem,
	addItem,
} from "./settlements";

export default {
	wallet: { clearWallet, setWallet },
	contracts: { resolveContractAddress },
	balance: { setAssetsBalance, setOnyxCashBalance },
	exchangeRates: { setExchangeRates },
	user: { saveUser, getUserData },
	walletUnlock: {
		showWalletUnlockModal,
		hideWalletUnlockModal,
		setUnlockWallet,
		getWalletPassword,
	},
	auth: { signUp, login, confirmEmail, logOut },
	settlements: {
		getSettlementsList,
		setSettlements,
		addSettlement,
		deleteSettlement,
		deleteItem,
		addItem,
	},
};
