import React from "react";
import { Button, Popconfirm } from "antd";
import { convertAmountToStr } from "utils/number";
import { getLocalTime } from "utils";
import Countdown from "../Countdown";
import { h24Mc } from "api/constants";
import { styles } from "../styles";

export default function renderAgentColumns({
	activeRequestId,
	activeAction,
	walletAddress,
	acceptRequest,
	hideRequest,
	performRequest,
	cancelAcceptedRequest,
}) {
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
							record.request.status !== "completed" &&
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

						{record.status === "accepted" &&
							record.request.taker_addr !== walletAddress &&
							(isCancelAcceptedRequestActive ? (
								<Button type="danger" style={styles.btn} loading={true} disabled={true}>
									Cancel acceptation
								</Button>
							) : (
								<Popconfirm
									title="Sure to cancel acceptation?"
									cancelText="No"
									onConfirm={() => cancelAcceptedRequest(record.request.request_id)}
								>
									<Button type="danger" style={styles.btn}>
										Cancel acceptation
									</Button>
								</Popconfirm>
							))}
					</>
				);
			},
		},
	];
}
