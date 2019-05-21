import {
	gasLimit,
	gasPrice,
	cryptoAdress,
	cryptoPrivateKey,
	reverseAddressHex,
} from "./../utils/blockchain";
import { isEmpty } from "lodash";
import { TransactionBuilder, Parameter, ParameterType, utils } from "ontology-ts-sdk";
import { getClient } from "./../api/network";
//import {writeLog} from "./logs";
//import {saveAgentToList} from "./agent";
//import {changeAgentStatus} from "./accounts";
//import {show} from "react-notification-system-redux";

export const setAmount = (secret_hash, amount, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const rest = getClient();
		let { activeAccount, contracts, accounts } = getState();
		/*let {account} = accounts.find((val, index) => {
			return val.account.label;
		});*/
		//const activeAccAdress = cryptoAdress(activeAccount.account.address.value);
		const activeAccPrivateKey = cryptoPrivateKey(activeAccount.privateKey.key);
		const funcName = "SetAmount";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);
		const p2 = new Parameter("Amount", ParameterType.Integer, amount);
		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1, p2],
			contractAdress
			//gasPrice,
			//gasLimit,
			//activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		await rest.sendRawTransaction(tx.serialize()).then(res => {
			console.log(res);
			/*if (res.Error === 0) {
 					dispatch(
 						writeLog(
							"Set amount",
							account.address.value,
							JSON.stringify(res.Result)
 						)
 					);
 					setTimeout(() => {
						rest.getSmartCodeEvent(res.Result).then(res => {
							setSubmitting(false);
							resetForm();
 							dispatch(
 								writeLog(
 									"Set amount details",
 									account.address.value,
									JSON.stringify(res)
 								)
							);
							dispatch(
 								saveAgentToList({
									//label: user_id,
 									address: account.address.value
 								})
 							);
							dispatch(changeAgentStatus(account.address.value, true));
							dispatch(
 								show(
 									{
										title: "Done",
										message: "Check results on 'Logs' page",
										position: "bc",
										autoDismiss: 5
									},
									"info"
 								)
							);
						});
 					}, 6000);
 				} else {
					setSubmitting(false);
 					dispatch(
 						show(
 							{
 								title: "Error",
 								message: "Check results on 'Logs' page",
 								position: "bc",
 								autoDismiss: 5
							},
 							"error"
 						)
 					);
 					dispatch(
 						writeLog(
 							"Set amount",
 							account.address.value,
							JSON.stringify(res)
						)
 					);
 				}
 			})*/
			/*.catch(er => {
				console.log(er);
			});*/
		});
	};
};

export const Block = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const rest = getState();
		let { activeAccount, contracts, accounts } = getState();
		let { account } = accounts.find((val, index) => {
			return val.account.label;
		});
		//const activeAccAdress = cryptoAdress(activeAccount.account.address.value);
		//const activeAccPrivateKey = cryptoPrivateKey(activeAccount.privateKey.key);
		const funcName = "BlockInvestor";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress
			//gasPrice,
			//gasLimit,
			//activeAccAdress
		);
		TransactionBuilder.signTransaction(
			tx, //activeAccPrivateKey);
			await rest.sendRawTransaction(tx.serialize()).then(res => {
				console.log(res);
				/*if (res.Error === 0) {
						dispatch(
							writeLog(
								"Block Investor",
								//account.address.value,
								JSON.stringify(res.Result)
							)
						);
						setTimeout(() => {
							rest.getSmartCodeEvent(res.Result).then(res => {
								setSubmitting(false);
								resetForm();
								dispatch(
									writeLog(
										"Block Investor details",
										account.address.value,
										JSON.stringify(res)
									)
								);
								dispatch(
									saveAgentToList({
										//label: user_id,
										address: account.address.value
									})
								);
								dispatch(changeAgentStatus(account.address.value, true));
								dispatch(
									show(
										{
											title: "Done",
											message: "Check results on 'Logs' page",
											position: "bc",
											autoDismiss: 5
										},
										"info"
									)
								);
							});
						}, 6000);
					} else {
						setSubmitting(false);
						dispatch(
							show(
								{
									title: "Error",
									message: "Check results on 'Logs' page",
									position: "bc",
									autoDismiss: 5
								},
								"error"
							)
						);
						dispatch(
							writeLog(
								"Block Investor",
								account.address.value,
								JSON.stringify(res)
							)
						);
					}
				})
				.catch(er => {
					console.log(er);
				});*/
			})
		);
	};
};

export const Unblock = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		const rest = getClient;
		let { activeAccount, contracts, accounts } = getState();
		let { account } = accounts.find((val, index) => {
			return val.account.label;
		});
		//const activeAccAdress = cryptoAdress(activeAccount.account.address.value);
		//const activeAccPrivateKey = cryptoPrivateKey(activeAccount.privateKey.key);
		const funcName = "UnblockInvestor";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress
			//gasPrice,
			//gasLimit,
			//activeAccAdress
		);
		TransactionBuilder.signTransaction(
			tx, //activeAccPrivateKey);
			await rest.sendRawTransaction(tx.serialize()).then(res => {
				console.log(res);
				/*		if (res.Error === 0) {
					dispatch(
						writeLog(
							"Unblock investor",
							account.address.value,
							JSON.stringify(res.Result)
						)
					);
					setTimeout(() => {
						rest.getSmartCodeEvent(res.Result).then(res => {
							setSubmitting(false);
							resetForm();
							dispatch(
								writeLog(
									"Unblock investor details",
									account.address.value,
									JSON.stringify(res)
								)
							);
							dispatch(
								saveAgentToList({
									//label: user_id,
									address: account.address.value
								})
							);
							dispatch(changeAgentStatus(account.address.value, true));
							dispatch(
								show(
									{
										title: "Done",
										message: "Check results on 'Logs' page",
										position: "bc",
										autoDismiss: 5
									},
									"info"
								)
							);
						});
					}, 6000);
				} else {
					setSubmitting(false);
					dispatch(
						show(
							{
								title: "Error",
								message: "Check results on 'Logs' page",
								position: "bc",
								autoDismiss: 5
							},
							"error"
						)
					);
					dispatch(
						writeLog(
							"Unblock investor",
							account.address.value,
							JSON.stringify(res)
						)
					);
				}
			})
			.catch(er => {
				console.log(er);
			});
	};*/
			})
		);
	};
};

export const getUnclaimed = (secret_hash, { setSubmitting, resetForm }) => {
	return async (dispatch, getState) => {
		let { activeAccount, contracts } = getState();
		const rest = getClient;
		//	const activeAccAdress = cryptoAdress(activeAccount.account.address.value);
		const activeAccPrivateKey = cryptoPrivateKey(activeAccount.privateKey.key);
		const funcName = "GetUnclaimed";
		const contractAdress =
			!isEmpty(contracts) &&
			contracts["Investments"] &&
			reverseAddressHex(contracts["Investments"]);

		const p1 = new Parameter("secret hash", ParameterType.ByteArray, secret_hash);

		//make transaction
		const tx = TransactionBuilder.makeInvokeTransaction(
			funcName,
			[p1],
			contractAdress
			//gasPrice,
			//gasLimit,
			//activeAccAdress
		);
		TransactionBuilder.signTransaction(tx, activeAccPrivateKey);
		try {
			let res = await rest.sendRawTransaction(tx.serialize(), true);
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
			return null;
		}
	};
};
