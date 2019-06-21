import { getRestClient, handleReqError, getAuthHeaders } from "../../api/network";
import { message } from "antd";
import { TransactionBuilder, Parameter, ParameterType, CONST, utils } from "ontology-ts-sdk";
import { gasPrice, cryptoAddress } from "../../utils/blockchain";
import { getBcClient } from "../../api/network";
import { unlockWalletAccount } from "../../api/wallet";
import { resolveContractAddress } from "../contracts";

const client = getRestClient();
const REQUESTS_DATA = "REQUESTS_DATA";
const REQUESTS_STATUS = "REQUESTS_STATUS";
const DELETE_REQUEST = "DELETE_REQUEST";

export const adminRequestsReducer = (state, action) => {
	switch (action.type) {
		case REQUESTS_DATA:
			return action.payload;
		case REQUESTS_STATUS:
			return state.map(request => {
				if (request.id === action.request_id) {
					return { ...request, status: "refused" };
				} else {
					return request;
				}
			});
		case DELETE_REQUEST:
			return state.filter(item => item.id !== action.payload);
		default:
			return state || null;
	}
};

export const saveRequests = requestsData => {
	return { type: REQUESTS_DATA, payload: requestsData };
};

export const getRequests = params => async dispatch => {
	const authHeaders = getAuthHeaders();
	try {
		const { data } = await client.get("/admin/upgrade-requests", {
			headers: {
				...authHeaders,
			},
			params: {
				...params,
			},
		});
		dispatch(saveRequests(data.items));
		return { requestsData: data };
	} catch (er) {
		return handleReqError(er);
	}
};

export const setRequestReject = (request_id, reason) => async dispatch => {
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

export const sentRequest = () => async () => {
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

export const upgradeUser = (userAccountAddress, role, id) => {
	return async dispatch => {
		const client = getBcClient();
		try {
			const { pk, accountAddress } = await unlockWalletAccount();
			let funcName = "";
			const address = await dispatch(resolveContractAddress("OnyxPay"));
			const userAddress = utils.reverseHex(cryptoAddress(userAccountAddress).toHexString());
			if (!address) {
				throw new Error("contract address is not found");
			}
			if (role === "agent") {
				funcName = "RegisterAgent";
			} else if (role === "superagent") {
				funcName = "RegisterSuperAgent";
			}
			const p1 = new Parameter("accountName", ParameterType.ByteArray, userAddress);
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
					message.success("User was successfully upgrade");
					deleteRequest(id);
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

export const deleteRequest = id => {
	return async dispatch => {
		const authHeader = getAuthHeaders();
		try {
			await client.delete(`admin/upgrade-request/${id}`, {
				headers: {
					...authHeader,
				},
			});
			dispatch({
				type: DELETE_REQUEST,
				payload: id,
			});
			message.success("Request was successfully deleted");
		} catch (error) {
			return handleReqError(error);
		}
	};
};
