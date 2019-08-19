import React from "react";
import { getExchangeHistory } from "../../api/transactions-history";
import { convertAmountToStr } from "../../utils/number";
import TransactionsTable from "components/transaction-list/TransactionsTable";

const exchangeHistoryColumns = [
	{
		title: "Transaction Hash",
		dataIndex: "trxHast",
		key: "transactionHash",
		render: trxHast => (trxHast ? trxHast : "n/a"),
	},
	{
		title: "Date",
		dataIndex: "timestamp",
		key: "date",
		render: timestamp => (timestamp ? new Date(timestamp).toLocaleString() : "n/a"),
	},
	{
		title: "Sold asset",
		dataIndex: "",
		key: "soldAsset",
		render: record =>
			(record.amountToSell ? convertAmountToStr(record.amountToSell, 8) : "n/a") +
			" " +
			(record.assetToSell ? record.assetToSell : "n/a"),
	},
	{
		title: "Bought Asset",
		dataIndex: "",
		key: "boughtAsset",
		render: record =>
			(record.amountToBuy ? convertAmountToStr(record.amountToBuy, 8) : "n/a") +
			" " +
			(record.assetToBuy ? record.assetToBuy : "n/a"),
	},
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
		render: status => (status ? status : "Completed"),
	},
];

function ExchangeHistory(props) {
	return (
		<>
			<TransactionsTable
				columns={exchangeHistoryColumns}
				rowKey={"trxHast"}
				fetchData={getExchangeHistory}
				emptyTableMessage={"You haven't performed any exchange transactions yet."}
				className="exchange-history-table"
			/>
		</>
	);
}

export default ExchangeHistory;
