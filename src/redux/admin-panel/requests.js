import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";
import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, utils, CONST } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { resolveContractAddress } from "../contracts";

const client = getRestClient();

const requestsData = sessionStorage.getItem("requestsData");
const initialState = (requestsData && JSON.parse(requestsData)) || null;
const REQUESTS_DATA = "REQUESTS_DATA";
const REQUESTS_STATUS = "REQUESTS_STATUS";

export const adminRequestsReducer = (state = initialState, action) => {
	switch (action.type) {
		case REQUESTS_DATA:
			sessionStorage.setItem("requestsData", JSON.stringify(action.payload));
			return action.payload;
		case REQUESTS_STATUS:
			return state.map(request => {
				if (request.id === action.request_id) {
					return { ...request, status: "refused" };
				} else {
					return request;
				}
			});
		default:
			return state;
	}
};

export const saveRequests = requestsData => {
	return { type: REQUESTS_DATA, payload: requestsData };
};

export const getRequests = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/upgrade-requests?pageSize=100", {
			headers: {
				...authHeaders,
			},
		});
		dispatch(saveRequests(data.items));
		return { requestsData: data.items };
	} catch (er) {
		return handleReqError(er);
	}
};

export const setRequestReject = (request_id, reason) => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		const status = await client.put(
			`/admin/upgrade-request/${request_id}/reject`,
			{ reason: reason },
			{
				headers: {
					...authHeaders,
				},
			}
		);
		if (status.data === "OK") {
			dispatch({ type: REQUESTS_STATUS, request_id });
		}
	} catch (er) {
		return handleReqError(er);
	}
};

export const sentRequest = () => async (dispatch, getState) => {
	const authHeaders = getAuthHeaders();
	try {
		await client.post(
			`/upgrade-request`,
			{ role: "agent" },
			{
				headers: {
					...authHeaders,
				},
			}
		);
	} catch (er) {
		return handleReqError(er);
	}
};

export const upgradeUser = (accountAddress, role) => {
	return async (dispatch, getState) => {
		const client = getBcClient();
		try {
			const { pk } = await unlockWalletAccount();
			let funcName = "";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			if (!address) {
				throw new Error("contract address is not found");
			}
			if (role === "agent") {
				funcName = "RegisterAgent";
				console.log(role);
			} else if (role === "superagent") {
				funcName = "RegisterSuperAgent";
			}
			console.log(funcName);
			const p1 = new Parameter("account address", ParameterType.ByteArray, accountAddress);
			debugger;
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
