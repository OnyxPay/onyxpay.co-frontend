import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { resolveContractAddress } from "../contracts";
import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";
const client = getRestClient();

export const BlockedUser = (accountAddress, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk } = await unlockWalletAccount();
			const funcName = "BlockUsers";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, accountAddress);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				cryptoAddress(address),
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT,
				accountAddress
			);
			TransactionBuilder.signTransaction(tx, pk);
			try {
				const res = await client.sendRawTransaction(tx.serialize(), false, true);
				console.log(res);
				if (res.Error === 0) {
					message.success("Investor was successfully blocked");
					setSubmitting(false);
					resetForm();
				}
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
				setSubmitting(false);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
			setSubmitting(false);
			console.log(error);
		}
	};
};

export const ActiveUsers = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "Unblock";
			const address = await dispatch(resolveContractAddress("Investments"));
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				cryptoAddress(address),
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT,
				accountAddress
			);
			TransactionBuilder.signTransaction(tx, pk);
			try {
				const res = await client.sendRawTransaction(tx.serialize(), false, true);
				console.log(res);
				if (res.Error === 0) {
					message.success("Investor was successfully unblocked");
					setSubmitting(false);
					resetForm();
				}
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
				setSubmitting(false);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
			setSubmitting(false);
			console.log(error);
		}
	};
};

export const searchUser = accountAddress => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`/admin/users?addr=${accountAddress}`, {
			headers: {
				...authHeaders,
			},
		});
		console.log(data.items);
		return { userData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
