import { setWallet, clearWallet } from "./wallet";
import { resolveContractAddress } from "./contracts";
import { setAssetsBalance, setOnyxCashBalance } from "./balance";
import { saveUser, getUserData } from "./user";
import { getUserUpgradeRequest } from "./upgradeRequest";
import { getUsersData, getUserSettlementData, updateUserStatus } from "./admin-panel/users";
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

export default {
	wallet: { clearWallet, setWallet },
	contracts: { resolveContractAddress },
	balance: { setAssetsBalance, setOnyxCashBalance },
	user: { saveUser, getUserData, updateUserStatus },
	upgradeRequest: { getUserUpgradeRequest },
	adminUsers: { getUsersData },
	userSettlementAccountData: { getUserSettlementData },
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
};
