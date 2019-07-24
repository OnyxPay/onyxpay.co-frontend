import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import { getExchangeHistory } from "../../api/transactions-history";

class ExchangeHistory extends Component {
	state = {
		pagination: { current: 1, pageSize: 10 },
		fetchingExchangeHistory: false,
		exchangeHistoryData: [],
	};

	componentDidMount = () => {
		this.fetchTransactionHistory();
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
			this.setState({ fetchingExchangeHistory: true });
			const res = await getExchangeHistory(params);
			if (!res.error) {
				pagination.total = res.total;
				this.setState({
					pagination,
					fetchingExchangeHistory: false,
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
				render: res => {
					console.log("inside", res);
					return res ? res : "n/a";
				},
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
					(res.amountToSell ? res.amountToSell : "n/a") +
					" " +
					(res.assetToSell ? res.assetToSell : "n/a"),
			},
			{
				title: "Bought Asset",
				dataIndex: "",
				key: "boughtAsset",
				render: res =>
					(res.amountToBuy ? res.amountToBuy : "n/a") +
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
					loading={this.state.fetchingExchangeHistory}
					locale={{ emptyText: "You haven't performed any exchange transactions yet." }}
				/>
			</>
		);
	}
}

export default connect()(ExchangeHistory);
