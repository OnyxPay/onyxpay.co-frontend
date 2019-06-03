import { getTokenBalance, getAssetsBalance, getExchangeRates } from "../api/balance";
import { getWallet, getAccount } from "../api/wallet";
import { isEmpty } from "lodash";
import { cryptoAddress } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { getStore } from "../store";
import Actions from "../redux/actions";
const store = getStore();

// TODO: rewrite to Promise.All
export async function refreshBalance() {
	const { contracts, wallet } = store.getState();

	if (wallet && !isEmpty(contracts)) {
		const walletDecoded = getWallet(wallet);
		const account = getAccount(walletDecoded);

		const AssetsAddress = contracts["Assets"] && cryptoAddress(contracts["Assets"]);
		const OnyxCashAddress = contracts["OnyxCash"] && cryptoAddress(contracts["OnyxCash"]);

		try {
			const assetsBalance = await getAssetsBalance(
				AssetsAddress,
				utils.reverseHex(account.address.toHexString())
			);

			const onyxCashBalance = await getTokenBalance(OnyxCashAddress, account.address);
			store.dispatch(Actions.balance.setAssetsBalance(assetsBalance));
			store.dispatch(Actions.balance.setOnyxCashBalance(onyxCashBalance));
		} catch (e) {}
	}
}

export function initBalanceProvider() {
	window.setTimeout(() => {
		getExchangeRates(store);
		refreshBalance();
		window.setInterval(async () => {
			refreshBalance();
		}, 30000);
	}, 1000);
}
