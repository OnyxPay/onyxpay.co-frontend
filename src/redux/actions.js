import { setWallet, clearWallet } from "./wallet";
import { resolveContractAddress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { saveUser, getUserData } from "./user";
import {
	showWalletUnlockModal,
	hideWalletUnlockModal,
	setUnlockWallet,
	getWalletPassword,
} from "./walletUnlock";
import { signUp, login, confirmEmail, logOut } from "./auth";
import { startLoading, finishLoading } from "./loading";
import { getSettlementsList, add, deleteAccount } from "./settlements";
import { showSessionExpiredModal } from "./session";
import { getAssetsList, getExchangeRates } from "./assets";
import { exchangeAssets } from "./assetsExchange";

export default {
	wallet: { clearWallet, setWallet },
	contracts: { resolveContractAddress },
	balance: { setAssetsBalance, setOnyxCashBalance },
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
		add,
		deleteAccount,
	},
	loading: {
		startLoading,
		finishLoading,
	},
	session: {
		showSessionExpiredModal,
	},
	assets: {
		getAssetsList,
		getExchangeRates,
	},
	exchangeAssets: {
		exchangeAssets,
	},
};
