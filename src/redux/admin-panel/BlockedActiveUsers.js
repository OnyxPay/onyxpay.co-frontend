import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { resolveContractAddress } from "../contracts";

//api
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";

const client = getRestClient();

export const BlockUser = (accountAddress, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk } = await unlockWalletAccount();
			const funcName = "BlockUser";
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

export const UnblockUser = accountAddress => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk } = await unlockWalletAccount();
			const funcName = "UnblockUser";
			const address = await dispatch(resolveContractAddress("Investments"));
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
					message.success("Investor was successfully unblocked");
				}
			} catch (error) {
				console.log(error);
				message.error("Operation is failed", 5);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				message.error(error.message);
			}
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
		return { userData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const BlockedUsersData = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get(`/admin/users`, {
			headers: {
				...authHeaders,
			},
		});
		return { blockedUsersData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};
