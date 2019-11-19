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
	let items = [];
	let params = { pageSize: 1000, pageNum: 1, status: "active" };
	while (fetchedAmount < assetsTotalAmount) {
		let assets = await getAssetsData(params);
		items = items.concat(assets.items);
		assetsTotalAmount = assets.total;
		fetchedAmount += assets.items.length;
		params.pageNum++;
	}
	items = items.map(asset => asset.name);
	let {
		assets: { allowedAssets: cached },
	} = store.getState();
	if (!cached) dispatch(Actions.assets.setAllowedAssets(items));
	return items;
}

export async function getAllowedAssets() {
	let {
		assets: { allowedAssets: cached },
	} = store.getState();
	if (cached) return cached;
	return await fetchAllowedAssets();
}

async function filterHiddenAssets(assetsBalance) {
	let allowedAssets = await getAllowedAssets();
	const assetsSet = new Set(allowedAssets);
	return assetsBalance.filter(asset => assetsSet.has(asset.symbol));
}
