import {
	getTokenBalance,
	getAssetsBalance,
	getRewardsBalance,
	getTokenDepositBalance,
} from "../api/balance";
import { getWallet, getAccount } from "../api/wallet";
import { cryptoAddress } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { getStore } from "../store";
import Actions from "../redux/actions";
import { roles, refreshBalanceEveryMsec } from "api/constants";

const store = getStore();
const dispatch = store.dispatch;

export async function refreshBalance() {
	const { wallet, user } = store.getState();
	if (!wallet || !user) {
		return;
	}
	const walletDecoded = getWallet(wallet);
	const account = getAccount(walletDecoded);

	try {
		if (user.role === roles.c) {
			const assetsContractAddress = await dispatch(
				Actions.contracts.resolveContractAddress("Assets")
			);
			const assetsBalance = await getAssetsBalance(
				cryptoAddress(assetsContractAddress),
				utils.reverseHex(account.address.toHexString())
			);
			dispatch(Actions.balance.setAssetsBalance(assetsBalance));
		} else {
			const assetsContractAddressPromise = dispatch(
				Actions.contracts.resolveContractAddress("Assets")
			);

			const onyxCashContractAddressPromise = dispatch(
				Actions.contracts.resolveContractAddress("OnyxCash")
			);

			const [assetsContractAddress, onyxCashContractAddress] = await Promise.all([
				assetsContractAddressPromise,
				onyxCashContractAddressPromise,
			]);

			const assetsBalance = await getAssetsBalance(
				cryptoAddress(assetsContractAddress),
				utils.reverseHex(account.address.toHexString())
			);
			const onyxCashBalance = await getTokenBalance(
				cryptoAddress(onyxCashContractAddress),
				account.address
			);
			const onyxCashDepositBalance = await getTokenDepositBalance(
				cryptoAddress(onyxCashContractAddress),
				utils.reverseHex(account.address.toHexString())
			);
			const rewardsBalance = await getRewardsBalance();

			dispatch(Actions.balance.setAssetsBalance(assetsBalance));
			dispatch(Actions.balance.setOnyxCashBalance(onyxCashBalance));
			dispatch(Actions.balance.setOnyxCashDepositBalance(onyxCashDepositBalance));
			dispatch(Actions.rewards.setConsolidatedRewardsBalance(rewardsBalance));
		}
	} catch (e) {
		console.error(e);
	}
}

let currentUserState = null;
let intervalId;
export function initBalanceProvider() {
	const storeUnsubscribe = store.subscribe(() => {
		const { user, wallet } = store.getState();
		let previousUserState = currentUserState;
		currentUserState = user;

		if (intervalId) {
			storeUnsubscribe();
		}

		if (
			wallet &&
			!intervalId &&
			currentUserState &&
			previousUserState !== currentUserState &&
			(currentUserState.role === roles.c ||
				currentUserState.role === roles.a ||
				currentUserState.role === roles.sa)
		) {
			refreshBalance();
			intervalId = window.setInterval(() => {
				refreshBalance();
			}, refreshBalanceEveryMsec);
		}
	});
}
