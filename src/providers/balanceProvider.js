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
import { getAssetsData } from "api/assets";

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

			const filteredAssetsBalance = await filterHiddenAssets(assetsBalance);

			dispatch(Actions.balance.setAssetsBalance(filteredAssetsBalance));
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

			const filteredAssetsBalance = await filterHiddenAssets(assetsBalance);

			const onyxCashBalance = await getTokenBalance(
				cryptoAddress(onyxCashContractAddress),
				account.address
			);
			const onyxCashDepositBalance = await getTokenDepositBalance(
				cryptoAddress(onyxCashContractAddress),
				utils.reverseHex(account.address.toHexString())
			);
			const rewardsBalance = await getRewardsBalance();

			dispatch(Actions.balance.setAssetsBalance(filteredAssetsBalance));
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

export async function fetchAllowedAssets() {
	let assetsTotalAmount = 1;
	let fetchedAmount = 0;
	let allowedAssets = [];
	const params = { pageSize: 1000, pageNum: 1, status: "active" };
	const {
		assets: { loadingAllowedAssets },
	} = store.getState();
	if (loadingAllowedAssets) {
		const storeUnsubscribe = store.subscribe(() => {
			const {
				assets: { allowedAssets },
			} = store.getState();
			if (allowedAssets.length) storeUnsubscribe();
		});
		const {
			assets: { allowedAssets },
		} = store.getState();
		return allowedAssets;
	} else {
		dispatch(Actions.assets.startFetchingAllowedAssets());
		while (fetchedAmount < assetsTotalAmount) {
			const assets = await getAssetsData(params);
			if (assets && !assets.error) {
				allowedAssets = allowedAssets.concat(assets.items);
				assetsTotalAmount = assets.total;
				fetchedAmount += assets.items.length;
				params.pageNum++;
			} else {
				dispatch(Actions.assets.failFetchingAllowedAssets());
				break;
			}
		}
		allowedAssets = allowedAssets.map(asset => asset.name);
		const {
			assets: { allowedAssets: cached },
		} = store.getState();
		if (!cached.length) dispatch(Actions.assets.setAllowedAssets(allowedAssets));
		return allowedAssets;
	}
}

async function getAllowedAssets() {
	const {
		assets: { allowedAssets: cached },
	} = store.getState();
	if (cached.length) return cached;
	return await fetchAllowedAssets();
}

async function filterHiddenAssets(assetsBalance) {
	const assetsSet = new Set(await getAllowedAssets());
	return assetsBalance.filter(asset => assetsSet.has(asset.symbol));
}
