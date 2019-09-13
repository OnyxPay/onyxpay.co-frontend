import { ParameterType, utils, Crypto } from "ontology-ts-sdk";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { convertAmountFromStr } from "../utils/number";
import { ContractAddressError /* SendRawTrxError */ } from "../utils/custom-error";
import {
	createTrx,
	signTrx,
	sendTrx,
	createAndSignTrxViaGasCompensator,
	addSignAndSendTrx,
} from "./bc";
import { timeout /* TimeoutError */ } from "promise-timeout";
import { notifyTimeout } from "./constants";
import { get } from "lodash";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";

export async function sendAsset(values, push) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const receiverAddress = new Crypto.Address(values.receiverAddress);
	const convertedAmount = convertAmountFromStr(values.amount);

	const params = [
		{
			label: "fromAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
		{
			label: "receiverAddress",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(receiverAddress.toHexString()),
		},
		{ label: "tokenId", type: ParameterType.String, value: values.assetSymbol },
		{ label: "amount", type: ParameterType.Integer, value: convertedAmount },
	];

	const trx = await createAndSignTrxViaGasCompensator("InternalRevenueService", "Send", params);
	const signedTrx = signTrx(trx, pk, true);
	const trxHash = utils.reverseHex(signedTrx.getHash());

	await registerSend({
		asset: values.assetSymbol,
		amount: convertedAmount,
		receiverAddress: values.receiverAddress,
		trxHash,
	});

	push("/");
	return await timeout(sendTrx(signedTrx, false, true), notifyTimeout);
}

export async function isAssetBlocked(tokenId) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("Exchange"));
	if (!address) {
		throw new ContractAddressError("Unable to get address of Exchange smart-contract");
	}

	const trx = createTrx({
		funcName: "IsAssetBlocked",
		params: [
			{
				label: "tokenId",
				type: ParameterType.String,
				value: tokenId,
			},
		],
		contractAddress: address,
	});

	const response = await sendTrx(trx, true, false);
	return !!parseInt(get(response, "Result.Result", "0"), 16);
}

export async function getFee(tokenId, amount, operationName) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("InternalRevenueService"));
	if (!address) {
		throw new ContractAddressError(
			"Unable to get address of InternalRevenueService smart-contract"
		);
	}

	const params = [
		{
			label: "tokenId",
			type: ParameterType.String,
			value: tokenId,
		},
		{
			label: "amount",
			type: ParameterType.Integer,
			value: convertAmountFromStr(amount),
		},
		{
			label: "operationName",
			type: ParameterType.String,
			value: operationName, // withdraw, deposit, send
		},
	];

	const trx = createTrx({
		funcName: "GetFee",
		params,
		contractAddress: address,
	});

	const res = await sendTrx(trx, true, false);

	return parseInt(utils.reverseHex(res.Result.Result), 16);
}

export async function setAssetExchangeRates(tokenId, sell_rate, buy_rate) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const params = [
		{ label: "caller", type: ParameterType.String, value: "did:onx:" + accountAddress.value },
		{ label: "keyNo", type: ParameterType.Integer, value: 1 },
		{
			label: "tokenId",
			type: ParameterType.String,
			value: tokenId,
		},
		{
			label: "sellRate",
			type: ParameterType.Integer,
			value: convertAmountFromStr(sell_rate),
		},
		{ label: "buyRate", type: ParameterType.Integer, value: convertAmountFromStr(buy_rate) },
	];

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"Exchange",
		"SetExchangeRate",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function setFiatAmount(tokenId, amount) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const params = [
		{
			label: "agent",
			type: ParameterType.ByteArray,
			value: utils.reverseHex(accountAddress.toHexString()),
		},
		{
			label: "tokenId",
			type: ParameterType.String,
			value: tokenId,
		},
		{ label: "buyRate", type: ParameterType.Integer, value: convertAmountFromStr(amount) },
	];

	console.log(params);

	const serializedTrx = await createAndSignTrxViaGasCompensator(
		"Exchange",
		"SetFiatAmount",
		params
	);

	return addSignAndSendTrx(serializedTrx, pk);
}

export async function getAssetsData(params) {
	const client = getRestClient();

	try {
		const authHeaders = getAuthHeaders();
		const { data } = await client.get("assets", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		return data;
	} catch (error) {
		return handleReqError(error);
	}
}

export async function registerSend(values) {
	const client = getRestClient();
	const authHeaders = getAuthHeaders();
	const res = await client.post("send-operation", values, {
		headers: {
			...authHeaders,
		},
	});
	return res.data;
}

export function sortAssetExchange(assets) {
	const arr1 = assets.filter(asset => asset.balance);
	const arr2 = assets
		.filter(asset => !asset.balance)
		.sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			return nameA > nameB ? 1 : -1;
		});
	return [...arr1, ...arr2];
}

export function filterAssets(assets, exchangeRates, requestType) {
	const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
	return assets.filter(asset => {
		const rate = exchangeRates.find(rate => rate.symbol === asset.symbol);
		let fee;
		if (requestType === "withdraw") {
			fee = 3 / 100;
		} else if (requestType === "send") {
			fee = 1 / 100;
		}
		if (rate) {
			let sum = rate.sell * (asset.amount / 10 ** 8);
			return rateUSD.sell <= sum - sum * fee;
		} else {
			return false;
		}
	});
}
