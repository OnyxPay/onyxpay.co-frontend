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

export async function sendAsset(values) {
	const { pk, accountAddress } = await unlockWalletAccount();

	const receiverAddress = new Crypto.Address(values.receiver_address);

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
		{ label: "tokenId", type: ParameterType.String, value: values.asset_symbol },
		{ label: "amount", type: ParameterType.Integer, value: convertAmountFromStr(values.amount) },
	];

	const trx = await createAndSignTrxViaGasCompensator("InternalRevenueService", "Send", params);
	const signed_trx = signTrx(trx, pk, true);

	return await timeout(sendTrx(signed_trx, false, true), notifyTimeout);
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
