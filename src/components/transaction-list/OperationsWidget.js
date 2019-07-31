import React, { Component } from "react";
import { getOperationHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import TransactionsTable from "components/transaction-list/TransactionsTable";

const operationHistoryColumns = [
	{
		title: "Operation type",
		dataIndex: "operationType",
		key: "operationType",
		render: res => (res ? res : "n/a"),
	},
	{
		title: "From",
		dataIndex: "sender",
		key: "from",
		render: res => (res ? res.firstName + " " + res.lastName : "n/a"),
	},
	{
		title: "To",
		dataIndex: "receiver",
		key: "to",
		render: res => (res ? res.firstName + " " + res.lastName : "n/a"),
	},
	{
		title: "Date",
		dataIndex: "timestamp",
		key: "date",
		render: res => (res ? new Date(res).toLocaleString() : "n/a"),
	},
	{
		title: "Fee",
		dataIndex: "fee",
		key: "fee",
		render: res => (res ? convertAmountToStr(res, 8) : "n/a"),
	},
	{
		title: "Asset",
		dataIndex: "asset",
		key: "asset",
		render: res => (res ? res : "n/a"),
	},
	{
		title: "Amount",
		dataIndex: "amount",
		key: "amount",
		render: res => (res ? convertAmountToStr(res, 8) : "n/a"),
	},
];

class OperationsWidget extends Component {
	render() {
		return (
			<>
				<TransactionsTable
					columns={operationHistoryColumns}
					rowKey={"operationId"}
					dataFetchFunction={getOperationHistory}
				/>
			</>
		);
	}
}

export default OperationsWidget;
