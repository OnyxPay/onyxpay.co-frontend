import {
	cryptoAddress,
	cryptoPrivateKey,
	gasPrice,
	reverseAddressHex,
} from "../../utils/blockchain";
import { gasLimit } from "./../../api/constants";
import { isEmpty } from "lodash";
import { TransactionBuilder, Parameter, ParameterType, utils } from "ontology-ts-sdk";
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
				gasLimit,
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
		const funcName = "GetUnclaimed";
		const contractAddress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAddress,
			gasPrice,
			gasLimit
		);
		try {
			let res = await client.sendRawTransaction(tx.serialize(), true);
			const data = res.Result.Result;
			const balance = parseInt(utils.reverseHex(data), 16);
			console.log("response:", res);
			console.log(balance);
			setSubmitting(false);
			resetForm();
			/*
				if response = 0, user is blocked
				if error, user is not found
			*/
			return balance;
		} catch (e) {
			console.log(e);
			setSubmitting(false);
			return null;
		}
	};
};

export const Block = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet*/ } = getState();
		const client = getBcClient();
		const { pk, accountAddress /* publicKey*/ } = await unlockWalletAccount();
		const activeAccAddress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "Block";
		const contractAddress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		if ({ pk, accountAddress } === null) {
			setSubmitting(false);
		}

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAddress,
			gasPrice,
			gasLimit,
			activeAccAddress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await client
			.sendRawTransaction(tx.serialize(), false, true)
			.then(res => {
				console.log(res);
				if (res.Error === 0) {
					message.success("Block Investor");
					setSubmitting(false);
					resetForm();
				}
			})
			.catch(er => {
				console.log(er);
				setSubmitting(false);
				message.error("Operation is failed", 5);
			});
	};
};

export const Unblock = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { contracts /*wallet*/ } = getState();
		const client = getBcClient();
		const { pk, accountAddress /*publicKey*/ } = await unlockWalletAccount();
		const activeAccAddress = cryptoAddress(accountAddress);
		const activeAccPrivateKey = cryptoPrivateKey(pk.key);
		const funcName = "Unblock";
		const contractAddress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		if ({ pk, accountAddress } === null) {
			setSubmitting(false);
		}

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAddress,
			gasPrice,
			gasLimit,
			activeAccAddress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await client
			.sendRawTransaction(tx.serialize(), false, true)
			.then(res => {
				console.log(res);
				if (res.Error === 0) {
					message.success("Unblock Investor");
					setSubmitting(false);
					resetForm();
				}
			})
			.catch(er => {
				console.log(er);
				message.error("Operation is failed", 5);
				setSubmitting(false);
			});
	};
};
