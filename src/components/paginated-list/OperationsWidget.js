import React from "react";
import { getOperationHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import PaginatedTable from "./PaginatedTable";
import { stringToUpperCase } from "utils";
import { roles } from "api/constants";

const checkOperationType = operationType => {
	if (operationType === "buy_onyx_cash") {
		return "Deposit OnyxCash";
	}
	return stringToUpperCase(operationType);
};

let commonColumns = [
	{
		title: "Operation",
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

const feeColumn = {
	title: "Fee",
	dataIndex: "fee",
	key: "fee",
	render: fee => {
		if (fee === 0) {
			return 0;
		} else if (fee) {
			return convertAmountToStr(fee, 8);
		} else {
			return "n/a";
		}
	},
};

const statusColumn = {
	title: "Status",
	dataIndex: "status",
	key: "status",
	render: status => (status ? stringToUpperCase(status) : "n/a"),
};

function OperationsWidget({ user }) {
	let operationHistoryColumns = [...commonColumns];

	if (user && user.role === roles.c) {
		operationHistoryColumns.push(feeColumn, statusColumn);
	} else if (user && (user.role === roles.a || user.role === roles.sa)) {
		operationHistoryColumns.push(statusColumn);
	}

	return (
		<>
			<PaginatedTable
				columns={operationHistoryColumns}
				rowKey="id"
				fetchData={getOperationHistory}
				passedOpts={{ status: "completed,wait" }}
				emptyTableMessage="You haven't performed any operations yet."
			/>
		</>
	);
}

export default OperationsWidget;
