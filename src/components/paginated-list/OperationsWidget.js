import React from "react";
import { getOperationHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import PaginatedTable from "./PaginatedTable";

const checkOperationType = operationType => {
	if (operationType === "buy_onyx_cash") {
		return "deposit onyxcash";
	}
	return operationType;
};

const operationHistoryColumns = [
	{
		title: "Operation type",
		dataIndex: "operationType",
		key: "operationType",
		render: operationType => (operationType ? checkOperationType(operationType) : "n/a"),
	},
	{
		title: "Initiator",
		dataIndex: "sender",
		key: "from",
		render: sender =>
			sender && (sender.firstName || sender.lastName)
				? sender.firstName + " " + sender.lastName
				: sender && sender.addr
				? sender.addr
				: "n/a",
	},
	{
		title: "Performer",
		dataIndex: "receiver",
		key: "to",
		render: receiver =>
			receiver && (receiver.firstName || receiver.firstName)
				? receiver.firstName + " " + receiver.lastName
				: receiver && receiver.addr
				? receiver.addr
				: "n/a",
	},
	{
		title: "Date",
		dataIndex: "timestamp",
		key: "date",
		render: timestamp => (timestamp ? new Date(timestamp).toLocaleString() : "n/a"),
	},
	{
		title: "Fee",
		dataIndex: "fee",
		key: "fee",
		render: fee => (fee ? convertAmountToStr(fee, 8) : "n/a"),
	},
	{
		title: "Asset",
		dataIndex: "asset",
		key: "asset",
		render: asset => (asset ? asset : "n/a"),
	},
	{
		title: "Amount",
		dataIndex: "amount",
		key: "amount",
		render: amount => (amount ? convertAmountToStr(amount, 8) : "n/a"),
	},
];

function OperationsWidget(props) {
	return (
		<>
			<PaginatedTable
				columns={operationHistoryColumns}
				rowKey="id"
				fetchData={getOperationHistory}
				// TODO: add pending status
				passedOpts={{ status: "completed" }}
				emptyTableMessage="You haven't performed any operations yet."
			/>
		</>
	);
}

export default OperationsWidget;
