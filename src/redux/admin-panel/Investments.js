import { gasPrice, reverseAddressHex } from "../../utils/blockchain";
import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { message } from "antd";

function getContractAddress(contracts, name) {
	try {
		return reverseAddressHex(contracts[name]);
	} catch (error) {
		throw new Error("contract address is not found");
	}
}

export const setAmount = (secret_hash, amount, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts } = getState();
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "SetAmount";
			const contractAddress = getContractAddress(contracts, "Investments");

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
			const p2 = new Parameter("Amount", ParameterType.Integer, amount);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1, p2],
				contractAddress,
				gasPrice,
				CONST.DEFAULT_GAS_LIMIT,
				accountAddress
			);
			TransactionBuilder.signTransaction(tx, pk);

			try {
				const res = await client.sendRawTransaction(tx.serialize(), false, true);
				console.log(res);
				if (res.Error === 0) {
					message.success("Amount was successfully set");
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

export const getUnclaimed = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts } = getState();
		const client = getBcClient();

		try {
			const funcName = "GetUnclaimed";
			const contractAddress = getContractAddress(contracts, "Investments");

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				contractAddress,
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
					message.success(`Investor had unclaimed ${balance}`);
					setSubmitting(false);
					resetForm();
				} else {
					message.success("Investor was  blocked");
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
				message.error("Investor is not found");
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
		let { contracts } = getState();
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "Block";
			const contractAddress = getContractAddress(contracts, "Investments");

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				contractAddress,
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

export const Unblock = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts } = getState();
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "Unblock";
			const contractAddress = getContractAddress(contracts, "Investments");

			const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

			//make transaction
			const tx = TransactionBuilder.makeInvokeTransaction(
				funcName,
				[p1],
				contractAddress,
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
