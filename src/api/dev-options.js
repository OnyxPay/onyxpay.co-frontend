import { ParameterType } from "ontology-ts-sdk";

import { unlockCurrentWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { ContractAddressError } from "../utils/custom-error";
import { createTrx, sendTrx, addSignAndSendTrx } from "./bc";

import { get } from "lodash";

export async function changeMode(newMode) {
	const { pk, accountAddress } = await unlockCurrentWalletAccount();
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}

	const trx = createTrx({
		funcName: "ChangeMode",
		params: [
			{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
			{ label: "keyNo", type: ParameterType.Integer, value: 1 },
			{
				label: "mode",
				type: ParameterType.Int,
				value: newMode,
			},
		],
		contractAddress: address,
		accountAddress,
	});

	return addSignAndSendTrx(trx.serialize(), pk);
}

export async function getMode() {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of RequestHolder smart-contract");
	}

	const trx = createTrx({
		funcName: "GetMode",
		params: [],
		contractAddress: address,
	});

	const res = await sendTrx(trx, true);

	let mode = get(res, "Result.Result", 0);
	if (mode === "") {
		mode = 0;
	} else {
		mode = parseInt(mode, 16);
	}
	return mode;
}
