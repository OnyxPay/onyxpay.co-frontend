import React from "react";
import { getOperationHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import PaginationTable from "./PaginationTable";

const operationHistoryColumns = [
	{
		title: "Operation type",
		dataIndex: "operationType",
		key: "operationType",
		render: operationType => (operationType ? operationType : "n/a"),
	},
	{
		title: "From",
		dataIndex: "sender",
		key: "from",
		render: sender => (sender ? sender.firstName + " " + sender.lastName : "n/a"),
	},
	{
		title: "To",
		dataIndex: "receiver",
		key: "to",
		render: receiver => (receiver ? receiver.firstName + " " + receiver.lastName : "n/a"),
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
			<PaginationTable
				columns={operationHistoryColumns}
				rowKey={"operationId"}
				fetchData={getOperationHistory}
				emptyTableMessage={"You haven't performed any operations yet."}
			/>
		</>
	);
}

export default OperationsWidget;
