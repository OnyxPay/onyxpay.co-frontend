import React from "react";
import { Button, Popconfirm } from "antd";
import { getLocalTime } from "utils";
import { convertAmountToStr } from "utils/number";
import { requestStatus, operationMessageStatus } from "api/constants";
import Countdown from "../../Countdown";
import { h24Mc } from "api/constants";
import { styles } from "../../styles";
import { aa } from "../../common";

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

export default function renderPerformerColumns({
	activeRequestId,
	activeAction,
	walletAddress,
	acceptRequest,
	hideRequest,
	performRequest,
	cancelAcceptedRequest,
	requestsStatus, // active | closed
	requestsType, // deposit | withdraw | depositOnyxCash
	getColumnSearchProps,
	defaultFilterValue,
}) {
	if (requestsStatus === "active") {
		return [
			{
				title: "Id",
				dataIndex: "request.id",
				key: "requestId",
				...getColumnSearchProps("requestId"),
				filteredValue: defaultFilterValue ? [defaultFilterValue] : [],
			},
			{
				title: "Asset",
				dataIndex: "request.asset",
				key: "asset",
			},
			{
				title: "Amount",
				render: (text, record, index) => {
					return record.request ? convertAmountToStr(record.request.amount, 8) : null;
				},
			},
			{
				title: "Status",
				dataIndex: "request.status",
				render: (text, record, index) => {
					if (record.request) {
						if (isAnotherPerformerSelected(record, walletAddress)) {
							return "request wasn't selected";
						}
						return record.request.status;
					} else {
						return null;
					}
				},
			},
			{
				title: "Created",
				render: (text, record, index) => {
					return record.request ? getLocalTime(record.request.trx_timestamp) : null;
				},
			},
			{
				title: "Client",
				dataIndex: "sender.addr",
				render: (text, record, index) => {
					return record.request ? `${record.sender.first_name} ${record.sender.last_name}` : null;
				},
			},
			{
				title: "Countdown",
				render: (text, record, index) => {
					if (record.request) {
						return record.request.taker_addr &&
							record.request.taker_addr === walletAddress &&
							record.request.status !== requestStatus.complained &&
							record.request.choose_timestamp ? (
							<Countdown date={new Date(record.request.choose_timestamp).getTime() + h24Mc} />
						) : (
							"n/a"
						);
					} else {
						return null;
					}
				},
			},
			{
				title: "Actions",
				render: (text, record, index) => {
					if (!record.request) {
						return null;
					}
					const isAcceptActive =
						record.request.request_id === activeRequestId && activeAction === aa.accept;

					const isPerformActive =
						record.request.request_id === activeRequestId && activeAction === aa.perform;

					const isCancelAcceptedRequestActive =
						record.request.request_id === activeRequestId && activeAction === aa.cancelAccepted;

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
	} else {
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
					return record.request ? convertAmountToStr(record.request.amount, 8) : null;
				},
			},
			{
				title: "Status",
				dataIndex: "request.status",
				render: (text, record, index) => {
					if (record.request) {
						if (record.status_code === operationMessageStatus.canceled) {
							return "assets returned";
						}
						return record.request.status;
					} else {
						return null;
					}
				},
			},
			{
				title: "Created",
				render: (text, record, index) => {
					return record.request ? new Date(record.request.trx_timestamp).toLocaleString() : null;
				},
			},
			{
				title: "Client",
				dataIndex: "sender.addr",
				render: (text, record, index) => {
					return record.sender ? `${record.sender.first_name} ${record.sender.last_name}` : null;
				},
			},
		];
	}
}
