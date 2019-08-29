import React from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { convertAmountToStr } from "utils/number";
import { getLocalTime, getPerformerName, is24hOver, is12hOver } from "utils";
import { h24Mc, operationMessageStatus, requestStatus } from "api/constants";
import Countdown from "components/Countdown";
import CancelRequest from "../../CancelRequest";
import { aa } from "../../common";
import { renderPerformBtn, isTimeUp } from "../index";
import { styles } from "../../styles";
import SupportLink from "components/SupportLink";

function punishForCancelation(trxCreated, thresholdToPunishInHr) {
	const timePassedMs = new Date().getTime() - new Date(trxCreated).getTime();
	const timePassedInHr = timePassedMs / (60 * 60 * 1000);
	return timePassedInHr < thresholdToPunishInHr;
}

function isAgentAccepted(operationMessages) {
	// check if at least one potential performer is accepted the request
	return operationMessages.some(mg => mg.statusCode === operationMessageStatus.accepted);
}

function renderComplainButton(record, handleComplain, isComplainActive) {
	let button;
	if (!is12hOver(record.chooseTimestamp)) {
		button = (
			<Button
				type="danger"
				onClick={() => handleComplain(record.requestId, false)} // can't complain
			>
				Complain
			</Button>
		);
	} else {
		if (isComplainActive) {
			button = (
				<Button type="danger" loading={isComplainActive} disabled={isComplainActive}>
					Complain
				</Button>
			);
		} else {
			button = (
				<Popconfirm
					title="Sure to complain?"
					cancelText="No"
					onConfirm={() => handleComplain(record.requestId, true)}
				>
					<Button type="danger" loading={isComplainActive} disabled={isComplainActive}>
						Complain
					</Button>
				</Popconfirm>
			);
		}
	}
	return button;
}

function renderCancelBtn(
	record,
	requestsType,
	cancelRequest,
	isComplainActive,
	isCancelRequestActive
) {
	let btn = null;

	const punish = punishForCancelation(record.trx_timestamp, 72);

	if (requestsType === "withdraw") {
		if (record.status === "opened") {
			btn = (
				<CancelRequest
					disabled={isComplainActive}
					isActionActive={isCancelRequestActive}
					handleCancel={e => {
						return cancelRequest(record.requestId);
					}}
					punish={punish}
				/>
			);
		}
	} else {
		if (
			record.status === "opened" ||
			(record.status === "choose" && !isTimeUp(record.chooseTimestamp, h24Mc))
		) {
			btn = (
				<CancelRequest
					disabled={isComplainActive}
					isActionActive={isCancelRequestActive}
					handleCancel={e => {
						return cancelRequest(record.requestId);
					}}
					punish={punish}
				/>
			);
		}
	}
	return btn;
}

export default function renderInitiatorColumns({
	activeRequestId,
	activeAction,
	modals,
	fetchData,
	showModal,
	handleComplain,
	requestsStatus, // active | closed
	requestsType, // deposit | withdraw | buy_onyx_cash
	showUserSettlementsModal,
	performRequest, // for withdraw
	cancelRequest,
	showSelectedUserDataModal,
}) {
	if (requestsStatus === "active") {
		return [
			{
				title: "Id",
				dataIndex: "id",
			},
			{
				title: "Asset",
				dataIndex: "asset",
			},
			{
				title: "Amount",
				render: (text, record, index) => {
					return convertAmountToStr(record.amount, 8);
				},
			},
			{
				title: "Status",
				dataIndex: "status",
				render: (text, record, index) => {
					if (record._isDisabled) return "wait...";
					if (record.takerAddr && record.statusCode === requestStatus.choose) {
						return "waiting for perform";
					}
					return record.status;
				},
			},
			{
				title: "Created",
				render: (text, record, index) => {
					return record.trx_timestamp ? getLocalTime(record.trx_timestamp) : "n/a";
				},
			},
			{
				title: "Performer",
				render: (text, record, index) => {
					return record.takerAddr && record.taker ? (
						<Button
							type="link"
							style={styles.btnLink}
							onClick={() => showSelectedUserDataModal(record.taker, "performer")}
						>
							{getPerformerName(record.takerAddr, record.taker)}
						</Button>
					) : (
						"n/a"
					);
				},
			},
			{
				title: "Settl. acc",
				render: (text, record, index) => {
					return record.taker ? (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.taker.id)}
							/>
						</Tooltip>
					) : (
						"n/a"
					);
				},
			},
			{
				title: "Countdown",
				render: (text, record, index) => {
					if (record._isDisabled) return "n/a";
					return record.takerAddr && record.chooseTimestamp && record.status !== "complained" ? (
						<Countdown date={new Date(record.chooseTimestamp).getTime() + h24Mc} />
					) : (
						"n/a"
					);
				},
			},
			{
				title: "Actions",
				render: (text, record, index) => {
					if (record.statusCode === requestStatus.complained) {
						return <SupportLink />;
					}

					if (record._isDisabled) return "n/a";

					const isComplainActive =
						record.requestId === activeRequestId && activeAction === aa.complain;

					const isPerformActive =
						record.requestId === activeRequestId && activeAction === aa.perform;

					const isCancelRequestActive =
						record.requestId === activeRequestId && activeAction === aa.cancel;

					return (
						<>
							{/* Send request to performers */}
							{record.status === "opened" && (
								<Button
									type="primary"
									disabled={isCancelRequestActive}
									onClick={showModal(modals.SEND_REQ_TO_AGENT, {
										requestId: record.id,
										isSendingMessage: true,
										openedRequestData: record,
									})}
								>
									{requestsType === "buy_onyx_cash" ? "Send to super-agents" : "Send to agents"}
								</Button>
							)}

							{/* Choose performer */}
							{record.operationMessages &&
								isAgentAccepted(record.operationMessages) &&
								record.status === "opened" && (
									<Button
										type="primary"
										disabled={isCancelRequestActive}
										onClick={showModal(modals.SEND_REQ_TO_AGENT, {
											requestId: record.requestId,
											isSendingMessage: false,
											openedRequestData: record,
											operationMessages: record.operationMessages.filter(
												msg => msg.statusCode === operationMessageStatus.accepted
											),
										})}
									>
										{requestsType === "buy_onyx_cash" ? "Choose super-agent" : "Choose agent"}
									</Button>
								)}
							{/* Cancel request */}
							{renderCancelBtn(
								record,
								requestsType,
								cancelRequest,
								isComplainActive,
								isCancelRequestActive
							)}

							{/* Complain on request */}
							{record.takerAddr &&
								record.chooseTimestamp &&
								!is24hOver(record.chooseTimestamp) &&
								renderComplainButton(record, handleComplain, isComplainActive)}

							{/* Perform withdraw request */}
							{requestsType === "withdraw" &&
								renderPerformBtn(record, performRequest, null, requestsType, isPerformActive)}
						</>
					);
				},
			},
		];
	} else {
		return [
			{
				title: "Id",
				dataIndex: "id",
			},
			{
				title: "Asset",
				dataIndex: "asset",
			},
			{
				title: "Amount",
				render: (text, record, index) => {
					return convertAmountToStr(record.amount, 8);
				},
			},
			{
				title: "Status",
				dataIndex: "status",
			},
			{
				title: "Created",
				render: (text, record, index) => {
					return new Date(record.trx_timestamp).toLocaleString();
				},
			},
			{
				title: "Performer",
				render: (text, record, index) => {
					return record.takerAddr && record.taker
						? getPerformerName(record.takerAddr, record.taker)
						: "n/a";
				},
			},
		];
	}
}
