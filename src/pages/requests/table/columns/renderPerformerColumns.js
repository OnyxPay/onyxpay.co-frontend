import React from "react";
import { Button, Popconfirm } from "antd";
import { getLocalTime } from "utils";
import { convertAmountToStr } from "utils/number";
import { requestStatus, operationMessageStatus } from "api/constants";
import Countdown from "components/Countdown";
import { h24Mc } from "api/constants";
import { aa } from "../../common";
import { renderPerformBtn, isTimeUp } from "../index";

function isAnotherPerformerSelected(record, walletAddress) {
	if (
		(record.request.statusCode === requestStatus.choose ||
			record.request.statusCode === requestStatus.completed) &&
		record.request.takerAddr !== walletAddress
	) {
		return true;
	}
	return false;
}

function renderCancelBtn(
	record,
	handleCancel,
	walletAddress,
	isCancelAcceptedRequestActive,
	requestsType
) {
	const isAnotherSelected = isAnotherPerformerSelected(record, walletAddress);
	let buttonText;
	let confirmText;
	let buttonType;

	if (record.status === "accepted" && record.request.takerAddr !== walletAddress) {
		buttonText = isAnotherSelected ? "Return assets" : "Cancel acceptation";
		if (isCancelAcceptedRequestActive) {
			buttonType = "default";
		} else {
			confirmText = isAnotherSelected ? "Sure to return assets?" : "Sure to cancel acceptation?";
			buttonType = "confirm";
		}
	} else if (
		record.status === "accepted" &&
		record.request.takerAddr === walletAddress &&
		isTimeUp(record.request.chooseTimestamp, h24Mc)
	) {
		buttonText = "Return assets";
		if (isCancelAcceptedRequestActive) {
			buttonType = "default";
		} else {
			confirmText = "Sure to return assets?";
			buttonType = "confirm";
		}
	} else {
		return null;
	}

	if (buttonType === "confirm") {
		return (
			<Popconfirm
				title={confirmText}
				cancelText="No"
				onConfirm={() => handleCancel(record.request.requestId)}
			>
				<Button type="danger">{buttonText}</Button>
			</Popconfirm>
		);
	} else {
		return (
			<Button type="danger" loading={true} disabled={true}>
				{buttonText}
			</Button>
		);
	}
}

export default function renderPerformerColumns({
	activeRequestId,
	activeAction,
	walletAddress,
	hideRequest,
	performRequest,
	cancelAcceptedRequest,
	requestsStatus, // active | closed
	requestsType, // deposit | withdraw | depositOnyxCash
	getColumnSearchProps,
	defaultFilterValue,
	acceptRequest,
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
					return record.request ? `${record.sender.firstName} ${record.sender.lastName}` : null;
				},
			},
			{
				title: "Countdown",
				render: (text, record, index) => {
					if (record.request) {
						return record.request.takerAddr &&
							record.request.takerAddr === walletAddress &&
							record.request.status !== requestStatus.complained &&
							record.request.chooseTimestamp ? (
							<Countdown date={new Date(record.request.chooseTimestamp).getTime() + h24Mc} />
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
						record.request.requestId === activeRequestId && activeAction === aa.accept;

					const isPerformActive =
						record.request.requestId === activeRequestId && activeAction === aa.perform;

					const isCancelAcceptedRequestActive =
						record.request.requestId === activeRequestId && activeAction === aa.cancelAccepted;

					return (
						<>
							{record.status !== "accepted" &&
								(isAcceptActive ? (
									<Button type="primary" loading={true} disabled={true}>
										Accept
									</Button>
								) : (
									<Popconfirm
										title="Sure to accept?"
										onConfirm={() =>
											acceptRequest(
												record.request.requestId,
												record.request.amount,
												record.request.asset
											)
										}
									>
										<Button type="primary">Accept</Button>
									</Popconfirm>
								))}

							{record.status !== "accepted" &&
								(isAcceptActive || isCancelAcceptedRequestActive ? (
									<Button type="danger" disabled={true}>
										Hide
									</Button>
								) : (
									<Popconfirm
										title="Sure to hide?"
										onConfirm={() => hideRequest(record.id)} // messageId
									>
										<Button type="danger">Hide</Button>
									</Popconfirm>
								))}

							{renderPerformBtn(
								record,
								performRequest,
								walletAddress,
								requestsType,
								isPerformActive
							)}
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
						if (record.statusCode === operationMessageStatus.canceled) {
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
					return record.sender ? `${record.sender.firstName} ${record.sender.lastName}` : null;
				},
			},
		];
	}
}
