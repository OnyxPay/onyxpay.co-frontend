import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, CONST } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { resolveContractAddress } from "../contracts";

export const addNewAssets = (assetSymbol, assetName, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "addAsset";
			const address = await dispatch(resolveContractAddress("Assets"));
			if (!address) {
				throw new Error("contract address is not found");
			}
			const p1 = new Parameter("asset symbol", ParameterType.String, assetSymbol);
			const p2 = new Parameter("asset name", ParameterType.String, assetName);

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
					message.success("Asset was successfully added");
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

export const blockAsset = (assetSymbol, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const client = getBcClient();

		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			const funcName = "BlockAsset";
			const address = await dispatch(resolveContractAddress("Exchange"));
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("asset symbol", ParameterType.String, assetSymbol);

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
					message.success("Assets was successfully blocked");
					setSubmitting(false);
					resetForm();
					return true;
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
			return false;
		}
	};
};

export const isBlockedAssets = assetSymbol => {
	return async dispatch => {
		const client = getBcClient();

		try {
			const funcName = "IsAssetBlocked";
			const address = await dispatch(resolveContractAddress("Exchange"));
			if (!address) {
				throw new Error("contract address is not found");
			}

			const p1 = new Parameter("asset symbol", ParameterType.String, assetSymbol);

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
				console.log(res, data);
				if (res.Error === 0) {
					message.success("Asset is successfully blocked");
				}
				return data;
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
