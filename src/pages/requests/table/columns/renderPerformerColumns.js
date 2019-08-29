import React from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { getLocalTime } from "utils";
import { convertAmountToStr } from "utils/number";
import { requestStatus, operationMessageStatus } from "api/constants";
import Countdown from "components/Countdown";
import { h24Mc } from "api/constants";
import { aa } from "../../common";
import { renderPerformBtn, isTimeUp } from "../index";
import { styles } from "../../styles";
import SupportLink from "components/SupportLink";

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

	if (record.status === "accepted" && !record.request.takerAddr) {
		// performer are not selected
		buttonText =
			record.request.statusCode === requestStatus.rejected
				? "Return locked assets"
				: "Cancel confirmation";
		if (isCancelAcceptedRequestActive) {
			buttonType = "default";
		} else {
			confirmText = "Sure to cancel confirmation?";
			buttonType = "confirm";
		}
	} else if (record.status === "accepted" && isAnotherSelected && requestsType !== "withdraw") {
		// another is selected as performer of deposit (for withdraw this doesn't make sense)
		buttonText = "Return assets";
		if (isCancelAcceptedRequestActive) {
			buttonType = "default";
		} else {
			confirmText = "Sure to return assets?";
			buttonType = "confirm";
		}
	} else if (
		record.status === "accepted" &&
		record.request.takerAddr === walletAddress &&
		isTimeUp(record.request.chooseTimestamp, h24Mc) &&
		requestsType !== "withdraw"
	) {
		// deposit request is timed out ?
		buttonText = "Return assets";
		if (isCancelAcceptedRequestActive) {
			buttonType = "default";
		} else {
			confirmText = "Sure to return assets?";
			buttonType = "confirm";
		}
	} else if (
		record.status === "accepted" &&
		record.request.takerAddr === walletAddress &&
		record.request.statusCode === requestStatus.rejected &&
		requestsType !== "withdraw"
	) {
		// initiator canceled deposit request after performer was selected
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

function renderConfirmBtn(record, isConfirmActive, confirmRequest) {
	if (record.status !== "accepted" && record.request.statusCode !== requestStatus.choose) {
		if (isConfirmActive) {
			return (
				<Button type="primary" loading={true} disabled={true}>
					Confirm
				</Button>
			);
		} else {
			return (
				<Popconfirm
					title="Sure?"
					onConfirm={() =>
						confirmRequest(
							record.request.requestId,
							record.request.amount,
							record.request.asset,
							record.request.typeCode
						)
					}
				>
					<Button type="primary">Confirm</Button>
				</Popconfirm>
			);
		}
	}
	return null;
}

function renderHideBtn(
	record,
	hideRequest,
	requestsType,
	walletAddress,
	isConfirmActive,
	isCancelAcceptedRequestActive
) {
	if (
		(record.status !== "accepted" &&
			record.request &&
			record.request.statusCode !== requestStatus.choose) ||
		(record.request &&
			record.request.statusCode === requestStatus.choose &&
			record.request.takerAddr !== walletAddress &&
			requestsType === "withdraw")
	) {
		if (isConfirmActive || isCancelAcceptedRequestActive) {
			return (
				<Button type="danger" disabled={true}>
					Hide
				</Button>
			);
		} else {
			return (
				<Popconfirm
					title="Sure to hide?"
					onConfirm={() => hideRequest(record.id)} // messageId
				>
					<Button type="danger">Hide</Button>
				</Popconfirm>
			);
		}
	}
	return null;
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
	confirmRequest,
	showSelectedUserDataModal,
	showUserSettlementsModal,
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
					if (record._isDisabled) return "wait...";
					if (record.request) {
						if (isAnotherPerformerSelected(record, walletAddress)) {
							return "request wasn't selected";
						} else if (
							record.request.takerAddr &&
							record.request.statusCode === requestStatus.choose
						) {
							return "waiting for perform";
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
					if (record.sender) {
						return (
							<Button
								type="link"
								style={styles.btnLink}
								onClick={() => showSelectedUserDataModal(record.sender, "initiator")}
							>
								{`${record.sender.firstName} ${record.sender.lastName}`}
							</Button>
						);
					}
					return null;
				},
			},
			requestsType === "withdraw"
				? {
						title: "Settl. acc",
						render: (text, record, index) => {
							return record.sender ? (
								<Tooltip title="See settlement accounts">
									<Button
										shape="round"
										icon="account-book"
										onClick={e => showUserSettlementsModal(record.sender.id)}
									/>
								</Tooltip>
							) : null;
						},
				  }
				: { className: "hidden-column" },
			{
				title: "Countdown",
				render: (text, record, index) => {
					if (record._isDisabled) return "n/a";
					if (record.request) {
						return record.request.takerAddr &&
							record.request.takerAddr === walletAddress &&
							record.request.statusCode !== requestStatus.complained &&
							record.request.chooseTimestamp ? (
							<Countdown date={new Date(record.request.chooseTimestamp).getTime() + h24Mc} />
						) : null;
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
					} else if (record.request.statusCode === requestStatus.complained) {
						return <SupportLink />;
					}
					if (record._isDisabled) return "n/a";

					const isConfirmActive =
						record.request.requestId === activeRequestId && activeAction === aa.confirm;

					const isPerformActive =
						record.request.requestId === activeRequestId && activeAction === aa.perform;

					const isCancelAcceptedRequestActive =
						record.request.requestId === activeRequestId && activeAction === aa.cancelAccepted;

					return (
						<>
							{renderConfirmBtn(record, isConfirmActive, confirmRequest)}

							{renderHideBtn(
								record,
								hideRequest,
								requestsType,
								walletAddress,
								isConfirmActive,
								isCancelAcceptedRequestActive
							)}
							{renderPerformBtn(
								record,
								performRequest,
								walletAddress,
								requestsType,
								isPerformActive,
								true
							)}
							{renderCancelBtn(
								record,
								cancelAcceptedRequest,
								walletAddress,
								isCancelAcceptedRequestActive,
								requestsType
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
				title: "Customer",
				dataIndex: "sender.addr",
				render: (text, record, index) => {
					return record.sender ? `${record.sender.firstName} ${record.sender.lastName}` : null;
				},
			},
		];
	}
}
