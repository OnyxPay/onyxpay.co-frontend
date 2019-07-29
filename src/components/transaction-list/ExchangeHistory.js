import React, { Component } from "react";
import { getExchangeHistory } from "../../api/transactions-history";
import { convertAmountToStr } from "../../utils/number";
import TransactionsTable from "components/transaction-list/TransactionsTable";

class ExchangeHistory extends Component {
	render() {
		const exchangeHistoryColumns = [
			{
				title: "Transaction Hash",
				dataIndex: "trxHast",
				key: "transactionHash",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Date",
				dataIndex: "timestamp",
				key: "date",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Sold asset",
				dataIndex: "",
				key: "soldAsset",
				render: res =>
					(res.amountToSell ? convertAmountToStr(res.amountToSell, 8) : "n/a") +
					" " +
					(res.assetToSell ? res.assetToSell : "n/a"),
			},
			{
				title: "Bought Asset",
				dataIndex: "",
				key: "boughtAsset",
				render: res =>
					(res.amountToBuy ? convertAmountToStr(res.amountToBuy, 0) : "n/a") +
					" " +
					(res.assetToBuy ? res.assetToBuy : "n/a"),
			},
			{
				title: "Status",
				dataIndex: "statusCode",
				key: "status",
				render: res => (res ? res : "Unknown"),
			},
		];

		return (
			<>
				<TransactionsTable
					columns={exchangeHistoryColumns}
					dataFetchFunction={getExchangeHistory}
				/>
			</>
		);
	}
}

export default ExchangeHistory;
