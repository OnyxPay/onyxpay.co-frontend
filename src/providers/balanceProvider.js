import { getTokenBalance, getAssetsBalance } from "../api/balance";
import { getWallet, getAccount } from "../api/wallet";
import { cryptoAddress } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { getStore } from "../store";
import Actions from "../redux/actions";
const store = getStore();

export async function refreshBalance() {
	const { wallet } = store.getState();

	if (wallet) {
		const walletDecoded = getWallet(wallet);
		const account = getAccount(walletDecoded);

		// TODO: make parallel requests
		// handle if none contracts
		const AssetsAddress = await store.dispatch(Actions.contracts.resolveContractAddress("Assets"));
		const OnyxCashAddress = await store.dispatch(
			Actions.contracts.resolveContractAddress("OnyxCash")
		);

		try {
			const assetsBalance = await getAssetsBalance(
				cryptoAddress(AssetsAddress),
				utils.reverseHex(account.address.toHexString())
			);

			const onyxCashBalance = await getTokenBalance(
				cryptoAddress(OnyxCashAddress),
				account.address
			);
			store.dispatch(Actions.balance.setAssetsBalance(assetsBalance));
			store.dispatch(Actions.balance.setOnyxCashBalance(onyxCashBalance));
		} catch (e) {}
	}
}

export function initBalanceProvider() {
	refreshBalance();
	window.setInterval(async () => {
		refreshBalance();
	}, 30000);
}
