import React, { Component } from "react";
import { Table } from "antd";
import { getExchangeHistory } from "../../api/transactions-history";
import { convertAmountToStr } from "../../utils/number";

class ExchangeHistory extends Component {
	state = {
		pagination: { current: 1, pageSize: 10 },
		exchangeHistoryData: [],
	};

	componentDidMount = () => {
		try {
			setInterval(() => {
				this.fetchTransactionHistory();
			}, 30000);
		} catch (e) {
			console.log(e);
		}
	};

	handleTableChange = async pagination => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchTransactionHistory();
			}
		);
	};

	fetchTransactionHistory = async (opts = {}) => {
		try {
			const { pagination } = this.state;

			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getExchangeHistory(params);
			if (!res.error) {
				pagination.total = res.total;
				this.setState({
					pagination,
					exchangeHistoryData: res.items,
				});
			}
		} catch (e) {}
	};

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
				<Table
					columns={exchangeHistoryColumns}
					dataSource={this.state.exchangeHistoryData}
					pagination={this.state.pagination}
					onChange={this.handleTableChange}
					locale={{ emptyText: "You haven't performed any exchange transactions yet." }}
				/>
			</>
		);
	}
}

export default ExchangeHistory;
