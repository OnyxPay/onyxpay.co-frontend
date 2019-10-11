import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { getBcClient } from "../../api/network";
import { unlockCurrentWalletAccount } from "../../api/wallet";
import { resolveContractAddress } from "../contracts";
import { showNotification } from "components/notification";

export const setAmount = (secret_hash, amount, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockCurrentWalletAccount();
			const funcName = "SetAmount";
			const address = await dispatch(resolveContractAddress("Investments"));
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
			const p2 = new Parameter("Amount", ParameterType.Integer, amount);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1, p2],
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
					showNotification({
						type: "success",
						msg: "Amount was successfully set",
					});
					setSubmitting(false);
					resetForm();
				}
			} catch (error) {
				showNotification({
					type: "error",
					msg: "Operation is failed",
				});
				setSubmitting(false);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				showNotification({
					type: "error",
					msg: error.message,
				});
			}
			setSubmitting(false);
			console.log(error);
		}
	};
};

export const getUnclaimed = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const funcName = "GetUnclaimed";
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
				CONST.DEFAULT_GAS_LIMIT
			);

			try {
				const res = await client.sendRawTransaction(tx.serialize(), true);
				const data = res.Result.Result;
				const balance = parseInt(utils.reverseHex(data), 16);
				console.log("response:", res);
				console.log(balance);
				setSubmitting(false);
				resetForm();
				if (balance !== 0) {
					showNotification({
						type: "success",
						msg: `Investor had unclaimed ${balance}`,
					});
					setSubmitting(false);
					resetForm();
				} else {
					showNotification({
						type: "success",
						msg: "Investor was  blocked",
					});
					setSubmitting(false);
					resetForm();
				}
				/*
					if response = 0, user is blocked
					if error, user is not found
				*/
				return balance;
			} catch (error) {
				console.log(error);
				showNotification({
					type: "error",
					msg: "Investor is not found",
				});
				setSubmitting(false);
			}
		} catch (e) {
			console.log(e);
			setSubmitting(false);
			return null;
		}
	};
};

export const Block = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockCurrentWalletAccount();
			const funcName = "Block";
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
					showNotification({
						type: "success",
						msg: "Investor was successfully blocked",
					});
					setSubmitting(false);
					resetForm();
				}
			} catch (error) {
				console.log(error);
				showNotification({
					type: "error",
					msg: "Operation is failed",
				});
				setSubmitting(false);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				showNotification({
					type: "error",
					msg: error.message,
				});
			}
			setSubmitting(false);
			console.log(error);
		}
	};
};

export const Unblock = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockCurrentWalletAccount();
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
					showNotification({
						type: "success",
						msg: "Investor was successfully unblocked",
					});
					setSubmitting(false);
					resetForm();
				}
			} catch (error) {
				console.log(error);
				showNotification({
					type: "error",
					msg: "Operation is failed",
				});
				setSubmitting(false);
			}
		} catch (error) {
			if (error.message === "contract address is not found") {
				showNotification({
					type: "error",
					msg: error.message,
				});
			}
			setSubmitting(false);
			console.log(error);
		}
	};
};
