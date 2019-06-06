// import { get } from "lodash";
import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { getRestClient, handleReqError, getAuthHeaders } from "./network";
import { unlockWalletAccount } from "./wallet";
import { getStore } from "../store";
import { resolveContractAddress } from "../redux/contracts";
import { gasPrice, cryptoAddress } from "../utils/blockchain";

export async function createDepositRequest(formValues) {
	const store = getStore();
	const address = await store.dispatch(resolveContractAddress("RequestHolder"));
	if (!address) {
		throw new Error("Unable to get address of RequestHolder smart-contract");
	}

	const { pk, accountAddress } = await unlockWalletAccount();

	const client = getRestClient();
	const funcName = "Request";

	const p1 = new Parameter("operationRequested", ParameterType.String, "deposit");
	const p2 = new Parameter("initiator", ParameterType.ByteArray, accountAddress.toBase58());
	const p3 = new Parameter("assetId", ParameterType.String, formValues.asset_symbol);
	const p4 = new Parameter("amount", ParameterType.Int, formValues.asset_symbol);

	const tx = TransactionBuilder.makeInvokeTransaction(
		funcName,
		[p1, p2, p3, p4],
		cryptoAddress(address),
		gasPrice,
		CONST.DEFAULT_GAS_LIMIT,
		accountAddress
	);
	TransactionBuilder.signTransaction(tx, pk);

	const trx_hash = tx.getHash();
	const trx_timestamp = new Date().toISOString();
	formValues.trx_hash = trx_hash;
	formValues.trx_timestamp = trx_timestamp;

	try {
		const authHeaders = getAuthHeaders();
		const res = await client.post("requests/deposit", formValues, {
			headers: {
				...authHeaders,
			},
		});
		console.log(res);
		return res.data;
	} catch (error) {
		return handleReqError(error);
	}
}
