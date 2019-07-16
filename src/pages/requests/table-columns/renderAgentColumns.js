import React from "react";
import { Button, Popconfirm } from "antd";
import { convertAmountToStr } from "utils/number";
import { getLocalTime } from "utils";
import Countdown from "../Countdown";
import { h24Mc } from "api/constants";
import { styles } from "../styles";
import { requestStatus, operationMessageStatus } from "api/constants";

function isAnotherPerformerSelected(record, walletAddress) {
	if (
		(record.request.status_code === requestStatus.choose ||
			record.request.status_code === requestStatus.completed) &&
		record.request.taker_addr !== walletAddress
	) {
		return true;
	}
	return false;
}

function renderCancelBtn(record, handleCancel, walletAddress, isCancelAcceptedRequestActive) {
	const isAnotherSelected = isAnotherPerformerSelected(record, walletAddress);

	let btn;
	if (record.status === "accepted" && record.request.taker_addr !== walletAddress) {
		if (isCancelAcceptedRequestActive) {
			btn = (
				<Button type="danger" style={styles.btn} loading={true} disabled={true}>
					{isAnotherSelected ? "Return assets" : "Cancel acceptation"}
				</Button>
			);
		} else {
			btn = (
				<Popconfirm
					title={isAnotherSelected ? "Sure to return assets?" : "Sure to cancel acceptation?"}
					cancelText="No"
					onConfirm={() => handleCancel(record.request.request_id)}
				>
					<Button type="danger" style={styles.btn}>
						{isAnotherSelected ? "Return assets" : "Cancel acceptation"}
					</Button>
				</Popconfirm>
			);
		}
	} else {
		btn = null;
	}
	return btn;
}

export default function renderAgentColumns({
	activeRequestId,
	activeAction,
	walletAddress,
	acceptRequest,
	hideRequest,
	performRequest,
	cancelAcceptedRequest,
	requestsStatus = "active", // active | closed
	requestsType = "depositOrWithdraw", // deposit | withdraw | depositOnyxCash
	getColumnSearchProps,
	defaultFilterValue,
}) {
	if (requestsStatus === "active") {
		if (requestsType === "depositOrWithdraw") {
			return [
				{
					title: "Id",
					dataIndex: "request.id",
					key: "id",
					...getColumnSearchProps("id"),
					filteredValue: defaultFilterValue ? [defaultFilterValue] : [],
				},
				{
					title: "Asset",
					dataIndex: "request.asset",
				},
				{
					title: "Amount",
					render: (text, record, index) => {
						return convertAmountToStr(record.request.amount, 8);
					},
				},
				{
					title: "Status",
					dataIndex: "request.status",
					render: (text, record, index) => {
						if (isAnotherPerformerSelected(record, walletAddress)) {
							return "request wasn't selected";
						}
						return record.request.status;
					},
				},
				{
					title: "Created",
					render: (text, record, index) => {
						return getLocalTime(record.request.trx_timestamp);
					},
				},
				{
					title: "Client",
					dataIndex: "sender.addr",
					render: (text, record, index) => {
						return `${record.sender.first_name} ${record.sender.last_name}`;
					},
				},
				{
					title: "Countdown",
					render: (text, record, index) => {
						return record.request.taker_addr &&
							record.request.taker_addr === walletAddress &&
							record.request.status !== requestStatus.complained &&
							record.request.choose_timestamp ? (
							<Countdown date={new Date(record.request.choose_timestamp).getTime() + h24Mc} />
						) : (
							"n/a"
						);
					},
				},
				{
					title: "Actions",
					render: (text, record, index) => {
						const isAcceptActive =
							record.request.request_id === activeRequestId && activeAction === "accept";

						const isPerformActive =
							record.request.request_id === activeRequestId && activeAction === "perform";

						const isCancelAcceptedRequestActive =
							record.request.request_id === activeRequestId &&
							activeAction === "cancel_accepted_request";

						return (
							<>
								{record.status !== "accepted" &&
									(isAcceptActive ? (
										<Button type="primary" style={styles.btn} loading={true} disabled={true}>
											Accept
										</Button>
									) : (
										<Popconfirm
											title="Sure to accept?"
											onConfirm={() => acceptRequest(record.request.request_id)}
										>
											<Button type="primary" style={styles.btn}>
												Accept
											</Button>
										</Popconfirm>
									))}

								{record.status !== "accepted" &&
									(isAcceptActive || isCancelAcceptedRequestActive ? (
										<Button type="danger" style={styles.btn} disabled={true}>
											Hide
										</Button>
									) : (
										<Popconfirm
											title="Sure to hide?"
											onConfirm={() => hideRequest(record.id)} // messageId
										>
											<Button type="danger" style={styles.btn}>
												Hide
											</Button>
										</Popconfirm>
									))}

								{record.request.taker_addr === walletAddress &&
									record.request.status_code !== requestStatus.completed &&
									record.request.status_code !== requestStatus.complained &&
									(isPerformActive ? (
										<Button type="primary" style={styles.btn} loading={true} disabled={true}>
											Perform
										</Button>
									) : (
										<Popconfirm
											title="Sure to perform?"
											onConfirm={() => performRequest(record.request.request_id)}
										>
											<Button type="primary" style={styles.btn}>
												Perform
											</Button>
										</Popconfirm>
									))}

								{renderCancelBtn(
									record,
									cancelAcceptedRequest,
									walletAddress,
									isCancelAcceptedRequestActive
								)}
							</>
						);
					},
				},
			];
		}
	} else {
		if (requestsType === "depositOrWithdraw") {
			return [
				{
					title: "Id",
					dataIndex: "request.id",
				},
				{
					title: "Asset",
					dataIndex: "request.asset",
				},
				{
					title: "Amount",
					render: (text, record, index) => {
						return convertAmountToStr(record.request.amount, 8);
					},
				},
				{
					title: "Status",
					dataIndex: "request.status",
					render: (text, record, index) => {
						if (record.status_code === operationMessageStatus.canceled) {
							return "assets returned";
						}
						return record.request.status;
					},
				},
				{
					title: "Created",
					render: (text, record, index) => {
						return new Date(record.request.trx_timestamp).toLocaleString();
					},
				},
				{
					title: "Client",
					dataIndex: "sender.addr",
					render: (text, record, index) => {
						return `${record.sender.first_name} ${record.sender.last_name}`;
					},
				},
			];
		}
	}
}
