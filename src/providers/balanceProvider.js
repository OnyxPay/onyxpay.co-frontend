import { getTokenBalance, queryAssetsBalance } from "../api/balance";
import { getWallet } from "../api/wallet";
import { getAccount } from "../api/account";
import { isEmpty } from "lodash";
import { cryptoAddress } from "../utils/blockchain";
import { utils } from "ontology-ts-sdk";
import { OnyxCashAddress } from "../api/constants"; // move to settings
import { getStore } from "../store";
import Actions from "../redux/actions";

export async function refreshBalance() {
	const store = getStore();
	const { contracts, wallet } = store.getState();

	if (wallet && !isEmpty(contracts)) {
		const walletDecoded = getWallet(wallet);
		const accountDefault = getAccount(walletDecoded, true);
		const accountReward = getAccount(walletDecoded);
		const assetsContractAddress =
			contracts["Assets"] && cryptoAddress(utils.reverseHex(contracts["Assets"]));

		try {
			const assetsBalance = await queryAssetsBalance(
				assetsContractAddress,
				accountDefault.address.toHexString()
			);

			const onyxCashBalanse = await getTokenBalance(OnyxCashAddress, accountDefault.address);
			store.dispatch(Actions.balance.setAssetsBalance(assetsBalance, true));
			store.dispatch(Actions.balance.setOnyxCashBalance(onyxCashBalanse, true));
		} catch (e) {}

		try {
			const assetsBalance = await queryAssetsBalance(
				assetsContractAddress,
				accountReward.address.toHexString()
			);
			const onyxCashBalanse = await getTokenBalance(OnyxCashAddress, accountReward.address);

			store.dispatch(Actions.balance.setAssetsBalance(assetsBalance));
			store.dispatch(Actions.balance.setOnyxCashBalance(onyxCashBalanse));
		} catch (e) {}
	}
}

export function initBalanceProvider() {
	refreshBalance();
	window.setInterval(async () => {
		refreshBalance();
	}, 30000);
}
